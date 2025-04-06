import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Update user's online status and current activity
export const updateStatus = mutation({
  args: {
    isOnline: v.boolean(),
    currentActivity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const baseUserId = identity.subject.split("|")[0];
    const now = Date.now();

    const existingStatus = await ctx.db
      .query("userStatus")
      .filter((q) => q.eq(q.field("userId"), baseUserId))
      .first();

    if (existingStatus) {
      return await ctx.db.patch(existingStatus._id, {
        isOnline: args.isOnline,
        currentActivity: args.currentActivity,
        lastPing: now,
      });
    } else {
      return await ctx.db.insert("userStatus", {
        userId: baseUserId,
        isOnline: args.isOnline,
        currentActivity: args.currentActivity,
        lastPing: now,
        inSession: false,
      });
    }
  },
});

// Ping to keep user online
export const ping = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return;
    }

    const baseUserId = identity.subject.split("|")[0];
    const now = Date.now();

    const existingStatus = await ctx.db
      .query("userStatus")
      .filter((q) => q.eq(q.field("userId"), baseUserId))
      .first();

    if (existingStatus && existingStatus.isOnline) {
      await ctx.db.patch(existingStatus._id, {
        lastPing: now,
      });
    }
  },
});

// Get online users with their profiles
export const getOnlineUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const baseUserId = identity.subject.split("|")[0];
    const now = Date.now();
    const TIMEOUT = 30000; // 30 seconds

    // Get all online users who have pinged recently
    const onlineStatuses = await ctx.db
      .query("userStatus")
      .filter((q) =>
        q.and(
          q.eq(q.field("isOnline"), true),
          q.gt(q.field("lastPing"), now - TIMEOUT),
          q.eq(q.field("inSession"), false),
        ),
      )
      .collect();

    // Get profiles for online users
    const onlineUsers = await Promise.all(
      onlineStatuses.map(async (status) => {
        const profile = await ctx.db
          .query("profiles")
          .filter((q) => q.eq(q.field("userId"), status.userId))
          .first();

        return {
          status,
          profile,
        };
      }),
    );

    // Filter out current user and users without profiles
    return onlineUsers.filter(
      (user) => user.status.userId !== baseUserId && user.profile,
    );
  },
});
