'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Gift, Copy, RefreshCw, UserMinus, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useGroup,
  useGroupWishlists,
  useGenerateInviteCode,
  useRemoveGroupMember,
  useDeleteGroup,
} from '@/hooks/use-groups';
import { useToast } from '@/components/ui/use-toast';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const groupId = params.id as string;

  const { data: group, isLoading } = useGroup(groupId);
  const { data: wishlists } = useGroupWishlists(groupId);
  const generateInviteCode = useGenerateInviteCode();
  const removeMember = useRemoveGroupMember();
  const deleteGroup = useDeleteGroup();

  const [inviteUrl, setInviteUrl] = useState('');

  const isAdmin = group?.myRole === 'admin';

  const handleCopyInviteCode = async () => {
    if (!group?.inviteCode) return;

    const url = `${window.location.origin}/groups/join/${group.inviteCode}`;
    setInviteUrl(url);

    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Copied!',
        description: 'Invite link copied to clipboard',
      });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Please copy the link manually',
        variant: 'destructive',
      });
    }
  };

  const handleRegenerateCode = async () => {
    try {
      await generateInviteCode.mutateAsync(groupId);
      toast({
        title: 'New code generated',
        description: 'The old invite link will no longer work',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to generate new invite code',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    try {
      await removeMember.mutateAsync({ groupId, userId });
      toast({
        title: 'Member removed',
        description: `${memberName} has been removed from the group`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup.mutateAsync(groupId);
      toast({
        title: 'Group deleted',
        description: 'The group has been permanently deleted',
      });
      router.push('/groups');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete group',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Group not found</h2>
        <p className="text-muted-foreground mb-4">
          This group doesn&apos;t exist or you don&apos;t have access.
        </p>
        <Link href="/groups">
          <Button>Back to Groups</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/groups">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
            {group.description && (
              <p className="text-muted-foreground">{group.description}</p>
            )}
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Group</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;{group.name}&quot;? This action cannot be undone.
                    All members will be removed and shared wishlists will be unlinked.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteGroup}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Group
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Invite Section */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Invite Members
              </CardTitle>
              <CardDescription>
                Share this link to invite people to your group
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={inviteUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/groups/join/${group.inviteCode || '...'}`}
                  className="font-mono text-sm"
                />
                <Button onClick={handleCopyInviteCode} variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerateCode}
                disabled={generateInviteCode.isPending}
                className="text-muted-foreground"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${generateInviteCode.isPending ? 'animate-spin' : ''}`} />
                Generate new link
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Members Section */}
        <Card className={isAdmin ? '' : 'md:col-span-2'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members ({group.members?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {group.members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatarUrl} />
                      <AvatarFallback>
                        {member.name?.[0] || member.email?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name || member.email}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                      {member.role}
                    </Badge>
                    {isAdmin && member.role !== 'admin' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {member.name || member.email} from the group?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveMember(member.id, member.name || member.email || 'Member')}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Group Wishlists */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Shared Wishlists
          </CardTitle>
          <CardDescription>
            Wishlists shared with this group
          </CardDescription>
        </CardHeader>
        <CardContent>
          {wishlists && wishlists.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {wishlists.map((wishlist) => (
                <Link key={wishlist.id} href={`/lists/${wishlist.id}`}>
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{wishlist.title}</CardTitle>
                      <CardDescription>
                        {wishlist.itemCount} items
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={wishlist.owner.avatarUrl} />
                          <AvatarFallback>{wishlist.owner.name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          {wishlist.owner.name}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">
                No wishlists shared with this group yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Members can share their wishlists from the Lists page
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
