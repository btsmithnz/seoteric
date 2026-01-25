import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUser } from "./utils";

export const list = query({
  handler: async (ctx) => {
    const user = await getUser(ctx);

    const sites = await ctx.db
      .query("sites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return sites;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    domain: v.string(),
    country: v.string(),
    industry: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);

    const siteId = await ctx.db.insert("sites", { ...args, userId: user._id });

    return siteId;
  },
});
