'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Share2, Settings, ExternalLink, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWishlist } from '@/hooks/use-wishlists';
import { AddItemDialog } from '@/components/wishlists/add-item-dialog';
import { ShareDialog } from '@/components/wishlists/share-dialog';
import { formatCurrency } from '@/lib/utils';

export default function WishlistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: wishlist, isLoading } = useWishlist(id);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showShare, setShowShare] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold">Wishlist not found</h2>
        <p className="text-muted-foreground mt-2">
          This wishlist may have been deleted or you don&apos;t have access.
        </p>
        <Link href="/lists">
          <Button className="mt-4">Back to Lists</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/lists">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{wishlist.title}</h1>
              <Badge variant={wishlist.isPublic ? 'default' : 'secondary'}>
                {wishlist.isPublic ? 'Public' : 'Private'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {wishlist.description || 'No description'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowShare(true)}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button className="gap-2" onClick={() => setShowAddItem(true)}>
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete List
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {wishlist.items && wishlist.items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wishlist.items.map((item) => (
            <Card key={item.id} className="group relative overflow-hidden">
              {item.imageUrl && (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base line-clamp-2">{item.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {item.description && (
                  <CardDescription className="line-clamp-2">
                    {item.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {item.price && (
                    <span className="font-semibold">
                      {formatCurrency(item.price)}
                    </span>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm flex items-center gap-1"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                {item.priority && (
                  <Badge variant="outline" className="mt-2">
                    {item.priority === 'HIGH' ? 'Must Have' : item.priority === 'MEDIUM' ? 'Nice to Have' : 'Low Priority'}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Plus className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start adding items to your wishlist. You can paste URLs or add manually.
            </p>
            <Button className="gap-2" onClick={() => setShowAddItem(true)}>
              <Plus className="h-4 w-4" />
              Add First Item
            </Button>
          </CardContent>
        </Card>
      )}

      <AddItemDialog
        open={showAddItem}
        onOpenChange={setShowAddItem}
        wishlistId={id}
      />
      <ShareDialog
        open={showShare}
        onOpenChange={setShowShare}
        wishlist={wishlist}
      />
    </div>
  );
}
