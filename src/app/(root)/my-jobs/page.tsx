"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-provider";
import { useDeleteJobMutation, useGetMyJobsQuery } from "@/features/api/jobsApi";
import { clearFilters } from "@/features/jobs/jobsFilterSlice";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/hooks/useTypedDispatch";
import { useAppSelector } from "@/hooks/useTypedSelector";
import { AlertTriangle, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import DashboardFilters from "../dashboard/_views/DashboardFilters";
import DashboardFiltersSkeleton from "../dashboard/_views/DashboardFiltersSkeleton";
import JobCreateModal from "../dashboard/_views/JobCreateModal";
import JobDetailModal from "../dashboard/_views/JobDetailModal";
import JobEditModal from "../dashboard/_views/JobEditModal";
import JobList, { JobDetail } from "../dashboard/_views/JobList";
import JobListSkeleton from "../dashboard/_views/JobListSkeleton";

export default function MyJobsPage() {
  const { user, isAuthenticated, showLoader } = useAuth();
  const { showToast } = useToast();
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<JobDetail | null>(null);
  const [jobToDelete, setJobToDelete] = useState<JobDetail | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { searchText, selectedTags } = useAppSelector((state) => state.jobsFilter);
  const dispatch = useAppDispatch();

  // Fetch only my jobs from API
  const { data: myJobs = [], isLoading, isError, refetch } = useGetMyJobsQuery();
  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();

  // Add mounted state to prevent hydration issues
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loader while checking authentication (only on client side)
  if (!mounted) {
    return (
      <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div className="text-sm text-muted-foreground mt-4">Loading...</div>
          </div>
        </div>
      </main>
    );
  }

  if (showLoader) {
    return (
      <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div className="text-sm text-muted-foreground mt-4">Loading...</div>
          </div>
        </div>
      </main>
    );
  }

  // Redirect non-clients or unauthenticated users
  if (!isAuthenticated || user?.role !== "client") {
    return (
      <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <svg width="64" height="64" fill="none" viewBox="0 0 64 64" className="mb-4">
              <rect width="64" height="64" rx="16" fill="#f3f4f6" />
              <path d="M12 32l8 8 16-16" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="text-xl font-semibold text-red-600 mb-2">Access Denied</div>
            <div className="text-sm text-muted-foreground text-center">
              Only clients can access this page. Please contact support if you believe this is an error.
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Filter jobs based on searchText and selectedTags

  // Filter jobs based on searchText and selectedTags
  const filteredJobs = myJobs.filter((job) => {
    const matchesSearch =
      !searchText ||
      job.title.toLowerCase().includes(searchText.toLowerCase()) ||
      job.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 || selectedTags.every((tag) => job.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const handleJobClick = (job: JobDetail) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedJob(null);
  };

  const handleEditJob = (job: JobDetail) => {
    setJobToEdit(job);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setJobToEdit(null);
  };

  const handleJobUpdated = () => {
    handleCloseEditModal();
    refetch();
  };

  const handleDeleteJob = (job: JobDetail) => {
    setJobToDelete(job);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setJobToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    
    try {
      await deleteJob({ id: jobToDelete.id }).unwrap();
      showToast({ type: 'success', message: 'Job deleted successfully' });
      handleCloseDeleteModal();
      refetch();
    } catch (err) {
      console.log(err);
      showToast({ type: 'error', message: 'Failed to delete job' });
    }
  };

  return (
    <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">My Jobs</h1>
        <Card className="p-6 mb-8">
          {isLoading ? <DashboardFiltersSkeleton /> : <DashboardFilters />}
        </Card>
        {/* Create Job Button */}
        <div className="flex flex-col sm:flex-row sm:justify-end mb-6">
          <Button
            className="w-full sm:w-auto px-8 py-3 text-base font-semibold shadow-md flex items-center gap-2"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="w-6 h-6" />
            Create Job
          </Button>
        </div>
        {/* Job List */}
        <section className="space-y-4 min-h-[200px]">
          {isLoading ? (
            <JobListSkeleton />
          ) : isError ? (
            <div className="text-center py-10 text-red-500">Failed to load jobs.</div>
          ) : filteredJobs.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16">
              <svg width="64" height="64" fill="none" viewBox="0 0 64 64" className="mb-4">
                <rect width="64" height="64" rx="16" fill="#f3f4f6" />
                <path d="M20 44V28a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v16" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M24 44v-4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="32" cy="32" r="4" fill="#a1a1aa" />
              </svg>
              <div className="text-xl font-semibold text-muted-foreground mb-2">No Jobs Found</div>
              <div className="text-sm text-muted-foreground">You haven&apos;t posted any jobs yet. Click &apos;Create Job&apos; to get started.</div>
            </Card>
          ) : (
            <JobList 
              jobs={filteredJobs} 
              onJobClick={handleJobClick}
              showEditButton={true}
              onEditJob={handleEditJob}
              onDeleteJob={handleDeleteJob}
            />
          )}
        </section>
        <JobDetailModal open={modalOpen} onClose={handleCloseModal} job={selectedJob} />
        <JobCreateModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} onJobPosted={() => { setCreateModalOpen(false); dispatch(clearFilters()); refetch(); }} />
        {jobToEdit && (
          <JobEditModal 
            open={editModalOpen} 
            onClose={handleCloseEditModal} 
            job={jobToEdit}
            onJobUpdated={handleJobUpdated}
          />
        )}
        
        {/* Delete Confirmation Modal */}
        {deleteModalOpen && jobToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <Card className="relative w-full max-w-md mx-4 p-0 rounded-2xl border border-border/30 shadow-xl bg-gradient-to-br from-background to-muted/60 animate-in fade-in zoom-in-95">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">Delete Job</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Are you sure you want to delete &quot;{jobToDelete.title}&quot;? This action cannot be undone.
                </p>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCloseDeleteModal}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Job'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
} 