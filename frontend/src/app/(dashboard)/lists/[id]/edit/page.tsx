'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useWishlist, useUpdateWishlist, useWishlistShares, useShareWithGroup, useUnshareFromGroup } from '@/hooks/use-wishlists';
import { useGroups } from '@/hooks/use-groups';
import { useToast } from '@/components/ui/use-toast';

const wishlistTypes = [
  { value: 'general', label: 'General' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'christmas', label: 'Christmas' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'baby', label: 'Baby Shower' },
  { value: 'home', label: 'Home' },
] as const;

export default function EditListPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  const { data: wishlist, isLoading } = useWishlist(id);
  const { data: shares } = useWishlistShares(id);
  const { data: groups } = useGroups();
  const updateWishlist = useUpdateWishlist();
  const shareWithGroup = useShareWithGroup();
  const unshareFromGroup = useUnshareFromGroup();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'general' | 'birthday' | 'christmas' | 'wedding' | 'baby' | 'home'>('general');
  const [visibility, setVisibility] = useState<'private' | 'shared' | 'public'>('private');

  // Groups this wishlist is shared with
  const sharedGroupIds = shares?.groups?.map(g => g.id) || [];
  // Groups available to share with (user's groups not already shared)
  const availableGroups = groups?.filter(g => !sharedGroupIds.includes(g.id)) || [];

  useEffect(() => {
    if (wishlist) {
      setTitle(wishlist.title);
      setDescription(wishlist.description || '');
      setType((wishlist.type as typeof type) || 'general');
      setVisibility(wishlist.visibility || 'private');
    }
  }, [wishlist]);

  const handleShareWithGroup = async (groupId: string) => {
    try {
      await shareWithGroup.mutateAsync({ wishlistId: id, groupId });
      toast({ title: 'Shared', description: 'Wishlist shared with group' });
    } catch {
      toast({ title: 'Error', description: 'Failed to share with group', variant: 'destructive' });
    }
  };

  const handleUnshareFromGroup = async (groupId: string) => {
    try {
      await unshareFromGroup.mutateAsync({ wishlistId: id, groupId });
      toast({ title: 'Removed', description: 'Wishlist unshared from group' });
    } catch {
      toast({ title: 'Error', description: 'Failed to unshare from group', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title for your wishlist',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateWishlist.mutateAsync({
        id,
        data: {
          title,
          description: description || undefined,
          type,
          visibility,
        },
      });

      toast({
        title: 'Success',
        description: 'Wishlist updated successfully!',
      });

      router.push(`/lists/${id}`);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update wishlist. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/lists/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Wishlist</h1>
          <p className="text-muted-foreground">
            Update your wishlist details.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wishlist Details</CardTitle>
          <CardDescription>
            Update your wishlist name and settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="My Birthday Wishlist"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add any helpful notes for gift-givers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {wishlistTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={visibility}
                onValueChange={(v) => setVisibility(v as typeof visibility)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private - Only people you share with</SelectItem>
                  <SelectItem value="shared">Shared - With specific groups</SelectItem>
                  <SelectItem value="public">Public - Anyone with the link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Group sharing section - show when visibility is 'shared' */}
            {visibility === 'shared' && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <Label>Share with Groups</Label>
                </div>

                {/* Currently shared groups */}
                {shares?.groups && shares.groups.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Shared with:</p>
                    <div className="flex flex-wrap gap-2">
                      {shares.groups.map((group) => (
                        <Badge key={group.id} variant="secondary" className="gap-1 pr-1">
                          {group.name}
                          <button
                            type="button"
                            onClick={() => handleUnshareFromGroup(group.id)}
                            className="ml-1 hover:bg-muted rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add group selector */}
                {availableGroups.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Add group:</p>
                    <Select onValueChange={handleShareWithGroup}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group to share with" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : groups?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    You&apos;re not a member of any groups yet.{' '}
                    <Link href="/groups" className="text-primary hover:underline">
                      Create or join a group
                    </Link>
                  </p>
                ) : sharedGroupIds.length > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Shared with all your groups
                  </p>
                ) : null}
              </div>
            )}

            <div className="flex gap-4 justify-end">
              <Link href={`/lists/${id}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={updateWishlist.isPending}>
                {updateWishlist.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
