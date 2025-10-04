import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { canAccessChannel, getCurrentUserId } from "./lib/access";

export const getChannels = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    const publicChannels = await ctx.db
      .query("channels")
      .withIndex("by_type", (q) => q.eq("type", "public"))
      .collect();

    if (userId === null) {
      return publicChannels;
    }

    const memberships = await ctx.db
      .query("channelMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const privateChannels = [];
    for (const membership of memberships) {
      const channel = await ctx.db.get(membership.channelId);
      if (channel) {
        privateChannels.push(channel);
      }
    }

    return [...publicChannels, ...privateChannels];
  },
});

export const getChannelWithMessages = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

    const channel = await ctx.db
      .query("channels")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();

    if (!channel) return { kind: "not_found" as const };

    const allowed = await canAccessChannel(ctx, channel, userId);
    if (!allowed) return { kind: "access_denied" as const };

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", channel._id))
      .order("asc")
      .collect();

    const uniqueUserIds = Array.from(new Set(messages.map((m) => m.userId)));
    const users = await Promise.all(uniqueUserIds.map((id) => ctx.db.get(id)));
    const idToUser = new Map(users.filter(Boolean).map((u) => [u!._id, u!]));

    const messagesWithUsers = messages.map((message) => ({
      ...message,
      username: idToUser.get(message.userId)?.username || "anonymous",
    }));

    return { kind: "success" as const, channel, messages: messagesWithUsers };
  },
});

export const sendMessage = mutation({
  args: {
    channelId: v.id("channels"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }

    const allowed = await canAccessChannel(ctx, channel, userId);
    if (!allowed) {
      throw new Error("Access denied");
    }

    await ctx.db.insert("messages", {
      channelId: args.channelId,
      content: args.content,
      userId,
    });
  },
});
