import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get current user's status
export const getCurrentUserStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const baseUserId = identity.subject.split("|")[0];

    const status = await ctx.db
      .query("userStatus")
      .filter((q) => q.eq(q.field("userId"), baseUserId))
      .first();

    if (!status) return null;
    return status;
  },
});

// Update user's online status and current activity
export const updateStatus = mutation({
  args: {
    isOnline: v.boolean(),
    currentActivity: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
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
      const patch: any = {
        isOnline: args.isOnline,
        lastPing: now,
      };

      if (args.currentActivity !== undefined) {
        patch.currentActivity = args.currentActivity;
      }

      if (args.tags !== undefined) {
        patch.tags = args.tags;
      }

      return await ctx.db.patch(existingStatus._id, patch);
    } else {
      return await ctx.db.insert("userStatus", {
        userId: baseUserId,
        isOnline: args.isOnline,
        currentActivity: args.currentActivity,
        lastPing: now,
        inSession: false,
        tags: args.tags,
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

    // Get all online users who have pinged recently
    const onlineStatuses = await ctx.db
      .query("userStatus")
      .filter((q) => q.and(q.eq(q.field("isOnline"), true)))
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
