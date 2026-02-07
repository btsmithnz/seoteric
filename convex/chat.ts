import { streamText } from "ai";
import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import type {
  CreateRecommendationOutput,
  UpdateRecommendationOutput,
} from "@/ai/tools/recommendations";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { PRIORITY_ORDER } from "./recommendations";
import { getSite } from "./site";

async function getChatSite(ctx: QueryCtx | MutationCtx, chatId: Id<"chats">) {
  const chat = await ctx.db.get("chats", chatId);
  if (!chat) {
    return null;
  }
  const site = await getSite(ctx, chat.siteId);
  if (!site) {
    return null; // User doesn't have access to site
  }
  return { chat, site };
}

async function getChatSlugSite(ctx: QueryCtx | MutationCtx, slug: string) {
  const chat = await ctx.db
    .query("chats")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
  if (!chat) {
    return null;
  }
  const site = await getSite(ctx, chat.siteId);
  if (!site) {
    return null; // User doesn't have access to site
  }
  return { chat, site };
}

export const updateChatNameInternal = internalMutation({
  args: { chatId: v.id("chats"), name: v.string() },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);

    if (!chat) {
      throw new ConvexError("Chat not found");
    }

    return ctx.db.patch("chats", chat._id, {
      name: args.name,
    });
  },
});

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

export const list = query({
  args: { siteId: v.id("sites"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const site = await getSite(ctx, args.siteId);
    return ctx.db
      .query("chats")
      .withIndex("by_site", (q) => q.eq("siteId", site._id))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getSafe = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    try {
      const res = await getChatSlugSite(ctx, args.slug);
      return res?.chat ?? null;
    } catch {
      return null;
    }
  },
});

export const getWithMessages = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const res = await getChatSlugSite(ctx, args.slug);

    if (!res) {
      throw new ConvexError("Chat not found.");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", res.chat._id))
      .first();

    if (!messages) {
      throw new ConvexError("Unable to load chat."); // This should never happen
    }

    return {
      ...res.chat,
      messages: messages.messages,
    };
  },
});

export const generateChatContext = mutation({
  args: { siteId: v.id("sites"), slug: v.string(), initialMessage: v.string() },
  handler: async (ctx, args) => {
    // Verify access to site
    const site = await getSite(ctx, args.siteId);

    // Check if the chat already exists
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("siteId"), args.siteId))
      .first();
    let chatId = chat?._id;

    // If the chat doesn't exist, create it, and generate a name for it
    if (!chatId) {
      chatId = await ctx.db.insert("chats", {
        siteId: args.siteId,
        slug: args.slug,
        name: "New Chat",
      });
      await ctx.db.insert("messages", {
        chatId,
        messages: [],
      });
      await ctx.scheduler.runAfter(0, internal.chat.generateChatNameInternal, {
        chatId,
        message: args.initialMessage,
      });
    }

    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_site", (q) => q.eq("siteId", site._id))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "open"),
          q.eq(q.field("status"), "in_progress")
        )
      )
      .collect();
    recommendations.sort(
      (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    );

    return {
      chatId,
      site,
      recommendations,
    };
  },
});

export const updateChatState = mutation({
  args: {
    chatId: v.id("chats"),
    messages: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const res = await getChatSite(ctx, args.chatId);

    if (!res) {
      return;
    }

    const current = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", res.chat._id))
      .first();

    if (!current) {
      throw new ConvexError("Chat not found");
    }

    await ctx.db.patch("messages", current._id, {
      messages: args.messages,
    });

    for (const message of args.messages) {
      if (message.role !== "assistant") {
        continue;
      }
      for (const part of message.parts) {
        if (
          part.type === "tool-createRecommendation" &&
          part.state === "output-available"
        ) {
          const output = part.output as CreateRecommendationOutput;
          await ctx.db.insert("recommendations", {
            siteId: res.site._id,
            title: output.title,
            description: output.description,
            category: output.category,
            priority: output.priority,
            pageUrl: output.pageUrl,
            status: "open",
          });
        } else if (
          part.type === "tool-updateRecommendation" &&
          part.state === "output-available"
        ) {
          const output = part.output as UpdateRecommendationOutput;
          await ctx.runMutation(internal.recommendations.updateInternal, {
            id: output.recommendationId as Id<"recommendations">,
            status: output.status,
            priority: output.priority,
          });
        }
      }
    }
  },
});
