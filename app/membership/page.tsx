'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { pb } from '@/lib/pocketbase';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Crown, Loader2, Check, ExternalLink } from 'lucide-react';

export default function MembershipPage() {
  const { user, refreshUser } = useAuth();

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMember = Boolean(user?.membership);
  const isPending = Boolean(user?.membershipPending);

  async function markPending() {
    if (!user?.id) return;
    try {
      setSubmitting(true);
      setError(null);
      await pb.collection('users').update(user.id, { membership_pending: true });
      setOpen(false);
      refreshUser();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to update membership status.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <Card className="border-zinc-800 bg-zinc-900/50 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-2xl">Membership</CardTitle>
          <CardDescription className="text-zinc-400">
            Join the UW–Madison Curling Club for weekly practices and access to tournaments.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!user ? (
            <>
              <p className="text-zinc-300">
                Please log in to view and manage your membership.
              </p>
              <Button asChild className="bg-red-600 text-white hover:bg-red-500">
                <Link href="/login">Login / Sign up</Link>
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isMember ? (
                    <>
                      <Crown className="h-5 w-5 text-red-500" />
                      <span className="font-medium">Status:</span>
                      <Badge className="bg-red-600 text-white hover:bg-red-500">Active Member</Badge>
                    </>
                  ) : isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                      <span className="font-medium">Status:</span>
                      <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">Pending Review</Badge>
                    </>
                  ) : (
                    <>
                      <span className="font-medium">Status:</span>
                      <Badge variant="secondary" className="bg-zinc-800 text-zinc-200 border-zinc-700">
                        Not a member
                      </Badge>
                    </>
                  )}
                </div>
                {isMember && (
                  <div className="text-sm text-zinc-400">
                    Thanks for supporting the club!
                  </div>
                )}
              </div>

              <Separator className="bg-zinc-800" />

              {/* Join flow */}
              {!isMember && !isPending && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 text-white hover:bg-red-500">Join for $75</Button>
                  </DialogTrigger>

                  <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
                    <DialogHeader>
                      <DialogTitle>Join the Club</DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        Season membership is <span className="font-medium text-zinc-200">$75</span>.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                      <div className="rounded-lg border border-zinc-800 p-4">
                        <p className="text-zinc-300">
                          1) Send <span className="font-medium text-white">$75</span> on Venmo to:
                        </p>
                        <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-red-600/30 bg-red-600/10 px-3 py-1.5">
                          <span className="font-mono text-red-400">@uwcurling</span>
                          <a
                            href="https://venmo.com/u/uwcurling"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-red-400 hover:text-red-300"
                          >
                            Open Venmo <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                        <p className="mt-3 text-sm text-zinc-400">
                          Add your full name and <em>“season fee”</em> in the note.
                        </p>
                      </div>

                      <div className="rounded-lg border border-zinc-800 p-4">
                        <p className="text-zinc-300">2) Click <strong>Done</strong> to mark your payment as submitted.</p>
                        <p className="mt-1 text-sm text-zinc-400">
                          We&apos;ll review and activate your membership shortly.
                        </p>
                      </div>

                      {error && (
                        <div className="rounded-md border border-red-600/30 bg-red-600/10 px-3 py-2 text-sm text-red-400">
                          {error}
                        </div>
                      )}
                    </div>

                    <DialogFooter className="gap-2">
                      <Button variant="outline" className="border-zinc-700 text-zinc-800 hover:bg-zinc-200" onClick={() => setOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={markPending}
                        disabled={submitting}
                        className="bg-red-600 text-white hover:bg-red-500"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" /> Done
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {isPending && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-300">
                  Thanks! Your payment is marked as submitted and will be reviewed soon.
                </div>
              )}
            </>
          )}
        </CardContent>

        <CardFooter className="justify-between">
          <Button asChild variant="outline" className="border-zinc-700 text-zinc-800 hover:bg-zinc-200">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild variant="ghost" className="text-zinc-300 hover:text-white">
            <Link href="/calendar">View Calendar</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
