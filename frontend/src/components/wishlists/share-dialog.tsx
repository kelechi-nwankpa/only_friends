'use client';

import { useState } from 'react';
import { Copy, Check, Mail, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useShareWishlist } from '@/hooks/use-wishlists';
import { useToast } from '@/components/ui/use-toast';
import type { Wishlist } from '@/types';
import { generateShareUrl } from '@/lib/utils';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wishlist: Wishlist;
}

export function ShareDialog({ open, onOpenChange, wishlist }: ShareDialogProps) {
  const { toast } = useToast();
  const shareWishlist = useShareWishlist();

  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'VIEW' | 'EDIT'>('VIEW');
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const publicUrl = generateShareUrl(wishlist.id);

  const handleCopyLink = async () => {
    const urlToCopy = shareUrl || publicUrl;
    await navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    toast({
      title: 'Link copied',
      description: 'Share link has been copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateLink = async () => {
    try {
      const result = await shareWishlist.mutateAsync({
        wishlistId: wishlist.id,
        permission,
      });
      setShareUrl(result.shareUrl);
      toast({
        title: 'Link generated',
        description: 'A shareable link has been created',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to generate share link',
        variant: 'destructive',
      });
    }
  };

  const handleSendInvite = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      await shareWishlist.mutateAsync({
        wishlistId: wishlist.id,
        email,
        permission,
      });
      toast({
        title: 'Invite sent',
        description: `An invitation has been sent to ${email}`,
      });
      setEmail('');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share &quot;{wishlist.title}&quot;</DialogTitle>
          <DialogDescription>
            Share your wishlist via link or email invitation.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link" className="gap-2">
              <LinkIcon className="h-4 w-4" />
              Share Link
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              Email Invite
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            {wishlist.isPublic ? (
              <div className="space-y-2">
                <Label>Public Link</Label>
                <div className="flex gap-2">
                  <Input value={publicUrl} readOnly />
                  <Button variant="outline" size="icon" onClick={handleCopyLink}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Anyone with this link can view your wishlist
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Permission Level</Label>
                  <Select value={permission} onValueChange={(v) => setPermission(v as typeof permission)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEW">Can view only</SelectItem>
                      <SelectItem value="EDIT">Can reserve gifts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {shareUrl ? (
                  <div className="space-y-2">
                    <Label>Share Link</Label>
                    <div className="flex gap-2">
                      <Input value={shareUrl} readOnly />
                      <Button variant="outline" size="icon" onClick={handleCopyLink}>
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleGenerateLink}
                    disabled={shareWishlist.isPending}
                  >
                    Generate Share Link
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Permission Level</Label>
              <Select value={permission} onValueChange={(v) => setPermission(v as typeof permission)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIEW">Can view only</SelectItem>
                  <SelectItem value="EDIT">Can reserve gifts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              onClick={handleSendInvite}
              disabled={shareWishlist.isPending || !email}
            >
              {shareWishlist.isPending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
