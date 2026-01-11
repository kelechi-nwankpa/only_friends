'use client';

import { useState } from 'react';
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
import { useCreateWishlist } from '@/hooks/use-wishlists';
import { useToast } from '@/components/ui/use-toast';

const wishlistTypes = [
  { value: 'general', label: 'General' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'christmas', label: 'Christmas' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'baby', label: 'Baby Shower' },
  { value: 'home', label: 'Home' },
] as const;

export default function NewListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createWishlist = useCreateWishlist();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'general' | 'birthday' | 'christmas' | 'wedding' | 'baby' | 'home'>('general');
  const [visibility, setVisibility] = useState<'private' | 'shared' | 'public'>('private');

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
      const wishlist = await createWishlist.mutateAsync({
        title,
        description,
        type,
        visibility,
      });

      toast({
        title: 'Success',
        description: 'Wishlist created successfully!',
      });

      router.push(`/lists/${wishlist.id}`);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create wishlist. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/lists">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Wishlist</h1>
          <p className="text-muted-foreground">
            Start a new wishlist for any occasion.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wishlist Details</CardTitle>
          <CardDescription>
            Give your wishlist a name and description so others know what it&apos;s for.
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
              <Link href="/lists">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={createWishlist.isPending}>
                {createWishlist.isPending ? 'Creating...' : 'Create Wishlist'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
