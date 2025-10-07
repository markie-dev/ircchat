import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  users: defineTable({
    email: v.string(),
    username: v.optional(v.string()),
    lastModified: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("username", ["username"]),

  channels: defineTable({
    description: v.string(),
    name: v.string(),
    type: v.union(v.literal("public"), v.literal("private")),
  })
    .index("by_type", ["type"])
    .index("by_name", ["name"]),

  channelPresence: defineTable({
    channelId: v.id("channels"),
    userId: v.optional(v.id("users")),
    anonKey: v.optional(v.string()),
    lastActive: v.number(),
    typingAt: v.optional(v.number()),
  })
    .index("by_channelId", ["channelId"])
    .index("by_userId_and_channelId", ["userId", "channelId"])
    .index("by_anonKey_and_channelId", ["anonKey", "channelId"]),

  channelMembers: defineTable({
    userId: v.id("users"),
    channelId: v.id("channels"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
  })
    .index("by_userId", ["userId"])
    .index("by_channelId", ["channelId"])
    .index("by_userId_and_channelId", ["userId", "channelId"]),

  messages: defineTable({
    channelId: v.id("channels"),
    content: v.string(),
    userId: v.id("users"),
  }).index("by_channel", ["channelId"]),
});

export default schema;
