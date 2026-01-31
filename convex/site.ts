import { v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { getUser } from "./utils";
import { Id } from "./_generated/dataModel";

export async function getSite(ctx: QueryCtx | MutationCtx, siteId: Id<"sites">) {
  const user = await getUser(ctx);
  const site = await ctx.db.get(siteId);
  if (!site || site.userId !== user._id) {
    throw new Error("Site not found");
  }
  return site;
}

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

export const get = query({
  args: { siteId: v.id("sites") },
  handler: async (ctx, args) => {
    return getSite(ctx, args.siteId);
  },
});

export const update = mutation({
  args: {
    siteId: v.id("sites"),
    name: v.string(),
    domain: v.string(),
    country: v.string(),
    industry: v.string(),
  },
  handler: async (ctx, args) => {
    const site = await getSite(ctx, args.siteId);
    await ctx.db.patch(site._id, {
      name: args.name,
      domain: args.domain,
      country: args.country,
      industry: args.industry,
    });
    return args.siteId;
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
