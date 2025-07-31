import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
 
const schema = defineSchema({
  ...authTables,
  users: defineTable({
    email: v.string(),
    username: v.optional(v.string()),
    lastModified: v.optional(v.number()),
  }).index("email", ["email"]).index("username", ["username"]),
});
 
export default schema;