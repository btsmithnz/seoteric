import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { recommendationsFields } from "./schema";
import { getSite } from "./site";

export const PRIORITY_ORDER = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const listBySite = query({
  args: { siteId: v.id("sites") },
  handler: async (ctx, args) => {
    const site = await getSite(ctx, args.siteId);
    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_site", (q) => q.eq("siteId", site._id))
      .collect();

    return recommendations.sort((a, b) => {
      if (a.status !== b.status) {
        const statusOrder = {
          open: 0,
          in_progress: 1,
          completed: 2,
          dismissed: 3,
        };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("recommendations"),
    status: recommendationsFields.status,
  },
  handler: async (ctx, args) => {
    const updates: {
      status: typeof args.status;
      completedAt?: number;
    } = { status: args.status };

    if (args.status === "completed" || args.status === "dismissed") {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.id, updates);
  },
});

export const createInternal = internalMutation({
  args: {
    siteId: recommendationsFields.siteId,
    title: recommendationsFields.title,
    description: recommendationsFields.description,
    category: recommendationsFields.category,
    priority: recommendationsFields.priority,
    pageUrl: recommendationsFields.pageUrl,
  },
  handler: (ctx, args) => {
    return ctx.db.insert("recommendations", {
      ...args,
      status: "open",
    });
  },
});

export const updateInternal = internalMutation({
  args: {
    id: v.id("recommendations"),
    status: v.optional(recommendationsFields.status),
    priority: v.optional(recommendationsFields.priority),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
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
      await ctx.db.patch(id, filteredUpdates);
    }
  },
});
