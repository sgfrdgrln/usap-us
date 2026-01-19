'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MessageBubble } from '@/components/MessageBubble'
import { MessageInput } from '@/components/MessageInput'
import { MoreVertical, Phone, Video, Info } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ChatViewProps {
  conversationId: Id<'conversations'>
  currentUserId?: Id<'users'>
}

export function ChatView({ conversationId, currentUserId }: ChatViewProps) {
  const conversation = useQuery(api.conversations.getConversation, { conversationId })
  const messages = useQuery(api.messages.getMessages, { conversationId, limit: 100 })
  const typingIndicators = useQuery(api.messages.getTypingIndicators, { conversationId })
  
  const sendMessage = useMutation(api.messages.sendMessage)
  const addReaction = useMutation(api.messages.addReaction)
  const markAsRead = useMutation(api.messages.markAsRead)
  const setTyping = useMutation(api.messages.setTyping)
  
  const [replyTo, setReplyTo] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<string | null>(null)

  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSendMessage = async (content: string, type: 'text') => {
    await sendMessage({
      conversationId,
      content,
      messageType: type,
      replyToId: replyTo?._id,
    })
    setReplyTo(null)
  }

  const handleSendFile = async (file: File, type: 'image' | 'file' | 'voice') => {
    // In production, upload to Convex storage or cloud storage
    // For now, we'll create a placeholder URL
    const fileUrl = URL.createObjectURL(file)
    
    await sendMessage({
      conversationId,
      messageType: type,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
    })
  }

  const handleReaction = async (messageId: Id<'messages'>, emoji: string) => {
    await addReaction({ messageId, emoji })
  }

  const handleTyping = async (isTyping: boolean) => {
    await setTyping({ conversationId, isTyping })
  }

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage._id !== lastMessageRef.current) {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
        lastMessageRef.current = lastMessage._id
        
        // Mark as read
        if (lastMessage.senderId !== currentUserId) {
          markAsRead({ conversationId, messageId: lastMessage._id })
        }
      }
    }
  }, [messages])

  if (!conversation || !messages) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const otherMember = conversation.isGroup
    ? null
    : conversation.members?.find((m) => m?._id !== currentUserId)

  const displayName = conversation.isGroup
    ? conversation.name
    : otherMember?.username || 'Unknown'
  
  const displayImage = conversation.isGroup
    ? conversation.groupImage
    : otherMember?.imageUrl

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-background">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={displayImage} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{displayName}</h2>
            {typingIndicators && typingIndicators.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                {typingIndicators.map((t) => t.user?.username).join(', ')} typing...
              </p>
            ) : !conversation.isGroup && otherMember?.status ? (
              <p className="text-sm text-muted-foreground capitalize">{otherMember.status}</p>
            ) : conversation.isGroup ? (
              <p className="text-sm text-muted-foreground">
                {conversation.members?.length} members
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Info className="h-4 w-4 mr-2" />
                Conversation Info
              </DropdownMenuItem>
              <DropdownMenuItem>Clear Messages</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                {conversation.isGroup ? 'Leave Group' : 'Delete Conversation'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {messages.map((message, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : null
            const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId
            const isOwnMessage = message.senderId === currentUserId

            return (
              <MessageBubble
                key={message._id}
                message={message}
                isOwnMessage={isOwnMessage}
                showAvatar={showAvatar}
                onReact={(emoji) => handleReaction(message._id, emoji)}
                onReply={() => setReplyTo(message)}
              />
            )
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        onTyping={handleTyping}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  )
}
