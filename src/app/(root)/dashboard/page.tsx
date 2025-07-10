"use client";

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGetJobsQuery } from '@/features/api/jobsApi';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/hooks/useTypedSelector';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import DashboardFilters from './_views/DashboardFilters';
import JobCreateModal from './_views/JobCreateModal';
import JobDetailModal from './_views/JobDetailModal';
import JobList, { JobDetail } from './_views/JobList';

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
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
          <DashboardFilters />
        </Card>
        {/* Create Job Button */}
        <div className="flex flex-col sm:flex-row sm:justify-end mb-6">
          {user.role === 'client' && (
            <Button
              className="w-full sm:w-auto px-8 py-3 text-base font-semibold shadow-md flex items-center gap-2"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="w-6 h-6" />
              Create Job
            </Button>
          )}
        </div>
        {/* Job List */}
        <section className="space-y-4 min-h-[200px]">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Loading jobs...</div>
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
        {user.role === 'client' && (
          <JobCreateModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
        )}
      </div>
    </main>
  );
}