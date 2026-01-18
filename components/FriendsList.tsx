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
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Friend Requests
              <Badge>{friendRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {friendRequests.map((request) => (
              <div
                key={request._id}
                className="flex items-center justify-between p-3 rounded-lg bg-accent"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={request.sender?.imageUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(request.sender?.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{request.sender?.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.sender?.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleAccept(request._id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(request._id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Friends
            <Badge variant="secondary">{friends?.length || 0}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {friends && friends.length > 0 ? (
            friends.map((friend) => (
              <div
                key={friend._id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={friend.imageUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(friend.username)}
                      </AvatarFallback>
                    </Avatar>
                    {friend.status === 'online' && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{friend.username}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {friend.status || 'offline'}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveFriend(friend._id)}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              No friends yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
