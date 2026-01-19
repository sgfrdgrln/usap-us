'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface ConversationItemProps {
  conversation: {
    _id: string
    displayName?: string
    displayImage?: string
    isGroup: boolean
    lastMessage?: {
      content?: string
      sentAt: number
      messageType: string
    }
    unreadCount: number
  }
  isActive: boolean
  onClick: () => void
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getLastMessagePreview = () => {
    if (!conversation.lastMessage) return 'No messages yet'
    
    if (conversation.lastMessage.messageType === 'image') return '📷 Photo'
    if (conversation.lastMessage.messageType === 'file') return '📎 File'
    if (conversation.lastMessage.messageType === 'voice') return '🎤 Voice message'
    
    return conversation.lastMessage.content || 'Message'
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg transition-colors hover:bg-accent',
        isActive && 'bg-accent'
      )}
    >
      <Avatar className="h-10 w-10 md:h-12 md:w-12 shrink-0">
        <AvatarImage src={conversation.displayImage} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs md:text-sm">
          {getInitials(conversation.displayName)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-0.5 md:mb-1">
          <span className="font-semibold text-xs md:text-sm truncate">
            {conversation.displayName || 'Unknown'}
          </span>
          {conversation.lastMessage && (
            <span className="text-[10px] md:text-xs text-muted-foreground ml-2 shrink-0">
              {formatDistanceToNow(conversation.lastMessage.sentAt, { addSuffix: false })}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xs md:text-sm text-muted-foreground truncate">
            {getLastMessagePreview()}
          </p>
          {conversation.unreadCount > 0 && (
            <Badge variant="default" className="ml-2 h-4 min-w-4 md:h-5 md:min-w-5 flex items-center justify-center px-1 md:px-1.5 text-[10px] md:text-xs">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  )
}
