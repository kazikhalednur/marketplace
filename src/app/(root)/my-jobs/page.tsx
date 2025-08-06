"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-provider";
import { useDeleteJobMutation, useGetMyJobsQuery } from "@/features/api/jobsApi";
import { clearFilters } from "@/features/jobs/jobsFilterSlice";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/hooks/useTypedDispatch";
import { useAppSelector } from "@/hooks/useTypedSelector";
import { AlertTriangle, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardFilters from "../dashboard/_views/DashboardFilters";
import DashboardFiltersSkeleton from "../dashboard/_views/DashboardFiltersSkeleton";
import JobCreateModal from "../dashboard/_views/JobCreateModal";
import JobDetailModal from "../dashboard/_views/JobDetailModal";
import JobEditModal from "../dashboard/_views/JobEditModal";
import JobList from "../dashboard/_views/JobList";
import type { JobDetail } from "@/types/job";
import JobListSkeleton from "../dashboard/_views/JobListSkeleton";
import UnauthorizedPage from "@/app/unauthorized/page";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const { 
    status, 
    search, 
    tags, 
    min_budget, 
    max_budget, 
    skills, 
    category 
  } = useAppSelector((state) => state.jobsFilter);
  const dispatch = useAppDispatch();

  // Fetch only my jobs from API with pagination and filters
  const { data: myJobsData, isLoading, isError, refetch } = useGetMyJobsQuery({ 
    page: currentPage, 
    pageSize,
    status,
    search,
    tags,
    min_budget,
    max_budget,
    skills,
    category
  });
  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();

  const myJobs = myJobsData?.jobs || [];
  const totalCount = myJobsData?.count || 0;
  const hasNext = myJobsData?.next !== null;
  const hasPrevious = myJobsData?.previous !== null;
  const totalPages = Math.ceil(totalCount / pageSize);

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
      <UnauthorizedPage />
    );
  }

  // Jobs are already filtered by the API, so we use them directly
  const filteredJobs = myJobs;

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
      // Cache invalidation will automatically refetch the data
    } catch (err) {
      console.log(err);
      showToast({ type: 'error', message: 'Failed to delete job' });
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFiltersChange = () => {
    // Reset to first page when filters change
    setCurrentPage(1);
    // Cache invalidation will automatically refetch the data
  };

  return (
    <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">My Jobs</h1>
        <Card className="p-6 mb-8">
          {isLoading ? <DashboardFiltersSkeleton /> : <DashboardFilters onFiltersChange={handleFiltersChange} />}
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
            <>
              <JobList 
                jobs={filteredJobs} 
                onJobClick={handleJobClick}
                showEditButton={true}
                onEditJob={handleEditJob}
                onDeleteJob={handleDeleteJob}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} jobs
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!hasPrevious}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNext}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
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
        {jobToDelete && (
          <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ${deleteModalOpen ? 'animate-in fade-in' : 'hidden'}`}>
            <Card className="w-full max-w-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold">Delete Job</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete &quot;{jobToDelete.title}&quot;? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleCloseDeleteModal}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
} 