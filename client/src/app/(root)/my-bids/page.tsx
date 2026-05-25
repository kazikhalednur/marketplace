"use client";

import UnauthorizedPage from "@/app/unauthorized/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast-provider";
import {
  FreelancerBid,
  useDeleteMyBidMutation,
  useGetMyBidsQuery,
} from "@/features/api/jobsApi";
import { useAuth } from "@/hooks/useAuth";
import { getRelativeTime } from "@/utils/time";
import { ExternalLink, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { getJobDashboardPath } from "@/lib/appUrl";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;
const FETCH_SIZE = 100;

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "closed", label: "Closed" },
] as const;

function getStatusStyle(status: string) {
  const statusColors: Record<string, string> = {
    pending: "bg-gray-200 text-gray-700",
    reviewed: "bg-blue-100 text-blue-700",
    accepted: "bg-green-100 text-green-700",
    closed: "bg-gray-400 text-white",
    rejected: "bg-red-100 text-red-700",
  };
  return statusColors[status.toLowerCase()] ?? "bg-gray-200 text-gray-700";
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function getJobHref(bid: FreelancerBid) {
  return getJobDashboardPath(bid.job);
}

function getAttachmentLabel(fileUrl: string) {
  try {
    const pathname = new URL(fileUrl).pathname;
    const name = pathname.split("/").pop();
    return name && name.length > 0 ? decodeURIComponent(name) : "Attachment";
  } catch {
    return "Attachment";
  }
}

function PageLoader() {
  return (
    <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground mt-4">Loading...</p>
      </div>
    </main>
  );
}

function BidCard({
  bid,
  onSelect,
}: {
  bid: FreelancerBid;
  onSelect: (bid: FreelancerBid) => void;
}) {
  return (
    <Card
      className="p-6 rounded-xl shadow-sm border border-border/20 transition hover:shadow-md cursor-pointer"
      onClick={() => onSelect(bid)}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <Link
            href={getJobHref(bid)}
            scroll={false}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-lg font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          >
            View job posting
            <ExternalLink className="h-4 w-4 shrink-0 opacity-70" />
          </Link>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {bid.cover_letter}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Submitted {getRelativeTime(bid.submitted_at)}
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
          <span className="text-xl font-bold text-green-700">৳ {bid.bid_amount}</span>
          <Badge className={getStatusStyle(bid.status)}>{formatStatus(bid.status)}</Badge>
          {(bid.uploaded_attachments?.length ?? 0) > 0 && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {bid.uploaded_attachments!.length} attachment
              {bid.uploaded_attachments!.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

function BidDetailDialog({
  bid,
  open,
  onOpenChange,
  onDelete,
  isDeleting,
}: {
  bid: FreelancerBid | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (bid: FreelancerBid) => void;
  isDeleting: boolean;
}) {
  if (!bid) return null;

  const canDelete = bid.status.toLowerCase() === "pending";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bid details</DialogTitle>
          <DialogDescription>
            Submitted {getRelativeTime(bid.submitted_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Job</p>
            <Link
              href={getJobHref(bid)}
              scroll={false}
              className="inline-flex items-center gap-1.5 text-accent font-medium hover:underline"
            >
              View job posting
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Bid amount</p>
              <p className="text-xl font-bold text-green-700">৳ {bid.bid_amount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
              <Badge className={getStatusStyle(bid.status)}>{formatStatus(bid.status)}</Badge>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Cover letter</p>
            <div className="bg-muted/40 rounded-lg p-3 border border-border/10 text-sm whitespace-pre-line">
              {bid.cover_letter}
            </div>
          </div>

          {(bid.uploaded_attachments?.length ?? 0) > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Attachments</p>
              <ul className="flex flex-col gap-2">
                {bid.uploaded_attachments!.map((att) => (
                  <li key={att.id}>
                    <a
                      href={att.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border/20 text-sm font-medium text-accent hover:bg-accent/10 transition-colors"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      {getAttachmentLabel(att.file)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {canDelete && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={() => onDelete(bid)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Withdrawing..." : "Withdraw bid"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function MyBidsPage() {
  const { user, isAuthenticated, showLoader } = useAuth();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedBid, setSelectedBid] = useState<FreelancerBid | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [bidToDelete, setBidToDelete] = useState<FreelancerBid | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const { data, isLoading, isError, isFetching } = useGetMyBidsQuery({
    page: 1,
    pageSize: FETCH_SIZE,
  });
  const [deleteBid, { isLoading: isDeleting }] = useDeleteMyBidMutation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const allBids = data?.results ?? [];

  const filteredBids = useMemo(() => {
    if (activeTab === "all") return allBids;
    return allBids.filter(
      (bid) => bid.status.toLowerCase() === activeTab.toLowerCase()
    );
  }, [allBids, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredBids.length / PAGE_SIZE));
  const paginatedBids = filteredBids.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const getTabCount = (tab: string) => {
    if (tab === "all") return allBids.length;
    return allBids.filter((b) => b.status.toLowerCase() === tab).length;
  };

  const handleSelectBid = (bid: FreelancerBid) => {
    setSelectedBid(bid);
    setDetailOpen(true);
  };

  const handleRequestDelete = (bid: FreelancerBid) => {
    setBidToDelete(bid);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bidToDelete) return;
    try {
      await deleteBid(bidToDelete.id).unwrap();
      showToast({ type: "success", message: "Bid withdrawn successfully." });
      setConfirmDeleteOpen(false);
      setDetailOpen(false);
      setBidToDelete(null);
      setSelectedBid(null);
    } catch {
      showToast({ type: "error", message: "Failed to withdraw bid. Only pending bids can be withdrawn." });
    }
  };

  if (!mounted || showLoader) {
    return <PageLoader />;
  }

  if (!isAuthenticated || user?.role !== "freelancer") {
    return <UnauthorizedPage />;
  }

  return (
    <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Bids</h1>
          <p className="text-muted-foreground mt-1">
            Track proposals you have submitted and their status.
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                {tab.label}
                <span className="ml-1.5 text-muted-foreground">({getTabCount(tab.value)})</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading || isFetching ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground mt-4">Loading bids...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-destructive font-medium">
            Failed to load bids. Please try again later.
          </div>
        ) : filteredBids.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground rounded-xl border border-dashed border-border/40">
            {activeTab === "all"
              ? "You have not placed any bids yet."
              : `No ${activeTab} bids found.`}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedBids.map((bid) => (
                <BidCard key={bid.id} bid={bid} onSelect={handleSelectBid} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-10 gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="rounded-full px-4"
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground font-medium">
                  Page {page} of {totalPages} ({paginatedBids.length} of {filteredBids.length})
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="rounded-full px-4"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        <BidDetailDialog
          bid={selectedBid}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onDelete={handleRequestDelete}
          isDeleting={isDeleting}
        />

        <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Withdraw bid?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. You can only withdraw bids that are still pending.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? "Withdrawing..." : "Withdraw"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
