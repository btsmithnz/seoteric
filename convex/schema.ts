import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sites: defineTable({
    name: v.string(),
    domain: v.string(),
    userId: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_domain", ["domain"]),
});
