import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getUser } from "./utils";

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);

    const sites = await ctx.db
      .query("sites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    return sites;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    domain: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);

    const siteId = await ctx.db.insert("sites", { ...args, userId: user._id });

    return siteId;
  },
});
