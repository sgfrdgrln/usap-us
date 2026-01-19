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
        'w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-accent',
        isActive && 'bg-accent'
      )}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={conversation.displayImage} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {getInitials(conversation.displayName)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-sm truncate">
            {conversation.displayName || 'Unknown'}
          </span>
          {conversation.lastMessage && (
            <span className="text-xs text-muted-foreground ml-2">
              {formatDistanceToNow(conversation.lastMessage.sentAt, { addSuffix: false })}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">
            {getLastMessagePreview()}
          </p>
          {conversation.unreadCount > 0 && (
            <Badge variant="default" className="ml-2 h-5 min-w-5 flex items-center justify-center px-1.5">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  )
}
