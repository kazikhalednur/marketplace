import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Avatar from '@/components/ui/Avatar';
import { SelectField } from '@/components/ui/select-field';
import { useGetBidsForJobQuery, Bid, useUpdateProposalStatusMutation } from '@/features/api/jobsApi';
import * as React from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { getRelativeTime } from '@/utils/time';

interface BidsListProps {
  jobId: string;
  onBack?: () => void;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-200 text-gray-700' },
  { value: 'reviewed', label: 'Reviewed', color: 'bg-blue-100 text-blue-700' },
  { value: 'accepted', label: 'Accepted', color: 'bg-green-100 text-green-700' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-400 text-white' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
];

function getStatusStyle(status: string) {
  const found = STATUS_OPTIONS.find(opt => opt.value === status);
  return found ? found.color : 'bg-gray-200 text-gray-700';
}

function BidCard({ bid }: { bid: Bid }) {
  const [status, setStatus] = React.useState(bid.status);
  const [pendingStatus, setPendingStatus] = React.useState<string | null>(null);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [updateStatus, { isLoading }] = useUpdateProposalStatusMutation();
  const { showToast } = useToast();
  const mainSkill = bid.freelancer_profile?.projects?.[0]?.title || '';
  const bio = bid.freelancer_profile?.bio || 'No bio provided';
  const name = bio.split(' ')[0] || 'Freelancer';

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    if (newStatus === status) return;
    setPendingStatus(newStatus);
    setShowConfirm(true);
  }

  async function confirmStatusChange() {
    if (!pendingStatus) return;
    try {
      const res = await updateStatus({ proposal_id: bid.id, status: pendingStatus }).unwrap();
      if (res.success) {
        setStatus(res.data.status);
        showToast({ type: 'success', message: `Status changed to '${res.data.status}'` });
      } else {
        showToast({ type: 'error', message: res.message || 'Failed to update status' });
      }
    } catch (err: unknown) {
      let message = 'Failed to update status';
      if (
        typeof err === 'object' &&
        err !== null &&
        'data' in err &&
        typeof (err as { data?: unknown }).data === 'object' &&
        (err as { data?: { message?: unknown } }).data !== null &&
        'message' in (err as { data: { message?: unknown } }).data &&
        typeof ((err as { data: { message?: unknown } }).data.message) === 'string'
      ) {
        message = ((err as { data: { message: string } }).data.message);
      }
      showToast({ type: 'error', message });
    } finally {
      setShowConfirm(false);
      setPendingStatus(null);
    }
  }

  function cancelStatusChange() {
    setShowConfirm(false);
    setPendingStatus(null);
  }

