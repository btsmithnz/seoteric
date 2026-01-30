import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";

const priorityOrder = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const listBySite = query({
  args: { siteId: v.id("sites") },
  handler: async (ctx, args) => {
    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_site", (q) => q.eq("siteId", args.siteId))
      .collect();

    return recommendations.sort((a, b) => {
      if (a.status !== b.status) {
        const statusOrder = { open: 0, in_progress: 1, completed: 2, dismissed: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  },
});

export const updateStatus = mutation({
  args: {
    recommendationId: v.id("recommendations"),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("dismissed")
    ),
  },
  handler: async (ctx, args) => {
    const updates: {
      status: typeof args.status;
      completedAt?: number;
    } = { status: args.status };

    if (args.status === "completed" || args.status === "dismissed") {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.recommendationId, updates);
  },
});

export const getOpenBySiteInternal = internalQuery({
  args: { siteId: v.id("sites") },
  handler: async (ctx, args) => {
    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_site", (q) => q.eq("siteId", args.siteId))
      .collect();

    return recommendations
      .filter((r) => r.status === "open" || r.status === "in_progress")
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  },
});

export const createInternal = internalMutation({
  args: {
    siteId: v.id("sites"),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("technical"),
      v.literal("content"),
      v.literal("on-page"),
      v.literal("off-page"),
      v.literal("performance")
    ),
    priority: v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    pageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("recommendations", {
      ...args,
      status: "open",
      createdAt: Date.now(),
    });
  },
});

export const updateInternal = internalMutation({
  args: {
    recommendationId: v.id("recommendations"),
    status: v.optional(
      v.union(
        v.literal("open"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("dismissed")
      )
    ),
    priority: v.optional(
      v.union(
        v.literal("critical"),
        v.literal("high"),
        v.literal("medium"),
        v.literal("low")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { recommendationId, ...updates } = args;
    const filteredUpdates: Record<string, unknown> = {};

    if (updates.status !== undefined) {
      filteredUpdates.status = updates.status;
      if (updates.status === "completed" || updates.status === "dismissed") {
        filteredUpdates.completedAt = Date.now();
      }
    }
    if (updates.priority !== undefined) {
      filteredUpdates.priority = updates.priority;
    }

    if (Object.keys(filteredUpdates).length > 0) {
      await ctx.db.patch(recommendationId, filteredUpdates);
    }
  },
});
