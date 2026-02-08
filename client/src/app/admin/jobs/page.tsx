"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useGetAdminJobsQuery,
  usePatchAdminJobMutation,
  useDeleteAdminJobMutation,
  type AdminJob,
  type AdminJobPatchPayload,
} from "@/features/api/adminApi";
import { useGetDropdownsQuery } from "@/features/api/jobsApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function calculateTotalPages(count: number, pageSize: number): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

export default function AdminJobsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [skill, setSkill] = useState<string>("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<AdminJob | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AdminJobPatchPayload>({});

  const { data: dropdowns } = useGetDropdownsQuery();
  const { data, isLoading, error } = useGetAdminJobsQuery({
    page,
    page_size: pageSize,
    search: search.trim() || undefined,
    status: status || undefined,
    category: category ? parseInt(category, 10) : undefined,
    skills: skill ? [parseInt(skill, 10)] : undefined,
  });

  const [patchJob, { isLoading: isPatching }] = usePatchAdminJobMutation();
  const [deleteJob, { isLoading: isDeleting }] = useDeleteAdminJobMutation();

  const total = data?.count ?? 0;
  const totalPages = useMemo(
    () => calculateTotalPages(total, pageSize),
    [total, pageSize]
  );
  const jobs = data?.results ?? [];
  const hasNext = !!data?.next;
  const hasPrevious = !!data?.previous;

  const statusOptions = dropdowns?.status ?? [];
  const categoryOptions = dropdowns?.categories ?? [];
  const skillOptions = dropdowns?.skills ?? [];

  const allSelectedOnPage = useMemo(
    () => jobs.length > 0 && jobs.every((j) => selected[j.id]),
    [jobs, selected]
  );
  const toggleSelectAll = (checked: boolean) => {
    const next = { ...selected };
    jobs.forEach((j) => {
      next[j.id] = checked;
    });
    setSelected(next);
  };
  const selectedIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected]
  );

  const getCategoryName = (categoryId: number) => {
    const c = categoryOptions.find((x) => x.id === categoryId);
    return c ? c.name : String(categoryId);
  };

  const getSkillNames = (skillIds: number[]) => {
    return skillIds
      .map((id) => skillOptions.find((s) => s.id === id)?.name ?? String(id))
      .join(", ");
  };

  const openEditDialog = (job: AdminJob) => {
    setEditingJob(job);
    setEditForm({
      title: job.title,
      description: job.description,
      tags: job.tags,
      min_budget: job.min_budget,
      max_budget: job.max_budget,
      is_fixed: job.is_fixed,
      min_hourly_rate: job.min_hourly_rate,
      max_hourly_rate: job.max_hourly_rate,
      duration: job.duration,
      experience_level: job.experience_level,
      min_proposal_count: job.min_proposal_count,
      max_proposal_count: job.max_proposal_count,
      status: job.status,
      connect: job.connect,
      privacy: job.privacy,
      is_payment_verified: job.is_payment_verified,
      category: job.category,
      skills: job.skills,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (jobId: string) => {
    setDeletingJobId(jobId);
    setIsDeleteDialogOpen(true);
  };

  const handlePatchJob = async () => {
    if (!editingJob) return;
    try {
      await patchJob({ id: editingJob.id, data: editForm }).unwrap();
      setIsEditDialogOpen(false);
      setEditingJob(null);
    } catch (err) {
      console.error("Failed to update job:", err);
    }
  };

  const handleDeleteJob = async () => {
    if (!deletingJobId) return;
    try {
      await deleteJob(deletingJobId).unwrap();
      setIsDeleteDialogOpen(false);
      setDeletingJobId(null);
    } catch (err) {
      console.error("Failed to delete job:", err);
    }
  };

  const exportCSV = () => {
    const cols = [
      "id",
      "title",
      "category",
      "skills",
      "min_budget",
      "max_budget",
      "status",
      "created_at",
    ];
    const rows = (
      selectedIds.length ? jobs.filter((j) => selected[j.id]) : jobs
    ).map((j) => [
      j.id,
      j.title,
      getCategoryName(j.category),
      getSkillNames(j.skills),
      j.min_budget,
      j.max_budget,
      j.status,
      j.created_at,
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
    a.download = "jobs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusBadgeClass = (s: string) => {
    switch (s) {
      case "open":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
      case "in_progress":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20";
      case "completed":
        return "bg-muted text-foreground";
      case "draft":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
      default:
        return "bg-muted text-foreground";
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl font-bold mb-2">Jobs</h1>
      <p className="text-muted-foreground mb-4">
        Search, filter, and review job listings.
      </p>

      <div className="border border-border rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search title, description, tags"
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
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => {
              setPage(1);
              setCategory(e.target.value);
            }}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="">All Categories</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={skill}
            onChange={(e) => {
              setPage(1);
              setSkill(e.target.value);
            }}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="">All Skills</option>
            {skillOptions.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-muted-foreground">
          Selected: {selectedIds.length}
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          Export CSV
        </Button>
      </div>

      {isLoading && (
        <div className="border border-border rounded-lg p-8 text-center text-muted-foreground">
          Loading jobs...
        </div>
      )}

      {error && (
        <div className="border border-border rounded-lg p-4 bg-destructive/10 text-destructive">
          Error loading jobs. Please try again.
        </div>
      )}

      {!isLoading && !error && (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-3 py-2">
                  <input
                    type="checkbox"
                    checked={allSelectedOnPage}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="text-left px-3 py-2">Title</th>
                <th className="text-left px-3 py-2">Category</th>
                <th className="text-left px-3 py-2">Skills</th>
                <th className="text-left px-3 py-2">Budget</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Created</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td
                    className="px-3 py-6 text-muted-foreground text-center"
                    colSpan={8}
                  >
                    No jobs found.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="border-t border-border/60">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={!!selected[job.id]}
                        onChange={(e) =>
                          setSelected((prev) => ({
                            ...prev,
                            [job.id]: e.target.checked,
                          }))
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{job.title}</div>
                      <div className="text-muted-foreground text-xs line-clamp-1">
                        {job.description}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {getCategoryName(job.category)}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {getSkillNames(job.skills)}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {job.is_fixed
                        ? job.min_budget
                        : `${job.min_hourly_rate ?? job.min_budget} - ${
                            job.max_hourly_rate ?? job.max_budget
                          }`}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <span
                        className={`${statusBadgeClass(
                          job.status
                        )} px-2 py-1 rounded-full font-medium text-xs`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {new Date(job.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(job)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(job.id)}
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

      {!isLoading && !error && (
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
            >
              Prev
            </Button>
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) pageNum = i + 1;
              else if (page <= 4) pageNum = i + 1;
              else if (page >= totalPages - 3) pageNum = totalPages - 6 + i;
              else pageNum = page - 3 + i;
              const isActive = pageNum === page;
              return (
                <Button
                  key={`pg_jobs_${pageNum}`}
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
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Job Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>Update job details.</DialogDescription>
          </DialogHeader>
          {editingJob && (
            <div className="grid gap-4 py-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  value={editForm.title ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={editForm.description ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Min Budget</label>
                  <input
                    value={editForm.min_budget ?? ""}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, min_budget: e.target.value }))
                    }
                    className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Budget</label>
                  <input
                    value={editForm.max_budget ?? ""}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, max_budget: e.target.value }))
                    }
                    className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={editForm.status ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, status: e.target.value }))
                  }
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="draft">Draft</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePatchJob} disabled={isPatching}>
              {isPatching ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Job Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job? This action cannot be
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
              onClick={handleDeleteJob}
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
