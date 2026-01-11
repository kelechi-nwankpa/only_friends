'use client';

import Link from 'next/link';
import { Gift, Users, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWishlists } from '@/hooks/use-wishlists';
import { useGroups } from '@/hooks/use-groups';

export default function DashboardPage() {
  const { data: wishlists, isLoading: wishlistsLoading } = useWishlists();
  const { data: groups, isLoading: groupsLoading } = useGroups();

  const wishlistCount = wishlists?.length ?? 0;
  const groupCount = groups?.length ?? 0;
  const recentWishlists = wishlists?.slice(0, 3) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your wishlists.
          </p>
        </div>
        <Link href="/lists/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Wishlist
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Wishlists</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {wishlistsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{wishlistCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
              across all occasions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {groupsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{groupCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
              active groups
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gift Exchanges</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              upcoming exchanges
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Wishlists</CardTitle>
            <CardDescription>
              Your most recently updated wishlists
            </CardDescription>
          </CardHeader>
          <CardContent>
            {wishlistsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : recentWishlists.length > 0 ? (
              <div className="space-y-3">
                {recentWishlists.map((list) => (
                  <Link
                    key={list.id}
                    href={`/lists/${list.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="font-medium">{list.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {list.itemCount ?? list._count?.items ?? 0} items
                      </p>
                    </div>
                    <Gift className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No wishlists yet</p>
                <Link href="/lists/new">
                  <Button variant="link" className="mt-2">
                    Create your first wishlist
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>
              Gift exchanges and important dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming events</p>
              <Link href="/exchanges/new">
                <Button variant="link" className="mt-2">
                  Create a gift exchange
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
