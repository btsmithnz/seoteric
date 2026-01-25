import { ConvexError, v } from "convex/values";
import {
  httpAction,
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { internal } from "./_generated/api";
import { seoAgent } from "@/ai/seo";
import { convertToModelMessages, streamText, UIMessage } from "ai";
import { Id } from "./_generated/dataModel";

export const generateChatNameInternal = internalAction({
  args: { chatId: v.id("chats"), message: v.string() },
  handler: async (ctx, args) => {
    const name = await streamText({
      model: "anthropic/claude-haiku-4.5",
      system:
        "You get a message from a user and you need to generate a short and relevant name (max 5 words) for the chat - it should help people understand the purpose of the chat. Just return the name - don't respond to their message at all.",
      prompt: args.message,
    }).text;

    await ctx.runMutation(internal.chat.updateChatNameInternal, {
      chatId: args.chatId,
      name,
    });
  },
});

export const create = mutation({
  args: {
    siteId: v.id("sites"),
    name: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const chatId = await ctx.db.insert("chats", {
      siteId: args.siteId,
      name: args.name,
    });
    await ctx.db.insert("messages", {
      chatId,
      init: args.message,
      messages: [],
    });
    await ctx.scheduler.runAfter(0, internal.chat.generateChatNameInternal, {
      chatId,
      message: args.message,
    });
    return chatId;
  },
});

export const list = query({
  args: { siteId: v.id("sites"), paginationOpts: paginationOptsValidator },
  handler: (ctx, args) => {
    return ctx.db
      .query("chats")
      .withIndex("by_site", (q) => q.eq("siteId", args.siteId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getWithMessages = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .first();

    if (!chat || !messages) {
      throw new ConvexError("Chat not found");
    }

    return {
      ...chat,
      initialMessage: messages.init,
      messages: messages.messages,
    };
  },
});

export const updateChatNameInternal = internalMutation({
  args: { chatId: v.id("chats"), name: v.string() },
  handler: async (ctx, args) => {
    return ctx.db.patch("chats", args.chatId, {
      name: args.name,
    });
  },
});

export const updateChatMessagesInternal = internalMutation({
  args: { chatId: v.id("chats"), messages: v.array(v.any()) },
  handler: async (ctx, args) => {
    const current = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .first();

    if (!current) {
      throw new ConvexError("Chat not found");
    }

    return ctx.db.patch("messages", current._id, {
      messages: args.messages,
    });
  },
});

export const seoChat = httpAction(async (ctx, req) => {
  const { id: chatId, messages }: { id: Id<"chats">; messages: UIMessage[] } =
    await req.json();

  const res = await seoAgent.stream({
    messages: await convertToModelMessages(messages),
  });

  return res.toUIMessageStreamResponse({
    headers: {
      "Access-Control-Allow-Origin": process.env.SITE_URL!,
      Vary: "origin",
    },
    originalMessages: messages,
    onFinish: async ({ messages }) => {
      await ctx.runMutation(internal.chat.updateChatMessagesInternal, {
        chatId,
        messages,
      });
    },
  });
});
