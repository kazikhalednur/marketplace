"use client";

import { useGetJobsQuery } from '@/features/api/jobsApi';
import { useAppSelector } from '@/hooks/useTypedSelector';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

import DashboardHeader from './_views/DashboardHeader';
import DashboardMainSection from './_views/DashboardMainSection';
import JobDetailModal from './_views/JobDetailModal';
import type { JobDetail } from '@/types/job';

function DashboardContent() {
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
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
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch jobs from API with pagination and filters
  const { data: jobsData, isLoading, isError, refetch } = useGetJobsQuery({ 
    page: currentPage, 
    pageSize,
    status,
    search,
    tags,
    min_budget,
    max_budget,
    skills,
    category
  }, {
    // Add a polling interval to ensure fresh data
    pollingInterval: 0, // Disable polling, we'll use manual refetch
  });

  // Debug logging for filter changes
  useEffect(() => {
    console.log('Filters changed:', { status, search, tags, min_budget, max_budget, skills, category });
  }, [status, search, tags, min_budget, max_budget, skills, category]);

  // Reset to first page when any filter changes (except page)
  useEffect(() => {
    setCurrentPage(1);
  }, [status, search, tags, min_budget, max_budget, skills, category]);

  const jobs = useMemo(() => jobsData?.jobs || [], [jobsData]);
  
  // Use server-side pagination data directly
  const totalCount = jobsData?.count || 0;
  const hasNext = jobsData?.next !== null;
  const hasPrevious = jobsData?.previous !== null;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Handle URL parameters for job details and update selectedJob when jobs data changes
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
  }, [searchParams, jobs, modalOpen]);

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

  const handleJobApplied = () => {
    // Manually refetch the jobs data to get the updated is_applied status
    refetch();
  };

  return (
    <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <DashboardHeader isLoading={isLoading} />
        {/* Job List */}
        <section className="space-y-4 min-h-[200px]">
          <DashboardMainSection
            isLoading={isLoading}
            isError={isError}
            filteredJobs={jobs}
            handleJobClick={handleJobClick}
            totalPages={totalPages}
            paginationProps={{
              currentPage,
              totalPages,
              hasPrevious,
              hasNext,
              pageSize,
              totalCount,
              onPageChange: handlePageChange,
            }}
          />
        </section>
        <JobDetailModal open={modalOpen} onClose={handleCloseModal} job={selectedJob} 
          onJobApplied={handleJobApplied}
        />
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