  return (
    <>
      {/* Confirm Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-in fade-in">
            <div className="mb-4">
              <svg width="48" height="48" fill="none" viewBox="0 0 48 48" className="mx-auto mb-2">
                <circle cx="24" cy="24" r="24" fill="#fde047" /> {/* yellow-300 */}
                <path d="M24 16v10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="24" cy="32" r="1.5" fill="#fff" />
              </svg>
              <div className="text-lg font-semibold mb-1">Change Bid Status?</div>
              <div className="text-sm text-muted-foreground mb-2">Are you sure you want to change the status to <span className="font-bold text-primary">{pendingStatus}</span>?</div>
            </div>
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={confirmStatusChange}
                className="px-5 py-2 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 cursor-pointer"
                disabled={isLoading}
                autoFocus
              >
                {isLoading ? 'Updating...' : 'Confirm'}
              </button>
              <button
                onClick={cancelStatusChange}
                className="px-5 py-2 rounded-lg bg-muted text-foreground font-semibold border border-border hover:bg-muted/70 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 cursor-pointer"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Redesigned Bid Card */}
      <Card className="mb-8 p-0 overflow-hidden rounded-2xl shadow-xl border border-border/10 bg-white group transition-transform hover:shadow-2xl hover:-translate-y-1 animate-fade-in">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/20">
          {/* Left: Freelancer Info */}
          <div className="md:w-72 w-full flex flex-col items-center md:items-start gap-4 bg-gradient-to-b from-blue-50 to-white p-8">
            <Avatar name={name} size={72} className="border-2 border-primary/30 shadow-md" />
            <div className="font-bold text-lg text-primary text-center md:text-left w-full truncate">{name}</div>
            <div className="text-xs text-muted-foreground text-center md:text-left w-full truncate">{mainSkill || bio}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="text-xs px-3 py-1 bg-muted/80">{bid.freelancer_profile?.hours_per_week} hrs/week</Badge>
            </div>
          </div>
          {/* Right: Bid Content */}
          <div className="flex-1 flex flex-col gap-4 p-8">
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <span className="font-bold text-2xl text-green-700 flex items-center gap-1">
                <span className="text-lg">৳</span> {bid.bid_amount}
              </span>
              <span className={`inline-flex items-center gap-1 px-4 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(status)}`}>{status}</span>
              <span className="text-xs text-muted-foreground ml-2">Submitted: {getRelativeTime(bid.submitted_at)}</span>
              <div className="ml-auto flex items-center gap-2">
                <div className="relative group">
                  <SelectField
                    options={STATUS_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
                    value={status}
                    onChange={(val) => handleStatusChange({ target: { value: val } } as React.ChangeEvent<HTMLSelectElement>)}
                    placeholder="Change status"
                    disabled={isLoading || showConfirm}
                  />
                  {/* Remove custom chevron and tooltip, as SelectField now handles chevron and design */}
                </div>
              </div>
            </div>
            <div className="text-[15px] text-foreground whitespace-pre-line mb-2 leading-relaxed">
              {bid.cover_letter}
            </div>
            {bid.attachments && bid.attachments.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2 bg-muted/30 rounded-lg p-3 border border-border/10">
                {bid.attachments.map(att => (
                  <a
                    key={att.id}
                    href={att.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-1 rounded bg-white text-primary border border-border/20 text-xs font-semibold hover:bg-primary/10 hover:text-primary-foreground transition-colors shadow-sm"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="#e5e7eb"/><path d="M5 8.5V6a3 3 0 0 1 6 0v2.5" stroke="#6366f1" strokeWidth="1.2"/><rect x="4" y="8.5" width="8" height="3.5" rx="1.5" stroke="#6366f1" strokeWidth="1.2"/></svg>
                    {att.file.split('/').pop() || 'Attachment'}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}

function BidsListSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-0 overflow-hidden rounded-2xl shadow-lg border border-border/20 bg-white animate-pulse">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-64 w-full flex flex-col items-center md:items-start gap-3 bg-muted/40 p-6 border-b md:border-b-0 md:border-r border-border/10">
              <div className="w-14 h-14 rounded-full bg-muted animate-pulse mb-2" />
              <div className="h-4 w-24 bg-muted rounded mb-1" />
              <div className="h-3 w-32 bg-muted rounded mb-1" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
            <div className="flex-1 flex flex-col gap-3 p-6">
              <div className="h-4 w-32 bg-muted rounded mb-2" />
              <div className="h-3 w-48 bg-muted rounded mb-1" />
              <div className="h-3 w-40 bg-muted rounded mb-1" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyBidsState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <svg width="64" height="64" fill="none" viewBox="0 0 64 64" className="mb-4">
        <rect width="64" height="64" rx="16" fill="#f3f4f6" />
        <path d="M20 44V28a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v16" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 44v-4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="32" cy="32" r="4" fill="#a1a1aa" />
      </svg>
      <div className="text-xl font-semibold text-muted-foreground mb-2">No Bids Yet</div>
      <div className="text-sm text-muted-foreground">No freelancers have applied to this job yet.</div>
    </div>
  );
}

export default function BidsList({ jobId, onBack }: BidsListProps) {
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  const { data, isLoading, isError } = useGetBidsForJobQuery({ job_id: jobId, page, pageSize });

  // Remove the header definition and all references to it

  if (isLoading) return <BidsListSkeleton />;
  if (isError) return <div className="p-12 text-center text-destructive text-lg font-semibold">Failed to load bids.</div>;
  if (!data || data.results.length === 0) return <EmptyBidsState />;

  const totalPages = Math.ceil((data.count || 0) / pageSize);

  // Enhanced custom header: visually appealing with gradient, rounded corners, shadow, divider, and improved typography
  const customHeader = (
    <div className="sticky top-0 z-30 px-2 md:px-0">
      <div className="bg-gradient-to-r from-blue-50 via-white to-purple-50 rounded-2xl shadow-lg border border-border/20 flex items-center px-6 py-5 mt-2 mb-10">
      <button
        onClick={onBack || (() => window.history.back())}
          className="mr-4 p-2 rounded-full hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-150 cursor-pointer"
        aria-label="Back"
        type="button"
      >
          <svg width="24" height="24" viewBox="0 0 22 22" fill="none"><path d="M14 17l-5-5 5-5" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-xl md:text-2xl font-extrabold text-primary drop-shadow-sm tracking-tight mb-1">Bids for Job</span>
          <div className="w-16 h-1 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 rounded-full mb-1" />
          <span className="text-center text-base md:text-lg font-semibold text-secondary-foreground tracking-tight select-all bg-primary/5 px-3 py-1 rounded-lg shadow-sm border border-primary/10">{jobId}</span>
        </div>
        {/* Close icon button removed */}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto max-h-[80vh] overflow-y-auto">
      {customHeader}
      <div className="space-y-8">
        {data.results.map((bid) => (
          <BidCard key={bid.id} bid={bid} />
        ))}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-12 gap-4">
          <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1} className="rounded-full px-4">
            Previous
          </Button>
          <span className="text-base text-muted-foreground font-medium">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages} className="rounded-full px-4">
            Next
          </Button>
        </div>
      )}
    </div>
  );
}