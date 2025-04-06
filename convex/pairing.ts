import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send a pairing request
export const sendRequest = mutation({
  args: {
    toUserId: v.string(),
    currentActivity: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const fromUserId = identity.subject.split("|")[0];
    if (fromUserId === args.toUserId) {
      throw new Error("Cannot send pairing request to yourself");
    }

    // Check if user already has a pending request
    const existingRequest = await ctx.db
      .query("pairingRequests")
      .filter((q) =>
        q.and(
          q.eq(q.field("fromUserId"), fromUserId),
          q.eq(q.field("status"), "pending"),
        ),
      )
      .first();

    if (existingRequest) {
      throw new Error("You already have a pending pairing request");
    }

    // Create new request
    return await ctx.db.insert("pairingRequests", {
      fromUserId,
      toUserId: args.toUserId,
      status: "pending",
      createdAt: Date.now(),
      currentActivity: args.currentActivity,
      tags: args.tags,
    });
  },
});

// Get incoming pairing requests for current user
export const getIncomingRequests = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject.split("|")[0];
    const requests = await ctx.db
      .query("pairingRequests")
      .withIndex("by_to_user", (q) => q.eq("toUserId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Get profiles for users who sent requests
    return await Promise.all(
      requests.map(async (request) => {
        const profile = await ctx.db
          .query("profiles")
          .filter((q) => q.eq(q.field("userId"), request.fromUserId))
          .first();

        return {
          request,
          profile,
        };
      }),
    );
  },
});

// Get outgoing pairing request for current user
export const getOutgoingRequest = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject.split("|")[0];
    const request = await ctx.db
      .query("pairingRequests")
      .withIndex("by_from_user", (q) => q.eq("fromUserId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (!request) {
      return null;
    }

    const profile = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("userId"), request.toUserId))
      .first();

    return {
      request,
      profile,
    };
  },
});

// Respond to a pairing request
export const respondToRequest = mutation({
  args: {
    requestId: v.id("pairingRequests"),
    accept: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject.split("|")[0];
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new Error("Request not found");
    }

    if (request.toUserId !== userId) {
      throw new Error("Not authorized to respond to this request");
    }

    if (request.status !== "pending") {
      throw new Error("Request is no longer pending");
    }

    return await ctx.db.patch(args.requestId, {
      status: args.accept ? "accepted" : "declined",
    });
  },
});

// Cancel an outgoing pairing request
export const cancelRequest = mutation({
  args: {
    requestId: v.id("pairingRequests"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject.split("|")[0];
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new Error("Request not found");
    }

    if (request.fromUserId !== userId) {
      throw new Error("Not authorized to cancel this request");
    }

    if (request.status !== "pending") {
      throw new Error("Request is no longer pending");
    }

    return await ctx.db.delete(args.requestId);
  },
});
