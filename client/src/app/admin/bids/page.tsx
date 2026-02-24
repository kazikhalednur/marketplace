"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateAdminProposalMutation,
  useDeleteAdminProposalMutation,
  useGetAdminProposalByIdQuery,
  useGetAdminProposalsQuery,
  useUpdateAdminProposalMutation,
  type AdminProposal,
  type AdminProposalStatus,
  type CreateAdminProposalPayload,
} from "@/features/api/adminApi";

function calculateTotalPages(count: number, pageSize: number): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

function statusBadgeClass(s: string) {
  switch (s) {
    case "accepted":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
    case "pending":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
    case "rejected":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
    default:
      return "bg-muted text-foreground";
  }
}

export default function AdminBidsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [viewingId, setViewingId] = useState<string | null>(null);
  const [editingProposal, setEditingProposal] = useState<AdminProposal | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const emptyCreateForm: CreateAdminProposalPayload = useMemo(
    () => ({
      cover_letter: "",
      bid_amount: "",
      used_connects: 0,
      status: "pending",
      freelancer_sub_profile: 0,
      job: "",
    }),
    []
  );

  const [createForm, setCreateForm] =
    useState<CreateAdminProposalPayload>(emptyCreateForm);
  const [editForm, setEditForm] =
    useState<CreateAdminProposalPayload>(emptyCreateForm);

  const { data, isLoading, error } = useGetAdminProposalsQuery({
    page,
    page_size: pageSize,
    search: search.trim() || undefined,
    status: status || undefined,
  });

  const total = data?.count ?? 0;
  const totalPages = useMemo(
    () => calculateTotalPages(total, pageSize),
    [total, pageSize]
  );
  const bids = data?.results ?? [];
  const hasNext = !!data?.next;
  const hasPrevious = !!data?.previous;

  const { data: proposalDetail, isLoading: isLoadingDetail } =
    useGetAdminProposalByIdQuery(viewingId as string, { skip: !viewingId });

  const [createProposal, { isLoading: isCreating }] =
    useCreateAdminProposalMutation();
  const [updateProposal, { isLoading: isUpdating }] =
    useUpdateAdminProposalMutation();
  const [deleteProposal, { isLoading: isDeleting }] =
    useDeleteAdminProposalMutation();

  const openCreateDialog = () => {
    setCreateForm(emptyCreateForm);
    setIsCreateDialogOpen(true);
  };

  const openViewDialog = (id: string) => {
    setViewingId(id);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (proposal: AdminProposal) => {
    setEditingProposal(proposal);
    setEditForm({
      cover_letter: proposal.cover_letter ?? "",
      bid_amount: proposal.bid_amount ?? "",
      used_connects: proposal.used_connects ?? 0,
      status: (proposal.status ?? "pending") as AdminProposalStatus,
      freelancer_sub_profile: proposal.freelancer_sub_profile ?? 0,
      job: proposal.job ?? "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleCreate = async () => {
    try {
      await createProposal(createForm).unwrap();
      setIsCreateDialogOpen(false);
      setCreateForm(emptyCreateForm);
    } catch (err) {
      console.error("Failed to create proposal:", err);
    }
  };

  const handleUpdate = async () => {
    if (!editingProposal) return;
    try {
      await updateProposal({ id: editingProposal.id, data: editForm }).unwrap();
      setIsEditDialogOpen(false);
      setEditingProposal(null);
    } catch (err) {
      console.error("Failed to update proposal:", err);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteProposal(deletingId).unwrap();
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (err) {
      console.error("Failed to delete proposal:", err);
    }
  };

  const exportCSV = () => {
    const cols = [
      "id",
      "job",
      "bid_amount",
      "status",
      "submitted_at",
    ];
    const rows = bids.map((b) => [
      b.id,
      b.job,
      b.bid_amount,
      b.status,
      b.submitted_at,
    ]);
    const csv = [
      cols.join(","),
      ...rows.map((r) =>
        r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bids.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl font-bold mb-2">Bids</h1>
      <p className="text-muted-foreground mb-4">Review and moderate bids.</p>

      <div className="border border-border rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search by id, job, cover letter"
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
        <div />
      </div>

      <div className="flex items-center justify-between mb-2">
        <Button onClick={openCreateDialog}>Create Bid</Button>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          Export CSV
        </Button>
      </div>

      {isLoading && (
        <div className="border border-border rounded-lg p-8 text-center text-muted-foreground">
          Loading bids...
        </div>
      )}

      {error && (
        <div className="border border-border rounded-lg p-4 bg-destructive/10 text-destructive">
          Error loading bids. Please try again.
        </div>
      )}

      {!isLoading && !error && (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-3 py-2">Bid ID</th>
                <th className="text-left px-3 py-2">Job</th>
                <th className="text-left px-3 py-2">Amount</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Submitted</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bids.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-muted-foreground" colSpan={6}>
                    No bids found.
                  </td>
                </tr>
              ) : (
                bids.map((b) => (
                  <tr key={b.id} className="border-t border-border/60">
                    <td className="px-3 py-2 text-xs">{b.id}</td>
                    <td className="px-3 py-2 text-xs">{b.job}</td>
                    <td className="px-3 py-2 text-sm">{b.bid_amount}</td>
                    <td className="px-3 py-2 text-xs capitalize">
                      <div className="flex items-center gap-2">
                        <span
                          className={`${statusBadgeClass(
                            b.status
                          )} px-2 py-1 rounded-full font-medium`}
                        >
                          {b.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {new Date(b.submitted_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewDialog(b.id)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(b)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(b.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages} • {total} total
        </div>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-2 py-1 border border-border rounded-md bg-background text-foreground text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!hasPrevious || page <= 1}
            variant="outline"
            size="sm"
          >Prev</Button>
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 7) pageNum = i + 1;
            else if (page <= 4) pageNum = i + 1;
            else if (page >= totalPages - 3) pageNum = totalPages - 6 + i;
            else pageNum = page - 3 + i;
            const isActive = pageNum === page;
            return (
              <Button
                key={`pg_bids_${pageNum}`}
                onClick={() => setPage(pageNum)}
                variant={isActive ? undefined : "outline"}
                size="sm"
              >
                {pageNum}
              </Button>
            );
          })}
          {totalPages > 7 && (
            <span className="px-1 text-muted-foreground">…</span>
          )}
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={!hasNext || page >= totalPages}
            variant="outline"
            size="sm"
          >Next</Button>
        </div>
      </div>

      {/* Create Proposal Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Bid</DialogTitle>
            <DialogDescription>
              Create a new bid/proposal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium">Cover Letter</label>
              <textarea
                value={createForm.cover_letter}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, cover_letter: e.target.value }))
                }
                className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground min-h-[120px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Bid Amount</label>
                <input
                  value={createForm.bid_amount}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, bid_amount: e.target.value }))
                  }
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="5000.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={createForm.status}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      status: e.target.value,
                    }))
                  }
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="pending">pending</option>
                  <option value="accepted">accepted</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Job ID</label>
              <input
                value={createForm.job}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, job: e.target.value }))
                }
                className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                placeholder="UUID"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Proposal Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bid Details</DialogTitle>
            <DialogDescription>Details from the API.</DialogDescription>
          </DialogHeader>
          {isLoadingDetail && (
            <div className="py-6 text-muted-foreground">Loading...</div>
          )}
          {!isLoadingDetail && proposalDetail && (
            <div className="grid gap-3 py-2 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-muted-foreground">ID</div>
                <div className="col-span-2 break-all">{proposalDetail.id}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-muted-foreground">Job</div>
                <div className="col-span-2 break-all">{proposalDetail.job}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-muted-foreground">Bid Amount</div>
                <div className="col-span-2">{proposalDetail.bid_amount}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-muted-foreground">Status</div>
                <div className="col-span-2">
                  <span
                    className={`${statusBadgeClass(
                      proposalDetail.status
                    )} px-2 py-1 rounded-full font-medium text-xs`}
                  >
                    {proposalDetail.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-muted-foreground">Submitted</div>
                <div className="col-span-2">
                  {new Date(proposalDetail.submitted_at).toLocaleString()}
                </div>
              </div>
              <div className="pt-2">
                <div className="text-muted-foreground mb-1">Cover Letter</div>
                <div className="whitespace-pre-wrap border border-border rounded-md p-3 bg-muted/20">
                  {proposalDetail.cover_letter || "(empty)"}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsViewDialogOpen(false);
                setViewingId(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Proposal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Bid</DialogTitle>
            <DialogDescription>Full update (PUT).</DialogDescription>
          </DialogHeader>
          {editingProposal && (
            <div className="grid gap-4 py-4">
              <div>
                <label className="text-sm font-medium">Cover Letter</label>
                <textarea
                  value={editForm.cover_letter}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, cover_letter: e.target.value }))
                  }
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground min-h-[120px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Bid Amount</label>
                  <input
                    value={editForm.bid_amount}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, bid_amount: e.target.value }))
                    }
                    className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, status: e.target.value }))
                    }
                    className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="pending">pending</option>
                    <option value="accepted">accepted</option>
                    <option value="rejected">rejected</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Job ID</label>
                <input
                  value={editForm.job}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, job: e.target.value }))
                  }
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingProposal(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Proposal Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bid</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this bid? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


