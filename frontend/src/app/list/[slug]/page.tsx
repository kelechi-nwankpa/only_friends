'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Gift, ExternalLink, Package, Check, ShoppingBag } from 'lucide-react';
import { SignInButton, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSharedWishlist } from '@/hooks/use-wishlists';
import { formatCurrency } from '@/lib/utils';

export default function SharedWishlistPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
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
                  by {wishlist.owner.firstName || wishlist.owner.email || 'Someone special'}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isSignedIn && (
                <SignInButton mode="modal">
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
      reserver?: { id: string; name: string };
    } | null;
  };
  isSignedIn: boolean;
  isOwner: boolean;
}

function WishlistItemCard({ item, isSignedIn, isOwner }: WishlistItemCardProps) {
  const [isReserving, setIsReserving] = useState(false);

  const isReserved = item.reservation?.status === 'reserved';
  const isPurchased = item.reservation?.status === 'purchased';

  const handleReserve = async () => {
    if (!isSignedIn || isOwner) return;
    setIsReserving(true);
    // TODO: Implement reservation API call
    setTimeout(() => setIsReserving(false), 1000);
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
                Reserved
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

        {/* Reserve button for signed-in non-owners */}
        {isSignedIn && !isOwner && !isReserved && !isPurchased && (
          <Button
            className="w-full mt-3"
            size="sm"
            variant="secondary"
            onClick={handleReserve}
            disabled={isReserving}
          >
            {isReserving ? 'Reserving...' : 'Reserve This Gift'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
