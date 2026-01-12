'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth, SignInButton } from '@clerk/nextjs';
import { Gift, CheckCircle, XCircle, Loader2, Eye, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { api } from '@/lib/api';

interface MagicLinkData {
  type: 'exchange';
  exchange: {
    id: string;
    name: string;
    description?: string;
    status: string;
    exchangeDate?: string;
  };
  participant: {
    id: string;
    name: string;
    hasRevealed: boolean;
  };
  assignment?: {
    receiver: {
      id: string;
      name: string;
      wishlistId?: string;
      wishlistTitle?: string;
    };
  };
}

export default function MagicLinkPage() {
  const params = useParams();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const token = params.token as string;

  // The current magic link URL - used to redirect back after sign-in
  const currentUrl = typeof window !== 'undefined' ? window.location.href : `/magic/${token}`;

  const [status, setStatus] = useState<'loading' | 'success' | 'reveal' | 'error'>('loading');
  const [data, setData] = useState<MagicLinkData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [isClaimingInProgress, setIsClaimingInProgress] = useState(false);

  // Load magic link data
  useEffect(() => {
    const loadMagicLink = async () => {
      // Don't reload if we already have data
      if (data) return;

      try {
        // If user is signed in, use their auth token
        if (isSignedIn) {
          const authToken = await getToken();
          api.setToken(authToken);
        } else {
          api.setToken(null);
        }

        const response = await api.verifyMagicLink(token);
        setData(response.data);

        if (response.data.exchange.status === 'drawn' && response.data.assignment) {
          setStatus('reveal');
        } else {
          setStatus('success');
        }
      } catch (error) {
        setStatus('error');
        if (error instanceof Error) {
          if (error.message.includes('expired')) {
            setErrorMessage('This magic link has expired');
          } else if (error.message.includes('Invalid')) {
            setErrorMessage('This magic link is invalid');
          } else {
            setErrorMessage('Failed to verify magic link');
          }
        } else {
          setErrorMessage('Failed to verify magic link');
        }
      }
    };

    if (token && isLoaded) {
      loadMagicLink();
    }
  }, [token, isLoaded, isSignedIn, getToken, data]);

  // Separate effect to handle claiming - runs whenever isSignedIn becomes true
  useEffect(() => {
    const claimMagicLink = async () => {
      // Only claim if: signed in, have data, not already claimed, not currently claiming
      if (!isSignedIn || !data || isClaimed || isClaimingInProgress) {
        return;
      }

      setIsClaimingInProgress(true);

      try {
        const authToken = await getToken();
        api.setToken(authToken);
        await api.claimMagicLink(token);
        setIsClaimed(true);
        console.log('Magic link claimed successfully');
      } catch (claimError) {
        // User may already be linked - that's okay
        console.log('Claim result:', claimError);
        setIsClaimed(true); // Mark as claimed to prevent retries
      } finally {
        setIsClaimingInProgress(false);
      }
    };

    claimMagicLink();
  }, [isSignedIn, data, isClaimed, isClaimingInProgress, token, getToken]);

  const handleReveal = async () => {
    try {
      if (isSignedIn) {
        const authToken = await getToken();
        api.setToken(authToken);
      }
      await api.revealMagicLinkAssignment(token);
      setIsRevealed(true);
    } catch {
      // Show reveal anyway
      setIsRevealed(true);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Verifying your magic link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <XCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Link Invalid</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link href="/">
              <Button className="w-full">Go Home</Button>
            </Link>
            {!isSignedIn && (
              <SignInButton mode="redirect" forceRedirectUrl={currentUrl}>
                <Button variant="outline" className="w-full gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </SignInButton>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'reveal' && data?.assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Gift className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">{data.exchange.name}</CardTitle>
            <CardDescription>
              Welcome, {data.participant.name}! {isRevealed || data.participant.hasRevealed
                ? "Here's your Secret Santa match"
                : "Ready to see who you're shopping for?"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isRevealed || data.participant.hasRevealed ? (
              <div className="text-center space-y-4">
                <div className="py-6 px-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">You are buying a gift for</p>
                  <Avatar className="h-20 w-20 mx-auto mb-3">
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {data.assignment.receiver.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-2xl font-bold">{data.assignment.receiver.name}</p>
                </div>

                {data.assignment.receiver.wishlistId && (
                  <Link href={`/lists/${data.assignment.receiver.wishlistId}`}>
                    <Button className="w-full gap-2">
                      <Gift className="h-4 w-4" />
                      View Their Wishlist
                    </Button>
                  </Link>
                )}

                <div className="flex flex-col gap-2">
                  {isSignedIn ? (
                    <Link href={`/exchanges/${data.exchange.id}`}>
                      <Button variant="outline" className="w-full">
                        Go to Exchange
                      </Button>
                    </Link>
                  ) : (
                    <SignInButton mode="redirect" forceRedirectUrl={currentUrl}>
                      <Button variant="outline" className="w-full gap-2">
                        <LogIn className="h-4 w-4" />
                        Sign in to manage your wishlist
                      </Button>
                    </SignInButton>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <Button
                  size="lg"
                  className="gap-2 text-lg py-6"
                  onClick={handleReveal}
                >
                  <Eye className="h-5 w-5" />
                  Reveal My Match
                </Button>
                <p className="text-sm text-muted-foreground">
                  Click to see who you&apos;ll be getting a gift for!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success - Names not yet drawn
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Welcome to {data?.exchange.name}!</CardTitle>
          <CardDescription>
            You&apos;re confirmed as a participant, {data?.participant.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data?.exchange.description && (
            <p className="text-center text-muted-foreground">
              {data.exchange.description}
            </p>
          )}

          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            <p className="font-medium">
              {data?.exchange.status === 'open'
                ? 'Waiting for names to be drawn'
                : data?.exchange.status === 'drawn'
                ? 'Names have been drawn!'
                : data?.exchange.status}
            </p>
          </div>

          {data?.exchange.exchangeDate && (
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground mb-1">Exchange Date</p>
              <p className="font-medium">
                {new Date(data.exchange.exchangeDate).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-4">
            {isSignedIn ? (
              <Link href={`/exchanges/${data?.exchange.id}`}>
                <Button className="w-full">Go to Exchange</Button>
              </Link>
            ) : (
              <>
                <SignInButton mode="redirect" forceRedirectUrl={currentUrl}>
                  <Button className="w-full gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign in to link your wishlist
                  </Button>
                </SignInButton>
                <p className="text-xs text-center text-muted-foreground">
                  Sign in to create and share your wishlist with the group
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
