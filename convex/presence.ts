import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const PRESENCE_TTL_MS = 30_000;
const TYPING_TTL_MS = 5_000;

export const heartbeat = mutation({
  args: {
    channelId: v.id("channels"),
    anonKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const authUserId = await getAuthUserId(ctx);

    if (authUserId) {
      const existing = await ctx.db
        .query("channelPresence")
        .withIndex("by_userId_and_channelId", (q) =>
          q.eq("userId", authUserId).eq("channelId", args.channelId)
        )
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, { lastActive: now });
        return null;
      }
      await ctx.db.insert("channelPresence", {
        channelId: args.channelId,
        userId: authUserId,
        lastActive: now,
        typingAt: undefined,
      });
      return null;
    }

    const anonKey = args.anonKey ?? "";
    if (!anonKey) return null;

    const existing = await ctx.db
      .query("channelPresence")
      .withIndex("by_anonKey_and_channelId", (q) =>
        q.eq("anonKey", anonKey).eq("channelId", args.channelId)
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { lastActive: now });
      return null;
    }
    await ctx.db.insert("channelPresence", {
      channelId: args.channelId,
      anonKey,
      lastActive: now,
      typingAt: undefined,
    });
    return null;
  },
});

export const leave = mutation({
  args: {
    channelId: v.id("channels"),
    anonKey: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (args.userId) {
      const existing = await ctx.db
        .query("channelPresence")
        .withIndex("by_userId_and_channelId", (q) =>
          q.eq("userId", args.userId!).eq("channelId", args.channelId)
        )
        .unique();
      if (existing) await ctx.db.delete(existing._id);
      return null;
    }

    const authUserId = await getAuthUserId(ctx);
    if (authUserId) {
      const existing = await ctx.db
        .query("channelPresence")
        .withIndex("by_userId_and_channelId", (q) =>
          q.eq("userId", authUserId).eq("channelId", args.channelId)
        )
        .unique();
      if (existing) await ctx.db.delete(existing._id);
      return null;
    }

    const anonKey = args.anonKey ?? "";
    if (!anonKey) return null;
    const existing = await ctx.db
      .query("channelPresence")
      .withIndex("by_anonKey_and_channelId", (q) =>
        q.eq("anonKey", anonKey).eq("channelId", args.channelId)
      )
      .unique();
    if (existing) await ctx.db.delete(existing._id);
    return null;
  },
});

export const listOnline = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - PRESENCE_TTL_MS;
    const rows = await ctx.db
      .query("channelPresence")
      .withIndex("by_channelId", (q) => q.eq("channelId", args.channelId))
      .collect();

    const fresh = rows.filter((r) => r.lastActive >= cutoff);

    const userIds = fresh
      .map((r) => r.userId)
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
    const uniqueUserIds = Array.from(new Set(userIds));
    const users = await Promise.all(uniqueUserIds.map((id) => ctx.db.get(id)));
    const idToUsername = new Map(
      users
        .filter((u): u is NonNullable<typeof u> => Boolean(u))
        .map((u) => [u._id, u.username ?? u.email.split("@")[0] ?? "anonymous"])
    );

    const byKey = new Map<string, number>();
    for (const r of fresh) {
      if (!r.userId && r.anonKey) {
        byKey.set(r.anonKey, (byKey.get(r.anonKey) ?? 0) + 1);
      }
    }

    return {
      users: fresh
        .filter((r) => r.userId)
        .map((r) => ({
          kind: "user" as const,
          id: r.userId!,
          name: idToUsername.get(r.userId!) ?? "anonymous",
        })),
      anonymous: Array.from(byKey.values()).reduce((sum, n) => sum + n, 0),
    };
  },
});

export const typingBeat = mutation({
  args: {
    channelId: v.id("channels"),
    typing: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const authUserId = await getAuthUserId(ctx);

    if (authUserId) {
      const existing = await ctx.db
        .query("channelPresence")
        .withIndex("by_userId_and_channelId", (q) =>
          q.eq("userId", authUserId).eq("channelId", args.channelId)
        )
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, {
          typingAt: args.typing ? now : undefined,
        });
        return null;
      }
      await ctx.db.insert("channelPresence", {
        channelId: args.channelId,
        userId: authUserId,
        lastActive: now,
        typingAt: args.typing ? now : undefined,
      });
      return null;
    }
    // todo: support anonymous typing
    return null;
  },
});

export const listTyping = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - TYPING_TTL_MS;
    const rows = await ctx.db
      .query("channelPresence")
      .withIndex("by_channelId", (q) => q.eq("channelId", args.channelId))
      .collect();

    const active = rows.filter((r) => (r.typingAt ?? 0) >= cutoff && r.userId);
    const userIds = Array.from(new Set(active.map((r) => r.userId!)));
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
    return users
      .filter((u): u is NonNullable<typeof u> => Boolean(u))
      .map((u) => ({ id: u._id, name: u.username ?? u.email.split("@")[0] }));
  },
});
