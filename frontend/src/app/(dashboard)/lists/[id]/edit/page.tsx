'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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
import { useWishlist, useUpdateWishlist } from '@/hooks/use-wishlists';
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
  const updateWishlist = useUpdateWishlist();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'general' | 'birthday' | 'christmas' | 'wedding' | 'baby' | 'home'>('general');
  const [visibility, setVisibility] = useState<'private' | 'shared' | 'public'>('private');

  useEffect(() => {
    if (wishlist) {
      setTitle(wishlist.title);
      setDescription(wishlist.description || '');
      setType((wishlist.type as typeof type) || 'general');
      setVisibility(wishlist.visibility || 'private');
    }
  }, [wishlist]);

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
