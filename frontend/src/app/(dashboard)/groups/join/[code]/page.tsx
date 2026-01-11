'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useJoinGroup } from '@/hooks/use-groups';

export default function JoinGroupPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const code = params.code as string;

  const joinGroup = useJoinGroup();
  const [status, setStatus] = useState<'idle' | 'joining' | 'success' | 'error'>('idle');
  const [groupName, setGroupName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const isJoiningRef = useRef(false);

  const handleJoin = async () => {
    // Use ref to prevent duplicate calls from React strict mode / double renders
    if (isJoiningRef.current) return;
    isJoiningRef.current = true;
    setStatus('joining');
    try {
      const result = await joinGroup.mutateAsync(code);
      setGroupName(result.groupName);
      setGroupId(result.groupId);

      if (result.alreadyMember) {
        // Already a member - redirect directly to the group
        router.push(`/groups/${result.groupId}`);
        return;
      }

      setStatus('success');
    } catch (error) {
      setStatus('error');
      isJoiningRef.current = false; // Allow retry on error
      if (error instanceof Error) {
        if (error.message.includes('Invalid')) {
          setErrorMessage('This invite link is invalid or has expired');
        } else {
          setErrorMessage('Failed to join group. Please try again.');
        }
      } else {
        setErrorMessage('Failed to join group. Please try again.');
      }
    }
  };

  useEffect(() => {
    // Auto-join when page loads, but wait for auth to be ready
    if (code && status === 'idle' && isLoaded && isSignedIn && !isJoiningRef.current) {
      handleJoin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, isLoaded, isSignedIn]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'joining' && (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-destructive" />
            )}
            {status === 'idle' && (
              <Users className="h-16 w-16 text-muted-foreground" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'joining' && 'Joining Group...'}
            {status === 'success' && 'Welcome!'}
            {status === 'error' && 'Unable to Join'}
            {status === 'idle' && 'Join Group'}
          </CardTitle>
          <CardDescription>
            {status === 'joining' && 'Please wait while we add you to the group'}
            {status === 'success' && `You've been added to "${groupName}"`}
            {status === 'error' && errorMessage}
            {status === 'idle' && 'Click below to join the group'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {status === 'success' && (
            <>
              <Button onClick={() => router.push(`/groups/${groupId}`)}>
                View Group
              </Button>
              <Link href="/groups">
                <Button variant="outline" className="w-full">
                  All Groups
                </Button>
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <Button onClick={handleJoin} disabled={joinGroup.isPending}>
                Try Again
              </Button>
              <Link href="/groups">
                <Button variant="outline" className="w-full">
                  Back to Groups
                </Button>
              </Link>
            </>
          )}
          {status === 'idle' && (
            <Button onClick={handleJoin}>
              Join Group
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
