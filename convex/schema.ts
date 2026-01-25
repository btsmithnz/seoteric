import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sites: defineTable({
    name: v.string(),
    domain: v.string(),
    userId: v.string(),
    country: v.optional(v.string()),
    industry: v.optional(v.string()),
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
});
