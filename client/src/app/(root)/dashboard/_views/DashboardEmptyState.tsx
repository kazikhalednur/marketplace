export default function DashboardEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <svg width="64" height="64" fill="none" viewBox="0 0 64 64" className="mb-4">
        <rect width="64" height="64" rx="16" fill="#f3f4f6" />
        <path d="M20 44V28a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v16" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 44v-4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="32" cy="32" r="4" fill="#a1a1aa" />
      </svg>
      <div className="text-xl font-semibold text-muted-foreground mb-2">No Jobs Found</div>
      <div className="text-sm text-muted-foreground">Try adjusting your filters or check back later for new opportunities.</div>
    </div>
  );
} 