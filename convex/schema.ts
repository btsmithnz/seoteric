import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sites: defineTable({
    name: v.string(),
    domain: v.string(),
    userId: v.string(),
    country: v.string(),
    industry: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_domain", ["domain"]),
  chats: defineTable({
    siteId: v.id("sites"),
    name: v.string(),
  }).index("by_site", ["siteId"]),
  messages: defineTable({
    chatId: v.id("chats"),
    init: v.optional(v.string()),
    messages: v.array(v.any()),
  }).index("by_chat", ["chatId"]),
  recommendations: defineTable({
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
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_site", ["siteId"])
    .index("by_site_status", ["siteId", "status"]),
});
