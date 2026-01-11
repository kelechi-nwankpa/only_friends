'use client';

import Link from 'next/link';
import { Plus, Gift, MoreHorizontal, Share2, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useWishlists } from '@/hooks/use-wishlists';
import { Skeleton } from '@/components/ui/skeleton';

export default function ListsPage() {
  const { data: wishlists, isLoading } = useWishlists();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Wishlists</h1>
          <p className="text-muted-foreground">
            Create and manage your wishlists for any occasion.
          </p>
        </div>
        <Link href="/lists/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Wishlist
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
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : wishlists && wishlists.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wishlists.map((list) => {
            const isPublic = list.visibility === 'public' || list.isPublic;
            return (
              <Card key={list.id} className="group relative overflow-visible">
                <Link href={`/lists/${list.id}`}>
                  <CardHeader className="pr-12">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{list.title}</CardTitle>
                      <Badge variant={isPublic ? 'default' : 'secondary'}>
                        {isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                    <CardDescription>{list.description || list.type || 'No description'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {list.itemCount ?? list._count?.items ?? 0} items
                    </p>
                  </CardContent>
                </Link>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.preventDefault()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Gift className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No wishlists yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first wishlist to start tracking gifts you&apos;d love to receive.
            </p>
            <Link href="/lists/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Wishlist
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
