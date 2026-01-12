'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Users,
  Gift,
  Shuffle,
  UserPlus,
  Trash2,
  MoreVertical,
  X,
  UserMinus,
  Eye,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useExchange,
  useDrawNames,
  useDeleteExchange,
  useMyAssignment,
  useAddParticipant,
  useRemoveParticipant,
  useExclusions,
  useAddExclusion,
  useRemoveExclusion,
  useRevealAssignment,
} from '@/hooks/use-exchanges';
import { useToast } from '@/components/ui/use-toast';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ExchangeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const { data: exchange, isLoading, error } = useExchange(id);
  const { data: assignment } = useMyAssignment(id);
  const { data: exclusions } = useExclusions(id);
  const drawNames = useDrawNames();
  const deleteExchange = useDeleteExchange();
  const addParticipant = useAddParticipant();
  const removeParticipant = useRemoveParticipant();
  const addExclusion = useAddExclusion();
  const removeExclusion = useRemoveExclusion();
  const revealAssignment = useRevealAssignment();

  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showAddExclusion, setShowAddExclusion] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDrawConfirm, setShowDrawConfirm] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Add participant form state
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');

  // Exclusion form state
  const [exclusionParticipantA, setExclusionParticipantA] = useState('');
  const [exclusionParticipantB, setExclusionParticipantB] = useState('');
  const [exclusionReason, setExclusionReason] = useState('spouse');

  const handleDrawNames = async () => {
    try {
      await drawNames.mutateAsync(id);
      toast({
        title: 'Names Drawn!',
        description: 'All participants have been assigned their Secret Santa.',
      });
      setShowDrawConfirm(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to draw names',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteExchange.mutateAsync(id);
      toast({ title: 'Exchange deleted' });
      router.push('/exchanges');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete exchange',
        variant: 'destructive',
      });
    }
  };

  const handleAddParticipant = async () => {
    if (!newParticipantName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await addParticipant.mutateAsync({
        exchangeId: id,
        name: newParticipantName,
        email: newParticipantEmail || undefined,
      });

      toast({
        title: 'Participant Added',
        description: result.magicLink
          ? 'Share the magic link to invite them!'
          : 'Participant added successfully',
      });

      setNewParticipantName('');
      setNewParticipantEmail('');
      setShowAddParticipant(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add participant',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      await removeParticipant.mutateAsync({ exchangeId: id, participantId });
      toast({ title: 'Participant removed' });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to remove participant',
        variant: 'destructive',
      });
    }
  };

  const handleAddExclusion = async () => {
    if (!exclusionParticipantA || !exclusionParticipantB) {
      toast({
        title: 'Error',
        description: 'Please select both participants',
        variant: 'destructive',
      });
      return;
    }

    if (exclusionParticipantA === exclusionParticipantB) {
      toast({
        title: 'Error',
        description: 'Cannot exclude a participant from themselves',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addExclusion.mutateAsync({
        exchangeId: id,
        participantAId: exclusionParticipantA,
        participantBId: exclusionParticipantB,
        reason: exclusionReason,
      });
      toast({ title: 'Exclusion added' });
      setExclusionParticipantA('');
      setExclusionParticipantB('');
      setShowAddExclusion(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add exclusion',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveExclusion = async (exclusionId: string) => {
    try {
      await removeExclusion.mutateAsync({ exchangeId: id, exclusionId });
      toast({ title: 'Exclusion removed' });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to remove exclusion',
        variant: 'destructive',
      });
    }
  };

  const handleReveal = async () => {
    try {
      await revealAssignment.mutateAsync(id);
      setIsRevealed(true);
    } catch {
      // Still show the reveal even if marking fails
      setIsRevealed(true);
    }
  };

  const copyMagicLink = (link: string, participantName: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(participantName);
    setTimeout(() => setCopiedLink(null), 2000);
    toast({ title: 'Link copied!', description: `Invite link for ${participantName} copied to clipboard` });
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
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !exchange) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold">Exchange not found</h2>
        <p className="text-muted-foreground mt-2">
          This exchange may have been deleted or you don&apos;t have access.
        </p>
        <Link href="/exchanges">
          <Button className="mt-4">Back to Exchanges</Button>
        </Link>
      </div>
    );
  }

  const isOrganizer = true; // TODO: Check if current user is the organizer
  const canDraw = exchange.status === 'open' && (exchange.participants?.length || 0) >= 2;
  const namesDrawn = exchange.status === 'drawn' || exchange.status === 'completed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/exchanges">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{exchange.name}</h1>
              <Badge
                variant={
                  exchange.status === 'open'
                    ? 'outline'
                    : exchange.status === 'drawn'
                    ? 'default'
                    : 'secondary'
                }
              >
                {exchange.status === 'open'
                  ? 'Open'
                  : exchange.status === 'drawn'
                  ? 'Names Drawn'
                  : exchange.status}
              </Badge>
            </div>
            {exchange.description && (
              <p className="text-muted-foreground">{exchange.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOrganizer && canDraw && (
            <Button onClick={() => setShowDrawConfirm(true)} className="gap-2">
              <Shuffle className="h-4 w-4" />
              Draw Names
            </Button>
          )}
          {namesDrawn && !assignment?.hasRevealed && (
            <Button onClick={() => setShowReveal(true)} className="gap-2">
              <Eye className="h-4 w-4" />
              Reveal My Match
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Exchange
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Exchange Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exchange.dates?.exchange
                ? formatDate(exchange.dates.exchange)
                : 'Not set'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exchange.participants?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exchange.budget
                ? typeof exchange.budget === 'number'
                  ? formatCurrency(exchange.budget)
                  : exchange.budget.max
                    ? formatCurrency(exchange.budget.max, exchange.budget.currency)
                    : 'No limit'
                : 'No limit'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Assignment */}
      {namesDrawn && assignment?.receiver && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Your Secret Santa Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isRevealed || assignment?.hasRevealed ? (
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {assignment.receiver.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-2xl font-bold">{assignment.receiver.name}</p>
                  {assignment.receiver.wishlistId && (
                    <Link
                      href={`/lists/${assignment.receiver.wishlistId}`}
                      className="text-primary hover:underline text-sm"
                    >
                      View their wishlist
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowReveal(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Click to Reveal
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="participants">
        <TabsList>
          <TabsTrigger value="participants">
            <Users className="h-4 w-4 mr-2" />
            Participants ({exchange.participants?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="exclusions">
            <X className="h-4 w-4 mr-2" />
            Exclusions ({exclusions?.length || exchange.exclusionCount || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Participants</CardTitle>
                <CardDescription>
                  People participating in this gift exchange
                </CardDescription>
              </div>
              {isOrganizer && exchange.status === 'open' && (
                <Dialog open={showAddParticipant} onOpenChange={setShowAddParticipant}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add Participant
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Participant</DialogTitle>
                      <DialogDescription>
                        Add someone to this gift exchange. They&apos;ll receive a magic link to join.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="participantName">Name *</Label>
                        <Input
                          id="participantName"
                          placeholder="John Doe"
                          value={newParticipantName}
                          onChange={(e) => setNewParticipantName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="participantEmail">Email (optional)</Label>
                        <Input
                          id="participantEmail"
                          type="email"
                          placeholder="john@example.com"
                          value={newParticipantEmail}
                          onChange={(e) => setNewParticipantEmail(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Used to send invite links and notifications
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddParticipant(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddParticipant} disabled={addParticipant.isPending}>
                        {addParticipant.isPending ? 'Adding...' : 'Add Participant'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {exchange.participants && exchange.participants.length > 0 ? (
                <div className="space-y-3">
                  {exchange.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={participant.user?.avatarUrl} />
                          <AvatarFallback>
                            {participant.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{participant.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {participant.hasJoined ? (
                              <Badge variant="secondary" className="text-xs">Joined</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Invited</Badge>
                            )}
                            {participant.hasWishlist && (
                              <Badge variant="secondary" className="text-xs">Has wishlist</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {isOrganizer && exchange.status === 'open' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!participant.hasJoined && participant.magicLink && (
                              <DropdownMenuItem
                                onClick={() => copyMagicLink(participant.magicLink!, participant.name)}
                              >
                                {copiedLink === participant.name ? (
                                  <Check className="h-4 w-4 mr-2" />
                                ) : (
                                  <Copy className="h-4 w-4 mr-2" />
                                )}
                                Copy Invite Link
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleRemoveParticipant(participant.id)}
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No participants yet</p>
                  <p className="text-sm">Add participants to start your exchange</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exclusions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Exclusion Rules</CardTitle>
                <CardDescription>
                  Prevent certain people from being matched with each other
                </CardDescription>
              </div>
              {isOrganizer && exchange.status === 'open' && (
                <Dialog open={showAddExclusion} onOpenChange={setShowAddExclusion}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <X className="h-4 w-4" />
                      Add Exclusion
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Exclusion Rule</DialogTitle>
                      <DialogDescription>
                        These two people will not be matched with each other.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>First Person</Label>
                        <Select
                          value={exclusionParticipantA}
                          onValueChange={setExclusionParticipantA}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select participant" />
                          </SelectTrigger>
                          <SelectContent>
                            {exchange.participants?.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Second Person</Label>
                        <Select
                          value={exclusionParticipantB}
                          onValueChange={setExclusionParticipantB}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select participant" />
                          </SelectTrigger>
                          <SelectContent>
                            {exchange.participants
                              ?.filter((p) => p.id !== exclusionParticipantA)
                              .map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Reason (optional)</Label>
                        <Select value={exclusionReason} onValueChange={setExclusionReason}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spouse">Spouse/Partner</SelectItem>
                            <SelectItem value="same_household">Same Household</SelectItem>
                            <SelectItem value="custom">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddExclusion(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddExclusion} disabled={addExclusion.isPending}>
                        {addExclusion.isPending ? 'Adding...' : 'Add Exclusion'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {exclusions && exclusions.length > 0 ? (
                <div className="space-y-3">
                  {exclusions.map((exclusion) => (
                    <div
                      key={exclusion.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{exclusion.participantA?.name}</span>
                          <X className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{exclusion.participantB?.name}</span>
                        </div>
                        {exclusion.reason && (
                          <Badge variant="outline" className="text-xs">
                            {exclusion.reason === 'spouse'
                              ? 'Spouse'
                              : exclusion.reason === 'same_household'
                              ? 'Same Household'
                              : 'Other'}
                          </Badge>
                        )}
                      </div>
                      {isOrganizer && exchange.status === 'open' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveExclusion(exclusion.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <X className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No exclusions set</p>
                  <p className="text-sm">Add exclusions to prevent certain matches (e.g., spouses)</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Draw Names Confirmation */}
      <AlertDialog open={showDrawConfirm} onOpenChange={setShowDrawConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Draw Names?</AlertDialogTitle>
            <AlertDialogDescription>
              This will randomly assign each participant to give a gift to another participant.
              Once names are drawn, you cannot add or remove participants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDrawNames} disabled={drawNames.isPending}>
              {drawNames.isPending ? 'Drawing...' : 'Draw Names'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exchange?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this gift exchange and all participant data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reveal Animation Dialog */}
      <Dialog open={showReveal} onOpenChange={setShowReveal}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle>Your Secret Santa Match</DialogTitle>
            <DialogDescription>
              {isRevealed
                ? 'Time to start shopping!'
                : 'Ready to see who you\'re getting a gift for?'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-8">
            {!isRevealed ? (
              <Button
                size="lg"
                className="gap-2"
                onClick={handleReveal}
                disabled={revealAssignment.isPending}
              >
                <Gift className="h-5 w-5" />
                Reveal My Match
              </Button>
            ) : assignment?.receiver ? (
              <div className="space-y-4">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarFallback className="text-3xl">
                    {assignment.receiver.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-3xl font-bold">{assignment.receiver.name}</p>
                {assignment.receiver.wishlistId && (
                  <Link href={`/lists/${assignment.receiver.wishlistId}`}>
                    <Button>View Their Wishlist</Button>
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Loading...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
