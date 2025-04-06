import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send a message in the current session
export const sendMessage = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject.split("|")[0];

    // Get user's current status to verify they're in a session
    const userStatus = await ctx.db
      .query("userStatus")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!userStatus?.inSession || !userStatus.sessionPartnerId) {
      throw new Error("You are not in an active session");
    }

    // Create the message
    return await ctx.db.insert("messages", {
      content: args.content,
      userId,
      sessionId: `${userId}_${userStatus.sessionPartnerId}`,
      createdAt: Date.now(),
    });
  },
});

// Get messages for the current session
export const getMessages = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject.split("|")[0];

    // Get user's current status to get session info
    const userStatus = await ctx.db
      .query("userStatus")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!userStatus?.inSession || !userStatus.sessionPartnerId) {
      return {
        messages: [],
        currentUser: null,
        partner: null,
      };
    }

    // Get partner's profile
    const partnerProfile = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("userId"), userStatus.sessionPartnerId))
      .first();

    // Query messages using both possible session ID combinations
    const sessionId1 = `${userId}_${userStatus.sessionPartnerId}`;
    const sessionId2 = `${userStatus.sessionPartnerId}_${userId}`;

    const messages = await ctx.db
      .query("messages")
      .filter((q) =>
        q.or(
          q.eq(q.field("sessionId"), sessionId1),
          q.eq(q.field("sessionId"), sessionId2),
        ),
      )
      .order("asc")
      .collect();

    // Get the current user's profile
    const userProfile = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    return {
      messages,
      currentUser: userProfile,
      partner: partnerProfile,
    };
  },
});
