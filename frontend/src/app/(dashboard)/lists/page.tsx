'use client';

import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { useWishlists, useDeleteWishlist } from '@/hooks/use-wishlists';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

export default function ListsPage() {
  const { data: wishlists, isLoading } = useWishlists();
  const deleteWishlist = useDeleteWishlist();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingWishlistId, setDeletingWishlistId] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, wishlistId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingWishlistId(wishlistId);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!deletingWishlistId) return;

    try {
      await deleteWishlist.mutateAsync(deletingWishlistId);
      toast({
        title: 'Success',
        description: 'Wishlist deleted successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete wishlist. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteDialog(false);
      setDeletingWishlistId(null);
    }
  };

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
                      <DropdownMenuItem asChild>
                        <Link href={`/lists/${list.id}/edit`} onClick={(e) => e.stopPropagation()}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/lists/${list.id}`} onClick={(e) => e.stopPropagation()}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => handleDeleteClick(e, list.id)}
                      >
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
              onClick={handleDelete}
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
