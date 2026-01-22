import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

export default function JobListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card
          key={i}
          className="p-0 overflow-hidden group border border-border/70 bg-gradient-to-br from-muted/60 to-background"
        >
          <div className="flex flex-col md:flex-row">
            {/* Left: Main Info */}
            <div className="flex-1 p-6 flex flex-col gap-2">
              {/* Title Row */}
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="h-6 w-40 rounded" />
                <Skeleton className="h-5 w-16 rounded ml-2" />
              </div>
              {/* Meta Row */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              {/* Description */}
              <Skeleton className="h-4 w-full max-w-xs rounded mb-1" />
              {/* Badges Row */}
              <div className="flex flex-wrap gap-2 mb-1">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            </div>
            {/* Right: Meta Info */}
            <div className="md:w-64 w-full md:border-l border-border/40 bg-muted/40 flex flex-col justify-between p-6 gap-3 items-start text-left">
              {/* Budget Row */}
              <div className="flex items-center gap-2 text-green-700 font-semb-1">
                <Skeleton className="h-6 w-8 rounded" />
                <Skeleton className="h-6 w-10 rounded" />
                <Skeleton className="h-6 w-10 rounded" />
              </div>
              {/* Fixed/Flexible and Duration Row */}
              <div className="flex items-center gap-3 mb-1">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              {/* Payment Verified */}
              <Skeleton className="h-6 w-32 rounded-full mb-1" />
              {/* Experience/Proposals */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 