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
  userStatus: defineTable({
    userId: v.string(),
    isOnline: v.boolean(),
    currentActivity: v.optional(v.string()),
    lastPing: v.number(),
    inSession: v.optional(v.boolean()),
    sessionPartnerId: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isAudioEnabled: v.optional(v.boolean()),
    rtcPeerId: v.optional(v.string()),
    isScreenSharing: v.optional(v.boolean()),
    screenShareId: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_online", ["isOnline"])
    .index("by_lastPing", ["lastPing"]),
  numbers: defineTable({
    value: v.number(),
  }),
  pairingRequests: defineTable({
    fromUserId: v.string(),
    toUserId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
    ),
    createdAt: v.number(),
    currentActivity: v.string(),
    tags: v.array(v.string()),
  })
    .index("by_to_user", ["toUserId"])
    .index("by_from_user", ["fromUserId"])
    .index("by_status", ["status"]),
  messages: defineTable({
    content: v.string(),
    userId: v.string(),
    sessionId: v.string(),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_timestamp", ["createdAt"]),
});
