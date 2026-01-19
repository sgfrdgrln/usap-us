'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { format, isToday, isYesterday } from 'date-fns'
import { CheckCheck } from 'lucide-react'



interface MessageBubbleProps {
  message: {
    _id: string
    content?: string
    messageType: string
    sentAt: number
    editedAt?: number
    deletedAt?: number
    fileUrl?: string
    fileName?: string
    sender?: {
      username: string
      imageUrl?: string
    } | null
    reactions?: Array<{
      emoji: string
      userId: string
      user?: {
        username: string
      } | null
    }>
    replyTo?: {
      content?: string
      sender?: {
        username: string
      } | null
    } | null
  }
  isOwnMessage: boolean
  showAvatar: boolean
  onReact?: (emoji: string) => void
  onReply?: () => void
}

export function MessageBubble({ message, isOwnMessage, showAvatar, onReact, onReply }: MessageBubbleProps) {
  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp)
    if (isToday(date)) {
      return format(date, 'HH:mm')
    } else if (isYesterday(date)) {
      return 'Yesterday ' + format(date, 'HH:mm')
    }
    return format(date, 'MMM dd, HH:mm')
  }

  const renderMessageContent = () => {
    if (message.deletedAt) {
      return (
        <span className="italic text-muted-foreground text-sm">
          This message was deleted
        </span>
      )
    }

    if (message.messageType === 'image' && message.fileUrl) {
      return (
        <div className="space-y-2">
          <img
            src={message.fileUrl}
            alt="Shared image"
            className="rounded-lg max-w-[250px] sm:max-w-sm max-h-64 sm:max-h-96 object-cover w-full"
          />
          {message.content && <p className="text-xs md:text-sm">{message.content}</p>}
        </div>
      )
    }

    if (message.messageType === 'file' && message.fileUrl) {
      return (
        <a
          href={message.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2 rounded bg-accent hover:bg-accent/80"
        >
          <span className="text-xl md:text-2xl">📎</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium truncate">{message.fileName}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">Click to download</p>
          </div>
        </a>
      )
    }

    if (message.messageType === 'voice' && message.fileUrl) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl">🎤</span>
          <audio controls className="max-w-[200px] sm:max-w-xs w-full h-8">
            <source src={message.fileUrl} type="audio/webm" />
          </audio>
        </div>
      )
    }

    return <p className="text-xs md:text-sm whitespace-pre-wrap overflow-wrap-anywhere">{message.content}</p>
  }

  const groupedReactions = message.reactions?.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = []
    }
    acc[reaction.emoji].push(reaction)
    return acc
  }, {} as Record<string, typeof message.reactions>)

  return (
    <div className={cn('flex gap-1.5 md:gap-2 mb-3 md:mb-4', isOwnMessage && 'flex-row-reverse')}>
      {showAvatar ? (
        <Avatar className="h-6 w-6 md:h-8 md:w-8 mt-1 shrink-0">
          <AvatarImage src={message.sender?.imageUrl} />
          <AvatarFallback className="bg-primary/10 text-primary text-[10px] md:text-xs">
            {getInitials(message.sender?.username)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="h-6 w-6 md:h-8 md:w-8" />
      )}

      <div className={cn('flex flex-col max-w-[85%] sm:max-w-[75%] md:max-w-[70%]', isOwnMessage && 'items-end')}>
        {showAvatar && !isOwnMessage && (
          <span className="text-[10px] md:text-xs text-muted-foreground mb-1 px-1">
            {message.sender?.username}
          </span>
        )}

        {message.replyTo && (
          <div className={cn(
            'px-2 md:px-3 py-1 mb-1 rounded text-[10px] md:text-xs bg-accent/50 border-l-2',
            isOwnMessage ? 'border-primary' : 'border-muted-foreground'
          )}>
            <p className="font-semibold truncate">{message.replyTo.sender?.username}</p>
            <p className="text-muted-foreground truncate">{message.replyTo.content}</p>
          </div>
        )}

        <div
          className={cn(
            'px-3 py-1.5 md:px-4 md:py-2 rounded-2xl overflow-wrap-anywhere',
            isOwnMessage
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-accent rounded-bl-sm'
          )}
        >
          {renderMessageContent()}
          
          <div className={cn('flex items-center gap-1 md:gap-2 mt-1', isOwnMessage && 'justify-end')}>
            <span className={cn(
              'text-[10px] md:text-xs',
              isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
            )}>
              {formatMessageTime(message.sentAt)}
              {message.editedAt && ' (edited)'}
            </span>
            {isOwnMessage && (
              <CheckCheck className={cn(
                'h-3 w-3',
                isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )} />
            )}
          </div>
        </div>

        {groupedReactions && Object.keys(groupedReactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 px-1">
            {Object.entries(groupedReactions).map(([emoji, reactions]) => (
              <button
                key={emoji}
                onClick={() => onReact?.(emoji)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent hover:bg-accent/80 text-xs"
              >
                <span>{emoji}</span>
                <span className="text-muted-foreground">{reactions.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
