'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { UserPlus, Search } from 'lucide-react'
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
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Search className="h-4 w-4 md:h-5 md:w-5" />
          Find Users
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        <Input
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-sm md:text-base"
        />

        {searchResults && searchResults.length > 0 && (
          <div className="space-y-2 max-h-80 md:max-h-96 overflow-y-auto">
            {searchResults.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-2 md:p-3 rounded-lg hover:bg-accent"
              >
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                  <Avatar className="h-8 w-8 md:h-10 md:w-10 shrink-0">
                    <AvatarImage src={user.imageUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-xs md:text-sm truncate">{user.username}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onSelectUser?.(user._id)}
                  className="shrink-0 h-7 md:h-8 text-xs md:text-sm px-2 md:px-3"
                >
                  <UserPlus className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                  <span className="hidden sm:inline ml-1">Add</span>
                </Button>
              </div>
            ))}
          </div>
        )}

        {searchResults && searchResults.length === 0 && searchTerm.length > 0 && (
          <p className="text-center text-xs md:text-sm text-muted-foreground py-4">
            No users found
          </p>
        )}
      </CardContent>
    </Card>
  )
}
