'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { UserPlus, Users, Search } from 'lucide-react'
import { useState } from 'react'

interface UserSearchProps {
  onSelectUser?: (userId: string) => void
}

export function UserSearch({ onSelectUser }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const searchResults = useQuery(
    api.users.searchUsers,
    searchTerm.length > 0 ? { searchTerm } : 'skip'
  )

  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Find Users
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {searchResults && searchResults.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.imageUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onSelectUser?.(user._id)}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            ))}
          </div>
        )}

        {searchResults && searchResults.length === 0 && searchTerm.length > 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No users found
          </p>
        )}
      </CardContent>
    </Card>
  )
}
