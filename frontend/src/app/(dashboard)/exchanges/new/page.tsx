'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateExchange } from '@/hooks/use-exchanges';
import { useGroups } from '@/hooks/use-groups';
import { useToast } from '@/components/ui/use-toast';

export default function NewExchangePage() {
  const router = useRouter();
  const { toast } = useToast();
  const createExchange = useCreateExchange();
  const { data: groups } = useGroups();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [exchangeDate, setExchangeDate] = useState('');
  const [drawDate, setDrawDate] = useState('');
  const [groupId, setGroupId] = useState('');
  const [isIncognito, setIsIncognito] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name for your exchange',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await createExchange.mutateAsync({
        name,
        description: description || undefined,
        budgetMin: budgetMin ? parseFloat(budgetMin) : undefined,
        budgetMax: budgetMax ? parseFloat(budgetMax) : undefined,
        exchangeDate: exchangeDate || undefined,
        drawDate: drawDate || undefined,
        currency,
        groupId: groupId || undefined,
        isIncognito,
      });

      toast({
        title: 'Success',
        description: 'Gift exchange created successfully!',
      });

      // Navigate to the new exchange
      // Response can be { success, data: Exchange } or Exchange directly
      const responseData = response as { success?: boolean; data?: { id: string }; id?: string };
      const exchangeId = responseData?.data?.id || responseData?.id;
      if (exchangeId) {
        router.push(`/exchanges/${exchangeId}`);
      } else {
        router.push('/exchanges');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create exchange. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/exchanges">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Gift Exchange</h1>
          <p className="text-muted-foreground">
            Set up a Secret Santa or gift exchange for your group.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exchange Details</CardTitle>
          <CardDescription>
            Configure your gift exchange settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Family Christmas Exchange 2025"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add any notes or rules for participants..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {groups && groups.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="group">Link to Group (Optional)</Label>
                <Select value={groupId || 'none'} onValueChange={(val) => setGroupId(val === 'none' ? '' : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No group</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Linking to a group makes it easy for members to join.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exchangeDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Exchange Date
                </Label>
                <Input
                  id="exchangeDate"
                  type="date"
                  value={exchangeDate}
                  onChange={(e) => setExchangeDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="drawDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Draw Names By
                </Label>
                <Input
                  id="drawDate"
                  type="date"
                  value={drawDate}
                  onChange={(e) => setDrawDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Budget Range (Optional)
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budgetMin" className="text-xs">Minimum</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    placeholder="0"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetMax" className="text-xs">Maximum</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    placeholder="50"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-xs">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="space-y-0.5">
                <Label htmlFor="incognito">Incognito Mode</Label>
                <p className="text-xs text-muted-foreground">
                  All exchange data will be automatically deleted 30 days after the event.
                </p>
              </div>
              <Switch
                id="incognito"
                checked={isIncognito}
                onCheckedChange={setIsIncognito}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Link href="/exchanges">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={createExchange.isPending}>
                {createExchange.isPending ? 'Creating...' : 'Create Exchange'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
