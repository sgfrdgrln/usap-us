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
import { CallInterface } from '@/components/CallInterface'
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
  const [isCallActive, setIsCallActive] = useState(false)
  const [callType, setCallType] = useState<'voice' | 'video'>('voice')
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

  const handleStartCall = (type: 'voice' | 'video') => {
    if (conversation?.isGroup) {
      // Group calls could be implemented with additional logic
      alert('Group calls are not yet supported')
      return
    }
    setCallType(type)
    setIsCallActive(true)
  }

  const handleEndCall = () => {
    setIsCallActive(false)
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
      <div className="border-b p-3 md:p-4 flex items-center justify-between bg-background">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <Avatar className="h-8 w-8 md:h-10 md:w-10 shrink-0">
            <AvatarImage src={displayImage} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs md:text-sm">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-sm md:text-base truncate">{displayName}</h2>
            {typingIndicators && typingIndicators.length > 0 ? (
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {typingIndicators.map((t) => t.user?.username).join(', ')} typing...
              </p>
            ) : !conversation.isGroup && otherMember?.status ? (
              <p className="text-xs md:text-sm text-muted-foreground capitalize">{otherMember.status}</p>
            ) : conversation.isGroup ? (
              <p className="text-xs md:text-sm text-muted-foreground">
                {conversation.members?.length} members
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden md:flex h-8 w-8 md:h-10 md:w-10"
            onClick={() => handleStartCall('voice')}
            disabled={conversation?.isGroup}
          >
            <Phone className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden md:flex h-8 w-8 md:h-10 md:w-10"
            onClick={() => handleStartCall('video')}
            disabled={conversation?.isGroup}
          >
            <Video className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="md:hidden" onClick={() => handleStartCall('voice')} disabled={conversation?.isGroup}>
                <Phone className="h-4 w-4 mr-2" />
                Voice Call
              </DropdownMenuItem>
              <DropdownMenuItem className="md:hidden" onClick={() => handleStartCall('video')} disabled={conversation?.isGroup}>
                <Video className="h-4 w-4 mr-2" />
                Video Call
              </DropdownMenuItem>
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
      <ScrollArea className="flex-1 p-2 md:p-4">
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

      {/* Call Interface */}
      {isCallActive && (
        <CallInterface
          callerName={displayName}
          callerImage={displayImage}
          isVideo={callType === 'video'}
          onEndCall={handleEndCall}
        />
      )}
    </div>
  )
}
