import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send a message
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.optional(v.string()),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("file"),
      v.literal("voice")
    ),
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    replyToId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Check if user is member of conversation
    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", user._id)
      )
      .first();

    if (!membership) throw new Error("Not a member of this conversation");

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: user._id,
      content: args.content,
      messageType: args.messageType,
      fileUrl: args.fileUrl,
      fileName: args.fileName,
      fileSize: args.fileSize,
      replyToId: args.replyToId,
      sentAt: Date.now(),
    });

    // Update conversation's last message time
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    });

    // Create notifications for other members
    const members = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const conversation = await ctx.db.get(args.conversationId);

    for (const member of members) {
      if (member.userId !== user._id) {
        await ctx.db.insert("notifications", {
          userId: member.userId,
          type: "message",
          title: conversation?.isGroup
            ? conversation.name || "Group"
            : user.username,
          content: args.content || "Sent an attachment",
          isRead: false,
          relatedId: args.conversationId,
          createdAt: Date.now(),
        });
      }
    }

    return messageId;
  },
});

// Get messages for a conversation
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    // Check membership
    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", user._id)
      )
      .first();

    if (!membership) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_and_time", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(args.limit || 100);

    const messagesWithDetails = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        
        const reactions = await ctx.db
          .query("messageReactions")
          .withIndex("by_message", (q) => q.eq("messageId", message._id))
          .collect();

        const reactionsWithUsers = await Promise.all(
          reactions.map(async (reaction) => {
            const user = await ctx.db.get(reaction.userId);
            return { ...reaction, user };
          })
        );

        let replyTo = null;
        if (message.replyToId) {
          const replyMessage = await ctx.db.get(message.replyToId);
          if (replyMessage) {
            const replySender = await ctx.db.get(replyMessage.senderId);
            replyTo = { ...replyMessage, sender: replySender };
          }
        }

        return {
          ...message,
          sender,
          reactions: reactionsWithUsers,
          replyTo,
        };
      })
    );

    return messagesWithDetails.reverse();
  },
});

// Add reaction to message
export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Check if reaction already exists
    const existing = await ctx.db
      .query("messageReactions")
      .withIndex("by_message_and_user", (q) =>
        q.eq("messageId", args.messageId).eq("userId", user._id)
      )
      .filter((q) => q.eq(q.field("emoji"), args.emoji))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return null;
    }

    const reactionId = await ctx.db.insert("messageReactions", {
      messageId: args.messageId,
      userId: user._id,
      emoji: args.emoji,
      createdAt: Date.now(),
    });

    return reactionId;
  },
});

// Mark messages as read
export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Check if receipt already exists
    const existing = await ctx.db
      .query("messageReadReceipts")
      .withIndex("by_user_and_conversation", (q) =>
        q.eq("userId", user._id).eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("messageId"), args.messageId))
      .first();

    if (!existing) {
      await ctx.db.insert("messageReadReceipts", {
        messageId: args.messageId,
        conversationId: args.conversationId,
        userId: user._id,
        readAt: Date.now(),
      });
    }
  },
});

// Edit message
export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.senderId !== user._id) {
      throw new Error("Can only edit your own messages");
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
      editedAt: Date.now(),
    });
  },
});

// Delete message
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.senderId !== user._id) {
      throw new Error("Can only delete your own messages");
    }

    await ctx.db.patch(args.messageId, {
      deletedAt: Date.now(),
      content: "This message was deleted",
    });
  },
});

// Forward message
export const forwardMessage = mutation({
  args: {
    messageId: v.id("messages"),
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

    const originalMessage = await ctx.db.get(args.messageId);
    if (!originalMessage) throw new Error("Message not found");

    const newMessageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: user._id,
      content: originalMessage.content,
      messageType: originalMessage.messageType,
      fileUrl: originalMessage.fileUrl,
      fileName: originalMessage.fileName,
      fileSize: originalMessage.fileSize,
      forwardedFrom: args.messageId,
      sentAt: Date.now(),
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    });

    return newMessageId;
  },
});

// Set typing indicator
export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", user._id)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isTyping: args.isTyping,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("typingIndicators", {
        conversationId: args.conversationId,
        userId: user._id,
        isTyping: args.isTyping,
        updatedAt: Date.now(),
      });
    }
  },
});

// Get typing indicators
export const getTypingIndicators = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const indicators = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("isTyping"), true))
      .collect();

    const activeIndicators = indicators.filter(
      (ind) =>
        ind.userId !== user._id &&
        Date.now() - ind.updatedAt < 5000 // Only show if updated within 5 seconds
    );

    const withUsers = await Promise.all(
      activeIndicators.map(async (ind) => {
        const typingUser = await ctx.db.get(ind.userId);
        return { ...ind, user: typingUser };
      })
    );

    return withUsers;
  },
});