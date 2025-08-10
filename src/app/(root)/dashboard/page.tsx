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
  
  // Filter jobs on the frontend based on search and other filters
  const filteredJobs = useMemo(() => {
    if (!jobs.length) return [];
    
    return jobs.filter(job => {
      // Search text filter
      if (search && search.trim()) {
        const searchLower = search.toLowerCase().trim();
        const titleMatch = job.title.toLowerCase().includes(searchLower);
        const descriptionMatch = job.description.toLowerCase().includes(searchLower);
        const tagsMatch = job.tags.some(tag => tag.toLowerCase().includes(searchLower));
        const categoryMatch = job.category && typeof job.category === 'object' 
          ? job.category.name.toLowerCase().includes(searchLower)
          : job.category && typeof job.category === 'string'
          ? job.category.toLowerCase().includes(searchLower)
          : false;
        const skillsMatch = job.skills 
          ? job.skills.some(skill => skill.name.toLowerCase().includes(searchLower))
          : false;
        
        if (!titleMatch && !descriptionMatch && !tagsMatch && !categoryMatch && !skillsMatch) {
          return false;
        }
      }
      
      // Status filter
      if (status && job.status !== status) {
        return false;
      }
      
      // Tags filter
      if (tags && tags.length > 0) {
        const hasMatchingTag = tags.some(tag => 
          job.tags.some(jobTag => jobTag.toLowerCase() === tag.toLowerCase())
        );
        if (!hasMatchingTag) {
          return false;
        }
      }
      
      // Budget filter
      if (min_budget && job.min_budget) {
        const jobMinBudget = typeof job.min_budget === 'string' ? parseFloat(job.min_budget) : job.min_budget;
        if (jobMinBudget < parseFloat(min_budget)) {
          return false;
        }
      }
      if (max_budget && job.max_budget) {
        const jobMaxBudget = typeof job.max_budget === 'string' ? parseFloat(job.max_budget) : job.max_budget;
        if (jobMaxBudget > parseFloat(max_budget)) {
          return false;
        }
      }
      
      // Skills filter
      if (skills && skills.length > 0 && job.skills) {
        const hasMatchingSkill = skills.some(skill => 
          job.skills!.some(jobSkill => jobSkill.name.toLowerCase() === skill.toLowerCase())
        );
        if (!hasMatchingSkill) {
          return false;
        }
      }
      
      // Category filter
      if (category && job.category) {
        const jobCategoryName = typeof job.category === 'object' ? job.category.name : job.category;
        if (jobCategoryName !== category) {
          return false;
        }
      }
      
      return true;
    });
  }, [jobs, search, status, tags, min_budget, max_budget, skills, category]);

  // Calculate pagination for filtered results
  const filteredTotalCount = filteredJobs.length;
  const filteredTotalPages = Math.ceil(filteredTotalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedFilteredJobs = filteredJobs.slice(startIndex, endIndex);
  const hasNextFiltered = endIndex < filteredTotalCount;
  const hasPreviousFiltered = currentPage > 1;

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
            filteredJobs={paginatedFilteredJobs}
            handleJobClick={handleJobClick}
            totalPages={filteredTotalPages}
            paginationProps={{
              currentPage,
              totalPages: filteredTotalPages,
              hasPrevious: hasPreviousFiltered,
              hasNext: hasNextFiltered,
              pageSize,
              totalCount: filteredTotalCount,
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