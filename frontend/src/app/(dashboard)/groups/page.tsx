'use client';

import Link from 'next/link';
import { Plus, Users, MoreHorizontal, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGroups } from '@/hooks/use-groups';
import { Skeleton } from '@/components/ui/skeleton';

export default function GroupsPage() {
  const { data: groups, isLoading } = useGroups();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground">
            Create groups to share wishlists with family and friends.
          </p>
        </div>
        <Link href="/groups/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Group
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : groups && groups.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id} className="group relative">
              <Link href={`/groups/${group.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                  </div>
                  <CardDescription>
                    {group.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {group.members?.slice(0, 5).map((member) => (
                        <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                          <AvatarImage src={member.user?.imageUrl} />
                          <AvatarFallback>
                            {member.user?.firstName?.[0] || member.user?.email?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {(group._count?.members || 0) > 5 && (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                          +{(group._count?.members || 0) - 5}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {group._count?.members || 0} members
                    </span>
                  </div>
                </CardContent>
              </Link>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Leave Group
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create a group to share wishlists with family and friends.
            </p>
            <Link href="/groups/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Group
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
