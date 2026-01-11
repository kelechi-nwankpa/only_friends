'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateWishlist, useShareWithGroup } from '@/hooks/use-wishlists';
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

export default function NewListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createWishlist = useCreateWishlist();
  const shareWithGroup = useShareWithGroup();
  const { data: groups } = useGroups();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'general' | 'birthday' | 'christmas' | 'wedding' | 'baby' | 'home'>('general');
  const [visibility, setVisibility] = useState<'private' | 'shared' | 'public'>('private');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  // Get selected groups for display
  const selectedGroups = groups?.filter(g => selectedGroupIds.includes(g.id)) || [];
  // Get available groups (not yet selected)
  const availableGroups = groups?.filter(g => !selectedGroupIds.includes(g.id)) || [];

  const handleAddGroup = (groupId: string) => {
    setSelectedGroupIds(prev => [...prev, groupId]);
  };

  const handleRemoveGroup = (groupId: string) => {
    setSelectedGroupIds(prev => prev.filter(id => id !== groupId));
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
      const wishlist = await createWishlist.mutateAsync({
        title,
        description,
        type,
        visibility,
      });

      // Share with selected groups after creation
      if (visibility === 'shared' && selectedGroupIds.length > 0) {
        await Promise.all(
          selectedGroupIds.map(groupId =>
            shareWithGroup.mutateAsync({ wishlistId: wishlist.id, groupId })
          )
        );
      }

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

            {/* Group sharing section - show when visibility is 'shared' */}
            {visibility === 'shared' && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <Label>Share with Groups</Label>
                </div>

                {/* Selected groups */}
                {selectedGroups.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Will be shared with:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedGroups.map((group) => (
                        <Badge key={group.id} variant="secondary" className="gap-1 pr-1">
                          {group.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveGroup(group.id)}
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
                    <p className="text-sm text-muted-foreground">
                      {selectedGroups.length > 0 ? 'Add another group:' : 'Select a group:'}
                    </p>
                    <Select onValueChange={handleAddGroup} value="">
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
                ) : selectedGroups.length > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    All your groups are selected
                  </p>
                ) : null}
              </div>
            )}

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
