"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetJobsQuery } from '@/features/api/jobsApi';
import { useAppSelector } from '@/hooks/useTypedSelector';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardFilters from './_views/DashboardFilters';
import DashboardFiltersSkeleton from './_views/DashboardFiltersSkeleton';

import JobDetailModal from './_views/JobDetailModal';
import JobList, { JobDetail } from './_views/JobList';
import JobListSkeleton from './_views/JobListSkeleton';

function DashboardContent() {
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const { searchText, selectedTags } = useAppSelector((state) => state.jobsFilter);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch jobs from API with pagination
  const { data: jobsData, isLoading, isError } = useGetJobsQuery({ 
    page: currentPage, 
    pageSize 
  });

  const jobs = jobsData?.jobs || [];
  const totalCount = jobsData?.count || 0;
  const hasNext = jobsData?.next !== null;
  const hasPrevious = jobsData?.previous !== null;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Filter jobs based on searchText and selectedTags
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !searchText ||
      job.title.toLowerCase().includes(searchText.toLowerCase()) ||
      job.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 || selectedTags.every((tag) => job.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  // Handle URL parameters for job details
  useEffect(() => {
    const jobId = searchParams.get('jobId');
    if (jobId && jobs.length > 0) {
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        setSelectedJob(job);
        setModalOpen(true);
      }
    } else if (!jobId && modalOpen) {
      // Close modal if jobId is removed from URL
      setModalOpen(false);
      setSelectedJob(null);
    }
  }, [searchParams, jobs]);

  const handleJobClick = (job: JobDetail) => {
    setSelectedJob(job);
    setModalOpen(true);
    
    // Update URL with jobId parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('jobId', job.id);
    router.push(`/dashboard?${params.toString()}`, { scroll: false });
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedJob(null);
    
    // Remove jobId from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete('jobId');
    const newUrl = params.toString() ? `/dashboard?${params.toString()}` : '/dashboard';
    router.push(newUrl, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Job Dashboard</h1>
        <Card className="p-6 mb-8">
          {isLoading ? <DashboardFiltersSkeleton /> : <DashboardFilters />}
        </Card>

        {/* Job List */}
        <section className="space-y-4 min-h-[200px]">
          {isLoading ? (
            <JobListSkeleton />
          ) : isError ? (
            <div className="text-center py-10 text-red-500">Failed to load jobs.</div>
          ) : filteredJobs.length === 0 ? (
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
          ) : (
            <>
              <JobList jobs={filteredJobs} onJobClick={handleJobClick} />
              
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
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div className="text-sm text-muted-foreground mt-4">Loading...</div>
          </div>
        </div>
      </main>
    }>
      <DashboardContent />
    </Suspense>
  );
}