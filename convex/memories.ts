import { embed } from "ai";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";

export const upsertMemory = internalAction({
  args: {
    siteId: v.id("sites"),
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const { embedding } = await embed({
      model: "openai/text-embedding-3-small",
      value: `${args.key}: ${args.value}`,
    });

    await ctx.runMutation(internal.memories.upsertMemoryInternal, {
      siteId: args.siteId,
      key: args.key,
      value: args.value,
      embedding,
    });
  },
});

export const upsertMemoryInternal = internalMutation({
  args: {
    siteId: v.id("sites"),
    key: v.string(),
    value: v.string(),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("memories")
      .withIndex("by_site_key", (q) =>
        q.eq("siteId", args.siteId).eq("key", args.key)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        embedding: args.embedding,
      });
    } else {
      await ctx.db.insert("memories", {
        siteId: args.siteId,
        key: args.key,
        value: args.value,
        embedding: args.embedding,
      });
    }
  },
});

export const saveMemory = action({
  args: {
    siteId: v.id("sites"),
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runAction(internal.memories.upsertMemory, args);
  },
});

export const searchMemories = action({
  args: {
    siteId: v.id("sites"),
    query: v.string(),
  },
  returns: v.array(v.object({ key: v.string(), value: v.string() })),
  handler: async (ctx, args): Promise<{ key: string; value: string }[]> => {
    const { embedding } = await embed({
      model: "openai/text-embedding-3-small",
      value: args.query,
    });

    const results = await ctx.vectorSearch("memories", "by_embedding", {
      vector: embedding,
      limit: 16,
      filter: (q) => q.eq("siteId", args.siteId),
    });

    const docs = await ctx.runQuery(internal.memories.fetchResults, {
      ids: results.map((r) => r._id),
    });

    return docs
      .filter((doc) => doc !== null)
      .map((doc) => ({ key: doc.key, value: doc.value }));
  },
});

export const fetchResults = internalQuery({
  args: { ids: v.array(v.id("memories")) },
  handler: async (ctx, args) => {
    const docs = await Promise.all(args.ids.map((id) => ctx.db.get(id)));
    return docs.filter(Boolean);
  },
});

export const listByKey = internalQuery({
  args: {
    siteId: v.id("sites"),
    key: v.string(),
  },
  handler: (ctx, args) => {
    return ctx.db
      .query("memories")
      .withIndex("by_site_key", (q) =>
        q.eq("siteId", args.siteId).eq("key", args.key)
      )
      .collect();
  },
});
