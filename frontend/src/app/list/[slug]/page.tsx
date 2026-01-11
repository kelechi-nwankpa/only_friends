'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Gift, ExternalLink, Package, Check, ShoppingBag } from 'lucide-react';
import { SignInButton, useAuth, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useSharedWishlist,
  useReserveItem,
  useUnreserveItem,
  useMarkAsPurchased,
} from '@/hooks/use-wishlists';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';

export default function SharedWishlistPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { isSignedIn } = useAuth();
  const { data: wishlist, isLoading, error } = useSharedWishlist(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="text-center">
              <Skeleton className="h-10 w-64 mx-auto" />
              <Skeleton className="h-5 w-48 mx-auto mt-2" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !wishlist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Gift className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Wishlist Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This wishlist may have been removed or the link is invalid.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{wishlist.title}</h1>
              {wishlist.description && (
                <p className="text-muted-foreground mt-1">{wishlist.description}</p>
              )}
              {wishlist.owner && (
                <p className="text-sm text-muted-foreground mt-2">
                  by {wishlist.owner.name || 'Someone special'}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isSignedIn && (
                <SignInButton mode="modal" fallbackRedirectUrl={`/list/${slug}`}>
                  <Button variant="outline">Sign in to reserve</Button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Items */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {wishlist.items && wishlist.items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wishlist.items.map((item) => (
              <WishlistItemCard
                key={item.id}
                item={item}
                slug={slug}
                isSignedIn={isSignedIn ?? false}
                isOwner={wishlist.isOwner ?? false}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Gift className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items yet</h3>
              <p className="text-muted-foreground text-center">
                This wishlist doesn&apos;t have any items yet.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Sign in prompt for guests */}
        {!isSignedIn && wishlist.items && wishlist.items.length > 0 && (
          <div className="mt-8 p-6 bg-muted rounded-lg text-center">
            <h3 className="font-semibold mb-2">Want to reserve a gift?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sign in to mark items as reserved so others know what you&apos;re getting.
              The wishlist owner won&apos;t see who reserved what!
            </p>
            <SignInButton mode="modal">
              <Button>Sign in</Button>
            </SignInButton>
          </div>
        )}
      </main>
    </div>
  );
}

interface WishlistItemCardProps {
  item: {
    id: string;
    title: string;
    notes?: string;
    url?: string;
    imageUrl?: string;
    price?: number;
    currency?: string;
    priority?: string;
    reservation?: {
      status: string;
      reserver?: { id: string; clerkId?: string; name: string };
    } | null;
  };
  slug: string;
  isSignedIn: boolean;
  isOwner: boolean;
}

function WishlistItemCard({ item, slug, isSignedIn, isOwner }: WishlistItemCardProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const reserveItem = useReserveItem();
  const unreserveItem = useUnreserveItem();
  const markAsPurchased = useMarkAsPurchased();

  const isReserved = item.reservation?.status === 'reserved';
  const isPurchased = item.reservation?.status === 'purchased';
  const isMyReservation = item.reservation?.reserver?.clerkId === user?.id;

  const handleReserve = async () => {
    if (!isSignedIn || isOwner) return;

    try {
      await reserveItem.mutateAsync({ itemId: item.id, slug });
      toast({
        title: 'Reserved!',
        description: 'You\'ve reserved this gift. The wishlist owner won\'t know it was you!',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to reserve item. It may already be reserved.',
        variant: 'destructive',
      });
    }
  };

  const handleUnreserve = async () => {
    try {
      await unreserveItem.mutateAsync({ itemId: item.id, slug });
      toast({
        title: 'Unreserved',
        description: 'You\'ve released your reservation on this gift.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to unreserve item.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkPurchased = async () => {
    try {
      await markAsPurchased.mutateAsync({ itemId: item.id, slug });
      toast({
        title: 'Marked as purchased!',
        description: 'Great! Others will know this gift has been bought.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to mark as purchased.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className={`group relative overflow-hidden ${isReserved || isPurchased ? 'opacity-75' : ''}`}>
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

      {/* Reserved/Purchased overlay */}
      {(isReserved || isPurchased) && !isOwner && (
        <div className="absolute top-2 right-2">
          <Badge variant={isPurchased ? 'default' : 'secondary'} className="gap-1">
            {isPurchased ? (
              <>
                <ShoppingBag className="h-3 w-3" />
                Purchased
              </>
            ) : (
              <>
                <Check className="h-3 w-3" />
                {isMyReservation ? 'You reserved this' : 'Reserved'}
              </>
            )}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-2">
        <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
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
              {formatCurrency(item.price, item.currency)}
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

        {/* Actions for signed-in non-owners */}
        {isSignedIn && !isOwner && (
          <div className="mt-3 space-y-2">
            {!isReserved && !isPurchased && (
              <Button
                className="w-full"
                size="sm"
                variant="secondary"
                onClick={handleReserve}
                disabled={reserveItem.isPending}
              >
                {reserveItem.isPending ? 'Reserving...' : 'Reserve This Gift'}
              </Button>
            )}

            {isMyReservation && isReserved && !isPurchased && (
              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="sm"
                  onClick={handleMarkPurchased}
                  disabled={markAsPurchased.isPending}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {markAsPurchased.isPending ? 'Saving...' : "I've Bought This"}
                </Button>
                <Button
                  className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  size="sm"
                  variant="outline"
                  onClick={handleUnreserve}
                  disabled={unreserveItem.isPending}
                >
                  {unreserveItem.isPending ? 'Canceling...' : 'Cancel Reservation'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
