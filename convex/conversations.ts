import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Create a new conversation (DM or group)
export const createConversation = mutation({
  args: {
    isGroup: v.boolean(),
    name: v.optional(v.string()),
    memberIds: v.array(v.id("users")),
    groupImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) throw new Error("User not found");

    // For DMs, check if conversation already exists
    if (!args.isGroup && args.memberIds.length === 1) {
      const existingConversations = await ctx.db
        .query("conversationMembers")
        .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
        .collect();

      for (const membership of existingConversations) {
        const conv = await ctx.db.get(membership.conversationId);
        if (!conv?.isGroup) {
          const members = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversation", (q) =>
              q.eq("conversationId", membership.conversationId)
            )
            .collect();

          if (members.length === 2) {
            const otherMember = members.find((m) => m.userId !== currentUser._id);
            if (otherMember?.userId === args.memberIds[0]) {
              return membership.conversationId;
            }
          }
        }
      }
    }

    // Create conversation
    const conversationId = await ctx.db.insert("conversations", {
      isGroup: args.isGroup,
      name: args.name,
      groupImage: args.groupImage,
      adminIds: args.isGroup ? [currentUser._id] : undefined,
      createdBy: currentUser._id,
      createdAt: Date.now(),
    });

    // Add creator as member
    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: currentUser._id,
      joinedAt: Date.now(),
      role: args.isGroup ? "admin" : "member",
    });

    // Add other members
    for (const memberId of args.memberIds) {
      await ctx.db.insert("conversationMembers", {
        conversationId,
        userId: memberId,
        joinedAt: Date.now(),
        role: "member",
      });
    }

    return conversationId;
  },
});

// Get user's conversations
export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const conversations = await Promise.all(
      memberships.map(async (membership) => {
        const conversation = await ctx.db.get(membership.conversationId);
        if (!conversation) return null;

        const members = await ctx.db
          .query("conversationMembers")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", membership.conversationId)
          )
          .collect();

        const memberDetails = await Promise.all(
          members.map((m) => ctx.db.get(m.userId))
        );

        // Get last message
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversation_and_time", (q) =>
            q.eq("conversationId", membership.conversationId)
          )
          .order("desc")
          .first();

        // Get unread count
        const lastRead = await ctx.db
          .query("messageReadReceipts")
          .withIndex("by_user_and_conversation", (q) =>
            q.eq("userId", user._id).eq("conversationId", membership.conversationId)
          )
          .order("desc")
          .first();

        const unreadMessages = lastRead
          ? await ctx.db
              .query("messages")
              .withIndex("by_conversation_and_time", (q) =>
                q.eq("conversationId", membership.conversationId)
              )
              .filter((q) => q.gt(q.field("sentAt"), lastRead.readAt))
              .collect()
          : await ctx.db
              .query("messages")
              .withIndex("by_conversation", (q) =>
                q.eq("conversationId", membership.conversationId)
              )
              .collect();

        const unreadCount = unreadMessages.filter(
          (m) => m.senderId !== user._id
        ).length;

        // For DMs, get the other user's name
        let displayName = conversation.name;
        let displayImage = conversation.groupImage;

        if (!conversation.isGroup) {
          const otherMember = memberDetails.find((m) => m?._id !== user._id);
          displayName = otherMember?.username || otherMember?.fullName || "Unknown";
          displayImage = otherMember?.imageUrl;
        }

        return {
          ...conversation,
          members: memberDetails.filter((m) => m !== null),
          lastMessage,
          unreadCount,
          displayName,
          displayImage,
        };
      })
    );

    return conversations
      .filter((c) => c !== null)
      .sort((a, b) => {
        const aTime = a.lastMessage?.sentAt || a.createdAt;
        const bTime = b.lastMessage?.sentAt || b.createdAt;
        return bTime - aTime;
      });
  },
});

// Get conversation by ID
export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    // Check if user is member
    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", user._id)
      )
      .first();

    if (!membership) return null;

    const members = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const memberDetails = await Promise.all(
      members.map((m) => ctx.db.get(m.userId))
    );

    return {
      ...conversation,
      members: memberDetails.filter((m) => m !== null),
    };
  },
});

// Add members to group
export const addMembersToGroup = mutation({
  args: {
    conversationId: v.id("conversations"),
    memberIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.isGroup) {
      throw new Error("Invalid conversation");
    }

    // Check if user is admin
    if (!conversation.adminIds?.includes(user._id)) {
      throw new Error("Only admins can add members");
    }

    for (const memberId of args.memberIds) {
      const existing = await ctx.db
        .query("conversationMembers")
        .withIndex("by_conversation_and_user", (q) =>
          q.eq("conversationId", args.conversationId).eq("userId", memberId)
        )
        .first();

      if (!existing) {
        await ctx.db.insert("conversationMembers", {
          conversationId: args.conversationId,
          userId: memberId,
          joinedAt: Date.now(),
          role: "member",
        });
      }
    }
  },
});

// Leave conversation
export const leaveConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", user._id)
      )
      .first();

    if (membership) {
      await ctx.db.delete(membership._id);
    }
  },
});
