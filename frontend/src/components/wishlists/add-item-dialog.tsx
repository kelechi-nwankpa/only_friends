'use client';

import { useState } from 'react';
import { Loader2, Link as LinkIcon, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useAddWishlistItem } from '@/hooks/use-wishlists';
import { useToast } from '@/components/ui/use-toast';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wishlistId: string;
}

export function AddItemDialog({ open, onOpenChange, wishlistId }: AddItemDialogProps) {
  const { toast } = useToast();
  const addItem = useAddWishlistItem();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isImporting, setIsImporting] = useState(false);

  const handleUrlImport = async () => {
    if (!url) return;

    setIsImporting(true);
    // TODO: Implement URL scraping on backend
    // For now, just set the URL and let user fill in details
    setIsImporting(false);
    toast({
      title: 'URL added',
      description: 'Please fill in the item details manually for now.',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name for the item',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addItem.mutateAsync({
        wishlistId,
        data: {
          title,
          notes: notes || undefined,
          url: url || undefined,
          imageUrl: imageUrl || undefined,
          price: price ? parseFloat(price) : undefined,
          priority,
        },
      });

      toast({
        title: 'Success',
        description: 'Item added to wishlist!',
      });

      // Reset form
      setUrl('');
      setTitle('');
      setNotes('');
      setPrice('');
      setImageUrl('');
      setPriority('medium');
      onOpenChange(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add item. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Item to Wishlist</DialogTitle>
          <DialogDescription>
            Add an item by pasting a URL or entering details manually.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="gap-2">
              <LinkIcon className="h-4 w-4" />
              From URL
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              <Package className="h-4 w-4" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Product URL</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  placeholder="https://amazon.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleUrlImport}
                  disabled={!url || isImporting}
                >
                  {isImporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Import'
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a link from any store to auto-fill details
              </p>
            </div>
          </TabsContent>

          <TabsContent value="manual">
            {/* Manual entry uses the same form below */}
          </TabsContent>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Item Name *</Label>
            <Input
              id="title"
              placeholder="Blue Sweater"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Size medium, navy blue color..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="49.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Must Have</SelectItem>
                  <SelectItem value="medium">Nice to Have</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addItem.isPending}>
              {addItem.isPending ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
