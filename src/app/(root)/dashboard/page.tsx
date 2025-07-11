"use client";

import { Card } from '@/components/ui/card';
import { useGetJobsQuery } from '@/features/api/jobsApi';
import { useAppSelector } from '@/hooks/useTypedSelector';

import { useState } from 'react';
import DashboardFilters from './_views/DashboardFilters';
import DashboardFiltersSkeleton from './_views/DashboardFiltersSkeleton';

import JobDetailModal from './_views/JobDetailModal';
import JobList, { JobDetail } from './_views/JobList';
import JobListSkeleton from './_views/JobListSkeleton';

export default function DashboardPage() {
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { searchText, selectedTags } = useAppSelector((state) => state.jobsFilter);

  // Fetch jobs from API
  const { data: jobs = [], isLoading, isError } = useGetJobsQuery();

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

  const handleJobClick = (job: JobDetail) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedJob(null);
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
            <JobList jobs={filteredJobs} onJobClick={handleJobClick} />
          )}
        </section>
        <JobDetailModal open={modalOpen} onClose={handleCloseModal} job={selectedJob} />
      </div>
    </main>
  );
}