import React from 'react';

export default function DashboardFiltersSkeleton() {
  return (
    <div className="w-full">
      {/* Search Bar Skeleton */}
      <div className="relative mb-4">
        <div className="h-10 w-full rounded-lg border bg-neutral-200 animate-pulse pl-12" />
        <span className="absolute left-4 top-1/2 -translate-y-1/2">
          <div className="w-5 h-5 rounded-full bg-neutral-300 animate-pulse" />
        </span>
      </div>
      {/* Tags Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 rounded-full border bg-neutral-200 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
} 