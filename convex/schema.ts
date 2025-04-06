import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  profiles: defineTable({
    name: v.string(),
    bio: v.optional(v.string()),
    imageUrl: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
    userId: v.string(),
  }).index("by_userId", ["userId"]),
  numbers: defineTable({
    value: v.number(),
  }),
});
