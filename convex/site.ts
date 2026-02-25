import { generateText, Output } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { dataforseoGet } from "@/lib/dataforseo";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { assertCanCreateSiteForUser } from "./billing";
import { getUser } from "./utils";

interface DfsLocation {
  location_code: number;
  location_name: string;
  location_type: string;
}

interface DfsLocationsResponse {
  tasks: Array<{ result: DfsLocation[] | null }>;
}

export async function getSite(
  ctx: QueryCtx | MutationCtx,
  siteId: Id<"sites">
) {
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
  handler: (ctx, args) => {
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
    location: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const site = await getSite(ctx, args.siteId);
    await ctx.db.patch(site._id, {
      name: args.name,
      domain: args.domain,
      country: args.country,
      industry: args.industry,
      location: args.location,
      latitude: args.latitude,
      longitude: args.longitude,
    });
    await ctx.scheduler.runAfter(0, internal.site.resolveGoogleLocation, {
      siteId: site._id,
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
    location: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    await assertCanCreateSiteForUser(ctx, user);

    const siteId = await ctx.db.insert("sites", { ...args, userId: user._id });
    await ctx.scheduler.runAfter(0, internal.site.resolveGoogleLocation, {
      siteId,
    });

    return siteId;
  },
});

export const getById = internalQuery({
  args: { siteId: v.id("sites") },
  handler: (ctx, { siteId }) => ctx.db.get(siteId),
});

export const patchGoogleLocationId = internalMutation({
  args: { siteId: v.id("sites"), googleLocationId: v.number() },
  handler: async (ctx, { siteId, googleLocationId }) => {
    await ctx.db.patch(siteId, { googleLocationId });
  },
});

export const resolveGoogleLocation = internalAction({
  args: { siteId: v.id("sites") },
  handler: async (ctx, { siteId }) => {
    const site = await ctx.runQuery(internal.site.getById, { siteId });
    if (!site) {
      return;
    }

    const data = await dataforseoGet<DfsLocationsResponse>(
      `/serp/google/locations/${site.country.toLowerCase()}`
    );

    const locations = (data.tasks?.[0]?.result ?? []).filter((l) =>
      ["Country", "State", "City", "DMA Region"].includes(l.location_type)
    );

    if (locations.length === 0) {
      return;
    }

    const { output } = await generateText({
      model: "anthropic/claude-haiku-4.5",
      output: Output.object({
        schema: z.object({ location_code: z.number() }),
      }),
      prompt: `Select the most specific DataForSEO location_code for a website based in "${site.country}"${site.location ? ` with location "${site.location}"` : ""}. Prefer City or State over Country. Available locations: ${JSON.stringify(locations.map((l) => ({ code: l.location_code, name: l.location_name, type: l.location_type })))}`,
    });

    await ctx.runMutation(internal.site.patchGoogleLocationId, {
      siteId,
      googleLocationId: output.location_code,
    });
  },
});
