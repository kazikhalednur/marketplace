"use client";
import { useGetMyBidsQuery } from '@/features/api/jobsApi';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getRelativeTime } from '@/utils/time';
import { useRouter } from 'next/navigation';
import type { Bid as ApiBid } from '@/features/api/jobsApi';
import Link from 'next/link';

// Define Bid type for this page (extends API Bid type)
type MyBid = ApiBid & {
  job?: string;
  job_link?: string;
  uploaded_attachments?: { id: string; file: string }[];
};

export default function MyBidsPage() {
  const { user, isAuthenticated, showLoader } = useAuth();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data, isLoading, isError } = useGetMyBidsQuery({ page, pageSize });
  const [selectedBid, setSelectedBid] = useState<MyBid | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  if (showLoader) return <div className="p-12 text-center">Loading...</div>;
  if (!isAuthenticated || user?.role !== 'freelancer') {
    router.replace('/unauthorized');
    return null;
  }

  const totalPages = data ? Math.ceil((data.count || 0) / pageSize) : 1;
  // Defensive: ensure job/job_link fields exist for each bid
  const bids: MyBid[] = ((data?.results as unknown as MyBid[]) || []).map(bid => ({
    ...bid,
    job: bid.job ?? '',
    job_link: bid.job_link ?? '',
    uploaded_attachments: bid.uploaded_attachments ?? [],
  }));

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-foreground mb-8">My Bids</h1>
      {isLoading ? (
        <div className="p-12 text-center">Loading...</div>
      ) : isError ? (
        <div className="p-12 text-center text-destructive">Failed to load bids.</div>
      ) : bids.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">You have not placed any bids yet.</div>
      ) : (
        <div className="space-y-6">
          {bids.map((bid: MyBid) => (
            <Card
              key={bid.id}
              className="p-6 rounded-xl shadow cursor-pointer hover:shadow-lg border border-border/20 transition"
              onClick={() => { setSelectedBid(bid); setModalOpen(true); }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                <div className="flex-1">
                  <div className="font-bold text-lg text-accent mb-1">
                    <Link
                      href={`/dashboard?jobId=${bid.job}`}
                      className="hover:underline focus:underline outline-none focus-visible:ring-2 focus-visible:ring-accent rounded transition-colors text-accent"
                      scroll={false}
                    >
                      {bid.job_link || bid.job}
                    </Link>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">{bid.cover_letter.slice(0, 80)}{bid.cover_letter.length > 80 ? '...' : ''}</div>
                  <div className="text-xs text-muted-foreground">Submitted: {getRelativeTime(bid.submitted_at)}</div>
                </div>
                <div className="flex flex-col items-end gap-2 min-w-[120px]">
                  <span className="text-xl font-bold text-green-700">৳ {bid.bid_amount}</span>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold border bg-accent/10 text-accent border-accent/20">{bid.status}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-10 gap-4">
          <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1} className="rounded-full px-4">Previous</Button>
          <span className="text-base text-muted-foreground font-medium">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages} className="rounded-full px-4">Next</Button>
        </div>
      )}
      {/* Modal for bid details (to be implemented) */}
      {modalOpen && selectedBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="relative w-full max-w-lg rounded-2xl shadow-2xl border border-border/30 bg-background animate-in fade-in zoom-in-95 focus:outline-none">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-border/20">
              <h2 className="text-xl font-bold text-black">Bid Details</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-full hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer" aria-label="Close">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M6 6l10 10M6 16L16 6" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            {/* Content */}
            <div className="px-6 py-6 space-y-4 text-left">
              <div>
                <div className="font-semibold text-sm text-muted-foreground mb-1">Job</div>
                <Link href={`/dashboard?jobId=${selectedBid.job}`} className="text-base font-semibold text-accent hover:underline focus:underline outline-none focus-visible:ring-2 focus-visible:ring-accent rounded transition-colors" scroll={false}>{selectedBid.job_link || selectedBid.job}</Link>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                <div className="flex-1">
                  <div className="font-semibold text-sm text-muted-foreground mb-1">Cover Letter</div>
                  <div className="bg-muted/40 rounded-lg p-3 border border-border/10 text-sm whitespace-pre-line">{selectedBid.cover_letter}</div>
                </div>
                <div className="flex flex-col items-end gap-2 min-w-[120px]">
                  <div>
                    <span className="font-semibold text-sm text-muted-foreground">Bid Amount</span>
                    <span className="block text-xl font-bold text-green-700">৳ {selectedBid.bid_amount}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-muted-foreground">Status</span>
                    <span className="inline-block ml-2 px-3 py-1 rounded-full text-xs font-semibold border bg-accent/10 text-accent border-accent/20">{selectedBid.status}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Submitted: {getRelativeTime(selectedBid.submitted_at)}</div>
                </div>
              </div>
              {selectedBid.uploaded_attachments && selectedBid.uploaded_attachments.length > 0 && (
                <div>
                  <div className="font-semibold text-sm text-muted-foreground mb-1">Attachments</div>
                  <ul className="flex flex-wrap gap-2">
                    {selectedBid.uploaded_attachments.map((att) => (
                      <li key={att.id}>
                        <a href={att.file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white text-accent border border-border/20 text-xs font-semibold hover:bg-accent/10 hover:text-accent-foreground transition-colors shadow-sm">
                          Attachment
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 