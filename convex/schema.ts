import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const sitesFields = {
  name: v.string(),
  domain: v.string(),
  userId: v.string(),
  country: v.string(),
  industry: v.string(),
};

export const chatsFeilds = {
  slug: v.string(),
  siteId: v.id("sites"),
  name: v.string(),
};

export const messagesFields = {
  chatId: v.id("chats"),
  messages: v.array(v.any()),
};

export const recommendationsFields = {
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
  status: v.union(
    v.literal("open"),
    v.literal("in_progress"),
    v.literal("completed"),
    v.literal("dismissed")
  ),
  pageUrl: v.optional(v.string()),
  completedAt: v.optional(v.number()),
};

export const billingProfilesFields = {
  userId: v.string(),
  lastPaidAnchorMs: v.number(),
};

export const usageBucketsFields = {
  userId: v.string(),
  cycleStartMs: v.number(),
  cycleEndMs: v.number(),
  messagesUsed: v.number(),
  pageSpeedReportsUsed: v.number(),
};

export default defineSchema({
  sites: defineTable(sitesFields)
    .index("by_user", ["userId"])
    .index("by_domain", ["domain"]),
  chats: defineTable(chatsFeilds)
    .index("by_slug", ["slug"])
    .index("by_site", ["siteId"]),
  messages: defineTable(messagesFields).index("by_chat", ["chatId"]),
  recommendations: defineTable(recommendationsFields)
    .index("by_site", ["siteId"])
    .index("by_site_status", ["siteId", "status"]),
  billingProfiles: defineTable(billingProfilesFields).index("by_user", [
    "userId",
  ]),
  usageBuckets: defineTable(usageBucketsFields)
    .index("by_user_cycle_start", ["userId", "cycleStartMs"])
    .index("by_user", ["userId"]),
});
