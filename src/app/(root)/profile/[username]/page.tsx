"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import ProfileOwnerView from '@/components/profile/ProfileOwnerView';
import ProfilePublicView from '@/components/profile/ProfilePublicView';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user, loading, error, isOwnProfile } = useProfile(username);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-lg">Loading profile...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Profile Not Found</h1>
            <p className="text-muted-foreground mb-4">
              {error || `User &quot;${username}&quot; not found`}
            </p>
            <p className="text-sm text-muted-foreground">
              The profile you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-muted/60 to-background/80 pb-20">
      <div className="absolute inset-0 pointer-events-none select-none opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      <div className="max-w-4xl mx-auto px-4 pt-12">
        {isOwnProfile ? (
          <ProfileOwnerView user={user} />
        ) : (
          <ProfilePublicView user={user} />
        )}
      </div>
    </main>
  );
} 