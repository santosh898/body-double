import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Only use the first part of the subject ID
    const baseUserId = identity.subject.split("|")[0];

    const profile = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("userId"), baseUserId))
      .first();

    return profile;
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    imageUrl: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Only use the first part of the subject ID
    const baseUserId = identity.subject.split("|")[0];

    const existingProfile = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("userId"), baseUserId))
      .first();

    if (existingProfile) {
      // Update existing profile
      return await ctx.db.patch(existingProfile._id, {
        ...(args.name !== undefined && { name: args.name }),
        ...(args.bio !== undefined && { bio: args.bio }),
        ...(args.imageUrl !== undefined && { imageUrl: args.imageUrl }),
        ...(args.tags !== undefined && { tags: args.tags }),
      });
    } else {
      // Create new profile
      return await ctx.db.insert("profiles", {
        userId: baseUserId,
        name: args.name || "",
        bio: args.bio,
        imageUrl: args.imageUrl,
        tags: args.tags || [],
      });
    }
  },
});
