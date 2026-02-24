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
  useCreateAdminContractMutation,
  useDeleteAdminContractMutation,
  useGetAdminContractByIdQuery,
  useGetAdminContractsQuery,
  useUpdateAdminContractMutation,
  type AdminContract,
  type AdminContractStatus,
  type CreateAdminContractPayload,
} from "@/features/api/adminApi";

function calculateTotalPages(count: number, pageSize: number): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

function statusBadgeClass(s: string) {
  switch (s) {
    case "active":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
    case "completed":
      return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20";
    case "pending":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
    case "cancelled":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
    default:
      return "bg-muted text-foreground";
  }
}

export default function AdminContractsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [viewingId, setViewingId] = useState<string | null>(null);
  const [editingContract, setEditingContract] = useState<AdminContract | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const emptyForm: CreateAdminContractPayload = useMemo(
    () => ({
      budget: "",
      end_date: new Date().toISOString(),
      status: "active",
      freelancer_profile: 0,
      freelancer_sub_profile: 0,
      client_profile: 0,
      proposal: "",
      job: "",
    }),
    []
  );

  const [createForm, setCreateForm] =
    useState<CreateAdminContractPayload>(emptyForm);
  const [editForm, setEditForm] = useState<CreateAdminContractPayload>(emptyForm);

  const { data, isLoading, error } = useGetAdminContractsQuery({
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
  const contracts = data?.results ?? [];
  const hasNext = !!data?.next;
  const hasPrevious = !!data?.previous;

  const { data: contractDetail, isLoading: isLoadingDetail } =
    useGetAdminContractByIdQuery(viewingId as string, { skip: !viewingId });

  const [createContract, { isLoading: isCreating }] =
    useCreateAdminContractMutation();
  const [updateContract, { isLoading: isUpdating }] =
    useUpdateAdminContractMutation();
  const [deleteContract, { isLoading: isDeleting }] =
    useDeleteAdminContractMutation();

  const openCreateDialog = () => {
    setCreateForm(emptyForm);
    setIsCreateDialogOpen(true);
  };

  const openViewDialog = (id: string) => {
    setViewingId(id);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (c: AdminContract) => {
    setEditingContract(c);
    setEditForm({
      budget: c.budget ?? "",
      end_date: c.end_date ?? new Date().toISOString(),
      status: (c.status ?? "active") as AdminContractStatus,
      freelancer_profile: c.freelancer_profile ?? 0,
      freelancer_sub_profile: c.freelancer_sub_profile ?? 0,
      client_profile: c.client_profile ?? 0,
      proposal: c.proposal ?? "",
      job: c.job ?? "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleCreate = async () => {
    try {
      await createContract(createForm).unwrap();
      setIsCreateDialogOpen(false);
      setCreateForm(emptyForm);
    } catch (err) {
      console.error("Failed to create contract:", err);
    }
  };

  const handleUpdate = async () => {
    if (!editingContract) return;
    try {
      await updateContract({ id: editingContract.id, data: editForm }).unwrap();
      setIsEditDialogOpen(false);
      setEditingContract(null);
    } catch (err) {
      console.error("Failed to update contract:", err);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteContract(deletingId).unwrap();
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (err) {
      console.error("Failed to delete contract:", err);
    }
  };

  const exportCSV = () => {
    const cols = ["id", "job", "proposal", "budget", "status", "start_date", "end_date"];
    const rows = contracts.map((c) => [
      c.id,
      c.job,
      c.proposal,
      c.budget,
      c.status,
      c.start_date,
      c.end_date,
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
    a.download = "contracts.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl font-bold mb-2">Contracts</h1>
      <p className="text-muted-foreground mb-4">Monitor and manage contracts.</p>

      <div className="border border-border rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search contracts"
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
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div />
      </div>

      <div className="flex items-center justify-between mb-2">
        <Button onClick={openCreateDialog}>Create Contract</Button>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          Export CSV
        </Button>
      </div>

      {isLoading && (
        <div className="border border-border rounded-lg p-8 text-center text-muted-foreground">
          Loading contracts...
        </div>
      )}

      {error && (
        <div className="border border-border rounded-lg p-4 bg-destructive/10 text-destructive">
          Error loading contracts. Please try again.
        </div>
      )}

      {!isLoading && !error && (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-3 py-2">ID</th>
                <th className="text-left px-3 py-2">Job</th>
                <th className="text-left px-3 py-2">Proposal</th>
                <th className="text-left px-3 py-2">Budget</th>
                <th className="text-left px-3 py-2">Start</th>
                <th className="text-left px-3 py-2">End</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-muted-foreground" colSpan={8}>
                    No contracts found.
                  </td>
                </tr>
              ) : (
                contracts.map((c) => (
                  <tr key={c.id} className="border-t border-border/60">
                    <td className="px-3 py-2 text-xs">{c.id}</td>
                    <td className="px-3 py-2 text-xs">{c.job}</td>
                    <td className="px-3 py-2 text-xs">{c.proposal}</td>
                    <td className="px-3 py-2 text-sm">{c.budget}</td>
                    <td className="px-3 py-2 text-sm">
                      {c.start_date ? new Date(c.start_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {c.end_date ? new Date(c.end_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs capitalize">
                      <span
                        className={`${statusBadgeClass(
                          c.status
                        )} px-2 py-1 rounded-full font-medium`}
                      >
                        {c.status || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openViewDialog(c.id)}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(c)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(c.id)}>
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
      <div className="text-sm text-muted-foreground">Page {page} of {totalPages} • {total} total</div>
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
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
        {Array.from({ length: totalPages }).slice(0, 7).map((_, idx) => {
          const p = idx + 1;
          const isActive = p === page;
          return (
            <Button key={`pg_contracts_${p}`} onClick={() => setPage(p)} variant={isActive ? undefined : "outline"} size="sm">{p}</Button>
          );
        })}
        {totalPages > 7 && <span className="px-1 text-muted-foreground">…</span>}
        <Button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={!hasNext || page >= totalPages}
          variant="outline"
          size="sm"
        >Next</Button>
      </div>
    </div>

      {/* Create Contract Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Contract</DialogTitle>
            <DialogDescription>Create a new contract.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Budget</label>
                <input
                  value={createForm.budget}
                  onChange={(e) => setCreateForm((f) => ({ ...f, budget: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm((f) => ({ ...f, status: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="active">active</option>
                  <option value="completed">completed</option>
                  <option value="pending">pending</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">End Date (ISO)</label>
              <input
                value={createForm.end_date}
                onChange={(e) => setCreateForm((f) => ({ ...f, end_date: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                placeholder="2026-02-24T06:54:25.941Z"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Proposal ID</label>
                <input
                  value={createForm.proposal}
                  onChange={(e) => setCreateForm((f) => ({ ...f, proposal: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Job ID</label>
                <input
                  value={createForm.job}
                  onChange={(e) => setCreateForm((f) => ({ ...f, job: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Contract Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contract Details</DialogTitle>
            <DialogDescription>Details from the API.</DialogDescription>
          </DialogHeader>
          {isLoadingDetail && (
            <div className="py-6 text-muted-foreground">Loading...</div>
          )}
          {!isLoadingDetail && contractDetail && (
            <div className="grid gap-3 py-2 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-muted-foreground">ID</div>
                <div className="col-span-2 break-all">{contractDetail.id}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-muted-foreground">Job</div>
                <div className="col-span-2 break-all">{contractDetail.job}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-muted-foreground">Proposal</div>
                <div className="col-span-2 break-all">{contractDetail.proposal}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-muted-foreground">Budget</div>
                <div className="col-span-2">{contractDetail.budget}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-muted-foreground">Start Date</div>
                <div className="col-span-2">{new Date(contractDetail.start_date).toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-muted-foreground">End Date</div>
                <div className="col-span-2">{new Date(contractDetail.end_date).toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-muted-foreground">Status</div>
                <div className="col-span-2">
                  <span className={`${statusBadgeClass(contractDetail.status)} px-2 py-1 rounded-full font-medium text-xs`}>
                    {contractDetail.status}
                  </span>
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

      {/* Edit Contract Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contract</DialogTitle>
            <DialogDescription>Full update (PUT).</DialogDescription>
          </DialogHeader>
          {editingContract && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Budget</label>
                  <input
                    value={editForm.budget}
                    onChange={(e) => setEditForm((f) => ({ ...f, budget: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="active">active</option>
                    <option value="completed">completed</option>
                    <option value="pending">pending</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">End Date (ISO)</label>
                <input
                  value={editForm.end_date}
                  onChange={(e) => setEditForm((f) => ({ ...f, end_date: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Proposal ID</label>
                  <input
                    value={editForm.proposal}
                    onChange={(e) => setEditForm((f) => ({ ...f, proposal: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Job ID</label>
                  <input
                    value={editForm.job}
                    onChange={(e) => setEditForm((f) => ({ ...f, job: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingContract(null);
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

      {/* Delete Contract Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contract</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contract? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


