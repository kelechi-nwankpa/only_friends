'use client';

import Link from 'next/link';
import { Plus, Calendar, Gift, Users, MoreHorizontal, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useExchanges } from '@/hooks/use-exchanges';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function ExchangesPage() {
  const { data: exchanges, isLoading } = useExchanges();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gift Exchanges</h1>
          <p className="text-muted-foreground">
            Organize Secret Santa and gift exchanges with automatic name drawing.
          </p>
        </div>
        <Link href="/exchanges/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Exchange
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
      ) : exchanges && exchanges.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exchanges.map((exchange) => (
            <Card key={exchange.id} className="group relative">
              <Link href={`/exchanges/${exchange.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{exchange.name}</CardTitle>
                    <Badge
                      variant={
                        exchange.status === 'ACTIVE'
                          ? 'default'
                          : exchange.status === 'DRAWING_COMPLETE'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {exchange.status === 'ACTIVE'
                        ? 'Active'
                        : exchange.status === 'DRAWING_COMPLETE'
                        ? 'Drawing Done'
                        : exchange.status === 'COMPLETED'
                        ? 'Completed'
                        : 'Draft'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {exchange.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {exchange.exchangeDate
                        ? formatDate(exchange.exchangeDate)
                        : 'No date set'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {exchange._count?.participants || 0}
                    </span>
                  </div>
                  {exchange.budget && (
                    <div className="flex items-center gap-1 text-sm">
                      <Gift className="h-4 w-4 text-primary" />
                      Budget: {formatCurrency(exchange.budget)}
                    </div>
                  )}
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
                      Delete
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
            <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No gift exchanges yet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Create a gift exchange to organize Secret Santa or other gift-giving events
              with automatic name drawing and exclusion rules.
            </p>
            <Link href="/exchanges/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Exchange
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
