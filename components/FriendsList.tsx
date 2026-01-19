'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X, UserMinus } from 'lucide-react'
import { Id } from '@/convex/_generated/dataModel'

export function FriendsList() {
  const friends = useQuery(api.friends.getFriends)
  const friendRequests = useQuery(api.friends.getFriendRequests)
  const respondToRequest = useMutation(api.friends.respondToFriendRequest)
  const removeFriend = useMutation(api.friends.removeFriend)

  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleAccept = async (requestId: Id<'friendRequests'>) => {
    await respondToRequest({ requestId, accept: true })
  }

  const handleReject = async (requestId: Id<'friendRequests'>) => {
    await respondToRequest({ requestId, accept: false })
  }

  const handleRemoveFriend = async (friendId: Id<'users'>) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      await removeFriend({ friendId })
    }
  }

  return (
    <div className="space-y-4">
      {/* Friend Requests */}
      {friendRequests && friendRequests.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base md:text-lg">
              Friend Requests
              <Badge className="text-xs">{friendRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {friendRequests.map((request) => (
              <div
                key={request._id}
                className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-accent"
              >
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                  <Avatar className="h-8 w-8 md:h-10 md:w-10 shrink-0">
                    <AvatarImage src={request.sender?.imageUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(request.sender?.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-xs md:text-sm truncate">{request.sender?.username}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                      {request.sender?.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 md:gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleAccept(request._id)}
                    className="h-7 w-7 md:h-8 md:w-8 p-0"
                  >
                    <Check className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(request._id)}
                    className="h-7 w-7 md:h-8 md:w-8 p-0"
                  >
                    <X className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base md:text-lg">
            Friends
            <Badge variant="secondary" className="text-xs">{friends?.length || 0}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {friends && friends.length > 0 ? (
            friends.map((friend) => (
              <div
                key={friend._id}
                className="flex items-center justify-between p-2 md:p-3 rounded-lg hover:bg-accent"
              >
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <Avatar className="h-8 w-8 md:h-10 md:w-10">
                      <AvatarImage src={friend.imageUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(friend.username)}
                      </AvatarFallback>
                    </Avatar>
                    {friend.status === 'online' && (
                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-green-500 border-2 border-background" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-xs md:text-sm truncate">{friend.username}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground capitalize">
                      {friend.status || 'offline'}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveFriend(friend._id)}
                  className="h-7 w-7 md:h-8 md:w-8 p-0 shrink-0"
                >
                  <UserMinus className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center text-xs md:text-sm text-muted-foreground py-4">
              No friends yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
