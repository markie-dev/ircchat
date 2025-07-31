import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// get current user data
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    
    if (userId === null) {
      return null;
    }

    const user = await ctx.db.get(userId);
    return user;
  },
});

// check if username exists
export const checkUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("username", (q) => q.eq("username", username))
      .first();
    
    return existingUser !== null;
  },
});

// update username
export const updateUsername = mutation({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const userId = await getAuthUserId(ctx);
    
    if (userId === null) {
      throw new Error("not authenticated");
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("user not found");
    }

    await ctx.db.patch(user._id, {
      username,
      lastModified: Date.now(),
    });

    return { success: true };
  },
}); 