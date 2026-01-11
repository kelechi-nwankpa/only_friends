'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Share2, Settings, ExternalLink, MoreHorizontal, Edit, Trash2, Package } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useWishlist, useDeleteWishlist, useDeleteWishlistItem } from '@/hooks/use-wishlists';
import { AddItemDialog } from '@/components/wishlists/add-item-dialog';
import { EditItemDialog } from '@/components/wishlists/edit-item-dialog';
import { ShareDialog } from '@/components/wishlists/share-dialog';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import type { WishlistItem } from '@/types';

export default function WishlistDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  const { data: wishlist, isLoading } = useWishlist(id);
  const deleteWishlist = useDeleteWishlist();
  const deleteItem = useDeleteWishlistItem();

  const [showAddItem, setShowAddItem] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [showDeleteWishlist, setShowDeleteWishlist] = useState(false);
  const [showDeleteItem, setShowDeleteItem] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const handleEditItem = (item: WishlistItem) => {
    setEditingItem(item);
    setShowEditItem(true);
  };

  const handleDeleteItemClick = (itemId: string) => {
    setDeletingItemId(itemId);
    setShowDeleteItem(true);
  };

  const handleDeleteItem = async () => {
    if (!deletingItemId) return;

    try {
      await deleteItem.mutateAsync({ wishlistId: id, itemId: deletingItemId });
      toast({
        title: 'Success',
        description: 'Item removed from wishlist.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to remove item. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteItem(false);
      setDeletingItemId(null);
    }
  };

  const handleDeleteWishlist = async () => {
    try {
      await deleteWishlist.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Wishlist deleted successfully.',
      });
      router.push('/lists');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete wishlist. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteWishlist(false);
    }
  };

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
              <Badge variant={wishlist.visibility === 'public' ? 'default' : 'secondary'}>
                {wishlist.visibility === 'public' ? 'Public' : wishlist.visibility === 'shared' ? 'Shared' : 'Private'}
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
              <DropdownMenuItem asChild>
                <Link href={`/lists/${id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setShowDeleteWishlist(true)}
              >
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
              <div className="aspect-video w-full overflow-hidden bg-muted flex items-center justify-center">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`flex flex-col items-center justify-center text-muted-foreground ${item.imageUrl ? 'hidden' : ''}`}>
                  <Package className="h-12 w-12 mb-2" />
                  <span className="text-xs">No image</span>
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditItem(item)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteItemClick(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {item.notes && (
                  <CardDescription className="line-clamp-2">
                    {item.notes}
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
                    {item.priority === 'high' ? 'Must Have' : item.priority === 'medium' ? 'Nice to Have' : 'Low Priority'}
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
      <EditItemDialog
        open={showEditItem}
        onOpenChange={setShowEditItem}
        wishlistId={id}
        item={editingItem}
      />
      <ShareDialog
        open={showShare}
        onOpenChange={setShowShare}
        wishlist={wishlist}
      />

      {/* Delete Item Confirmation */}
      <AlertDialog open={showDeleteItem} onOpenChange={setShowDeleteItem}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from your wishlist? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteItem.isPending ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Wishlist Confirmation */}
      <AlertDialog open={showDeleteWishlist} onOpenChange={setShowDeleteWishlist}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Wishlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this wishlist? All items will be permanently removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWishlist}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteWishlist.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
