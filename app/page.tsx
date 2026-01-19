'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { api } from '../convex/_generated/api'
import { Id } from '../convex/_generated/dataModel'
import { ConversationItem } from '@/components/ConversationItem'
import { ChatView } from '@/components/ChatView'
import { UserSearch } from '@/components/UserSearch'
import { FriendsList } from '@/components/FriendsList'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  MessageSquare,
  Users,
  UserPlus,
  Bell,
  Plus,
  Search,
  ArrowLeft,
} from 'lucide-react'
import { UserButton } from '@clerk/nextjs'

export default function Home() {
  const { user, isLoaded } = useUser()
  const currentUser = useQuery(api.users.getCurrentUser)
  const conversations = useQuery(api.conversations.getConversations)
  const friends = useQuery(api.friends.getFriends)
 // const notifications = useQuery(api.notifications.getNotifications, { limit: 10 })
  const unreadCount = useQuery(api.notifications.getUnreadCount)
  
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser)
  const createConversation = useMutation(api.conversations.createConversation)
  const sendFriendRequest = useMutation(api.friends.sendFriendRequest)
  
  const [selectedConversation, setSelectedConversation] = useState<Id<'conversations'> | null>(null)
  const [activeView, setActiveView] = useState<'chats' | 'friends' | 'search'>('chats')
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  // Initialize or update user in Convex
  useEffect(() => {
    if (user && !currentUser) {
      createOrUpdateUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        username: user.username || user.firstName || 'User',
        fullName: user.fullName || undefined,
        imageUrl: user.imageUrl || undefined,
      })
    }
  }, [user, currentUser])

  const handleStartChat = async (userId: string) => {
    const conversationId = await createConversation({
      isGroup: false,
      memberIds: [userId as Id<'users'>],
    })
    setSelectedConversation(conversationId)
    setActiveView('chats')
  }

  const handleSendFriendRequest = async (userId: string) => {
    await sendFriendRequest({ receiverId: userId as Id<'users'> })
  }

  const handleCreateGroup = async () => {
    if (groupName.trim() && selectedMembers.length > 0) {
      try {
        const conversationId = await createConversation({
          isGroup: true,
          name: groupName,
          memberIds: selectedMembers as Id<'users'>[],
        })
        setSelectedConversation(conversationId)
        setShowNewGroupDialog(false)
        setGroupName('')
        setSelectedMembers([])
        setActiveView('chats')
      } catch (error) {
        console.error('Failed to create group:', error)
      }
    }
  }

  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">UsapUs</h1>
          <p className="text-muted-foreground">Modern Messaging Made Simple</p>
          <SignInButton mode="modal">
            <Button size="lg">Sign In to Start Chatting</Button>
          </SignInButton>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">UsapUs</h1>
          <p className="text-muted-foreground">Loading your messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Hidden on mobile when conversation is selected */}
      <div className={`w-full md:w-80 border-r flex flex-col bg-card md:relative h-full ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-3 md:p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-primary">UsapUs</h1>
            <div className="flex items-center gap-1 md:gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="relative h-8 w-8 md:h-10 md:w-10">
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                {unreadCount && unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 text-[10px] md:text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-1.5 md:gap-2">
            <Button
              variant={activeView === 'chats' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('chats')}
              className="flex-1 text-xs md:text-sm px-2"
            >
              <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-1" />
              <span className="hidden sm:inline ml-1">Chats</span>
            </Button>
            <Button
              variant={activeView === 'friends' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('friends')}
              className="flex-1 text-xs md:text-sm px-2"
            >
              <Users className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-1" />
              <span className="hidden sm:inline ml-1">Friends</span>
            </Button>
            <Button
              variant={activeView === 'search' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('search')}
              className="flex-1 text-xs md:text-sm px-2"
            >
              <Search className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-1" />
              <span className="hidden sm:inline ml-1">Find</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {activeView === 'chats' && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-3">
                <h2 className="font-semibold text-sm text-muted-foreground">
                  CONVERSATIONS
                </h2>
                <Dialog open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Group Chat</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Input
                          placeholder="Group name"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">
                            Select Friends
                          </p>
                          {selectedMembers.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {selectedMembers.length} selected
                            </Badge>
                          )}
                        </div>
                        
                        <ScrollArea className="h-[200px] border rounded-md p-2">
                          {friends && friends.length > 0 ? (
                            <div className="space-y-1">
                              {friends.map((friend) => (
                                <div
                                  key={friend._id}
                                  onClick={() => toggleMemberSelection(friend._id)}
                                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                                    selectedMembers.includes(friend._id) ? 'bg-accent' : ''
                                  }`}
                                >
                                  <div className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 ${
                                    selectedMembers.includes(friend._id) 
                                      ? 'bg-primary border-primary' 
                                      : 'border-muted-foreground'
                                  }`}>
                                    {selectedMembers.includes(friend._id) && (
                                      <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={friend.imageUrl} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                      {friend.username?.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{friend.username}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                              No friends yet. Add friends to create a group!
                            </div>
                          )}
                        </ScrollArea>
                      </div>

                      <Button 
                        onClick={handleCreateGroup} 
                        disabled={!groupName.trim() || selectedMembers.length === 0}
                        className="w-full"
                      >
                        Create Group {selectedMembers.length > 0 && `(${selectedMembers.length + 1} members)`}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {conversations && conversations.length > 0 ? (
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <ConversationItem
                      key={conversation._id}
                      conversation={{
                        _id: conversation._id,
                        displayName: conversation.displayName,
                        displayImage: conversation.displayImage,
                        isGroup: conversation.isGroup,
                        lastMessage: conversation.lastMessage || undefined,
                        unreadCount: conversation.unreadCount,
                      }}
                      isActive={selectedConversation === conversation._id}
                      onClick={() => setSelectedConversation(conversation._id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No conversations yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Find friends and start chatting!
                  </p>
                </div>
              )}
            </div>
          )}

          {activeView === 'friends' && (
            <div className="p-4">
              <FriendsList />
            </div>
          )}

          {activeView === 'search' && (
            <div className="p-4 space-y-4">
              <UserSearch
                onSelectUser={(userId) => {
                  handleStartChat(userId)
                  handleSendFriendRequest(userId)
                }}
              />
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 relative w-full">
        {selectedConversation ? (
          <>
            {/* Mobile back button */}
            <div className="md:hidden absolute top-3 left-3 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedConversation(null)}
                className="bg-background/80 backdrop-blur-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
            <ChatView
              conversationId={selectedConversation}
              currentUserId={currentUser?._id}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="space-y-3 md:space-y-4 max-w-md">
              <div className="text-4xl md:text-6xl mb-2 md:mb-4">💬</div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary">Welcome to UsapUs</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Select a conversation to start messaging, or find new friends to chat with!
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4 md:mt-6">
                <Button 
                  onClick={() => setActiveView('search')}
                  className="w-full sm:w-auto"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Find Friends
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewGroupDialog(true)}
                  className="w-full sm:w-auto"
                >
                  <Users className="h-4 w-4 mr-2" />
                  New Group
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}