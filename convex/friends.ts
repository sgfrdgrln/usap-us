import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send a friend request
export const sendFriendRequest = mutation({
  args: {
    receiverId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const sender = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!sender) throw new Error("User not found");

    // Check if request already exists
    const existingRequest = await ctx.db
      .query("friendRequests")
      .withIndex("by_sender_and_receiver", (q) =>
        q.eq("senderId", sender._id).eq("receiverId", args.receiverId)
      )
      .first();

    if (existingRequest) {
      throw new Error("Friend request already sent");
    }

    // Check reverse request
    const reverseRequest = await ctx.db
      .query("friendRequests")
      .withIndex("by_sender_and_receiver", (q) =>
        q.eq("senderId", args.receiverId).eq("receiverId", sender._id)
      )
      .first();

    if (reverseRequest) {
      throw new Error("This user has already sent you a friend request");
    }

    // Check if already friends
    const areFriends = await ctx.db
      .query("friends")
      .withIndex("by_user1", (q) => q.eq("userId1", sender._id))
      .filter((q) => q.eq(q.field("userId2"), args.receiverId))
      .first();

    if (areFriends) {
      throw new Error("Already friends");
    }

    const requestId = await ctx.db.insert("friendRequests", {
      senderId: sender._id,
      receiverId: args.receiverId,
      status: "pending",
      createdAt: Date.now(),
    });

    // Create notification
    await ctx.db.insert("notifications", {
      userId: args.receiverId,
      type: "friend_request",
      title: "New Friend Request",
      content: `${sender.username} sent you a friend request`,
      isRead: false,
      relatedId: requestId,
      createdAt: Date.now(),
    });

    return requestId;
  },
});

// Respond to friend request
export const respondToFriendRequest = mutation({
  args: {
    requestId: v.id("friendRequests"),
    accept: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Friend request not found");

    if (request.receiverId !== user._id) {
      throw new Error("Unauthorized");
    }

    if (request.status !== "pending") {
      throw new Error("Request already processed");
    }

    await ctx.db.patch(args.requestId, {
      status: args.accept ? "accepted" : "rejected",
      respondedAt: Date.now(),
    });

    if (args.accept) {
      // Create friendship
      await ctx.db.insert("friends", {
        userId1: request.senderId,
        userId2: request.receiverId,
        createdAt: Date.now(),
      });

      // Create reverse friendship for easier queries
      await ctx.db.insert("friends", {
        userId1: request.receiverId,
        userId2: request.senderId,
        createdAt: Date.now(),
      });

      // Notify sender
      await ctx.db.insert("notifications", {
        userId: request.senderId,
        type: "friend_accepted",
        title: "Friend Request Accepted",
        content: `${user.username} accepted your friend request`,
        isRead: false,
        createdAt: Date.now(),
      });
    }
  },
});

// Get friend requests
export const getFriendRequests = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const requests = await ctx.db
      .query("friendRequests")
      .withIndex("by_receiver", (q) => q.eq("receiverId", user._id))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const sender = await ctx.db.get(request.senderId);
        return { ...request, sender };
      })
    );

    return requestsWithUsers;
  },
});

// Get friends list
export const getFriends = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const friendships = await ctx.db
      .query("friends")
      .withIndex("by_user1", (q) => q.eq("userId1", user._id))
      .collect();

    const friends = await Promise.all(
      friendships.map(async (friendship) => {
        const friend = await ctx.db.get(friendship.userId2);
        return friend;
      })
    );

    return friends.filter((f) => f !== null);
  },
});

// Remove friend
export const removeFriend = mutation({
  args: {
    friendId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Remove both directions
    const friendship1 = await ctx.db
      .query("friends")
      .withIndex("by_user1", (q) => q.eq("userId1", user._id))
      .filter((q) => q.eq(q.field("userId2"), args.friendId))
      .first();

    const friendship2 = await ctx.db
      .query("friends")
      .withIndex("by_user1", (q) => q.eq("userId1", args.friendId))
      .filter((q) => q.eq(q.field("userId2"), user._id))
      .first();

    if (friendship1) await ctx.db.delete(friendship1._id);
    if (friendship2) await ctx.db.delete(friendship2._id);
  },
});
