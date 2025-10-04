import { getAuthUserId } from "@convex-dev/auth/server";
import { Id, Doc } from "../_generated/dataModel";

export async function getCurrentUserId(ctx: any): Promise<Id<"users"> | null> {
  return await getAuthUserId(ctx);
}

export async function isUserMemberOfChannel(
  ctx: any,
  userId: Id<"users">,
  channelId: Id<"channels">
): Promise<boolean> {
  const membership = await ctx.db
    .query("channelMembers")
    .withIndex("by_userId_and_channelId", (q: any) =>
      q.eq("userId", userId).eq("channelId", channelId)
    )
    .unique();
  return !!membership;
}

export async function canAccessChannel(
  ctx: any,
  channel: Doc<"channels">,
  maybeUserId: Id<"users"> | null
): Promise<boolean> {
  if (channel.type === "public") return true;
  if (!maybeUserId) return false;
  return await isUserMemberOfChannel(ctx, maybeUserId, channel._id);
}
