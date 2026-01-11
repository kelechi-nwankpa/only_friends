'use client';

import { useState } from 'react';
import { Copy, Check, Link as LinkIcon, Trash2 } from 'lucide-react';
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
import { useGenerateShareLink, useRevokeShareLink } from '@/hooks/use-wishlists';
import { useToast } from '@/components/ui/use-toast';
import type { Wishlist } from '@/types';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wishlist: Wishlist;
}

export function ShareDialog({ open, onOpenChange, wishlist }: ShareDialogProps) {
  const { toast } = useToast();
  const generateLink = useGenerateShareLink();
  const revokeLink = useRevokeShareLink();

  const [copied, setCopied] = useState(false);

  // Check if wishlist already has a share link
  const existingShareUrl = wishlist.shareSlug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/list/${wishlist.shareSlug}`
    : null;

  const handleCopyLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast({
      title: 'Link copied',
      description: 'Share link has been copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateLink = async () => {
    try {
      const result = await generateLink.mutateAsync(wishlist.id);
      toast({
        title: 'Link generated',
        description: 'A shareable link has been created',
      });
      // Copy to clipboard automatically
      await navigator.clipboard.writeText(result.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to generate share link',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeLink = async () => {
    try {
      await revokeLink.mutateAsync(wishlist.id);
      toast({
        title: 'Link revoked',
        description: 'The share link has been disabled',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to revoke share link',
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
            Generate a link to share your wishlist with friends and family.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {existingShareUrl ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input value={existingShareUrl} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyLink(existingShareUrl)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Anyone with this link can view your wishlist and reserve gifts
                </p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <div>
                  <p className="text-sm font-medium">Revoke access</p>
                  <p className="text-xs text-muted-foreground">
                    Disable this link permanently
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRevokeLink}
                  disabled={revokeLink.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {revokeLink.isPending ? 'Revoking...' : 'Revoke'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8 border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <LinkIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No share link exists yet
                  </p>
                  <Button
                    onClick={handleGenerateLink}
                    disabled={generateLink.isPending}
                  >
                    {generateLink.isPending ? 'Generating...' : 'Generate Share Link'}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Once generated, anyone with the link can view your wishlist and reserve gifts.
                The list owner (you) will never see who reserved what - keeping gifts a surprise!
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
