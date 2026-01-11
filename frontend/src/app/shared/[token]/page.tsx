'use client';

import { use } from 'react';
import { Gift, ExternalLink, ShoppingCart, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

// This would normally use a hook to fetch the shared wishlist
// For now, we'll show a placeholder

export default function SharedWishlistPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const isLoading = false;

  // Mock data - in production, this would be fetched via the token
  const wishlist = {
    id: '1',
    title: "Sarah's Birthday Wishlist",
    description: 'Things I would love for my 30th birthday!',
    owner: { firstName: 'Sarah', lastName: 'Johnson' },
    items: [
      {
        id: '1',
        name: 'Wireless Earbuds',
        description: 'AirPods Pro or similar',
        price: 249,
        imageUrl: null,
        url: 'https://apple.com',
        priority: 'HIGH',
        isReserved: false,
      },
      {
        id: '2',
        name: 'Cozy Blanket',
        description: 'Chunky knit throw in cream color',
        price: 89,
        imageUrl: null,
        url: null,
        priority: 'MEDIUM',
        isReserved: true,
      },
      {
        id: '3',
        name: 'Coffee Table Book',
        description: 'Anything about travel or architecture',
        price: 45,
        imageUrl: null,
        url: null,
        priority: 'LOW',
        isReserved: false,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Gift className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Wishlist</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Create Your Own</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{wishlist.title}</h1>
          <p className="text-muted-foreground mt-2">
            Shared by {wishlist.owner.firstName} {wishlist.owner.lastName}
          </p>
          {wishlist.description && (
            <p className="mt-4 text-lg">{wishlist.description}</p>
          )}
        </div>

        <div className="bg-card border rounded-lg p-4 mb-8">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> When you reserve an item, {wishlist.owner.firstName} won&apos;t
            see that it&apos;s reserved. This keeps the surprise! You can unreserve anytime if
            plans change.
          </p>
        </div>

        {wishlist.items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wishlist.items.map((item) => (
              <Card key={item.id} className={item.isReserved ? 'opacity-60' : ''}>
                {item.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    {item.isReserved && (
                      <Badge variant="secondary" className="gap-1">
                        <Check className="h-3 w-3" />
                        Reserved
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <CardDescription>{item.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    {item.price && (
                      <span className="font-semibold text-lg">
                        {formatCurrency(item.price)}
                      </span>
                    )}
                    {item.priority && (
                      <Badge variant="outline">
                        {item.priority === 'HIGH'
                          ? 'Must Have'
                          : item.priority === 'MEDIUM'
                          ? 'Nice to Have'
                          : 'Low Priority'}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full gap-2">
                          <ExternalLink className="h-4 w-4" />
                          View Item
                        </Button>
                      </a>
                    )}
                    {!item.isReserved && (
                      <Button className="flex-1 gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Reserve
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Gift className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items yet</h3>
              <p className="text-muted-foreground text-center">
                This wishlist is empty. Check back later!
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Wishlist. Made with care.</p>
      </footer>
    </div>
  );
}
