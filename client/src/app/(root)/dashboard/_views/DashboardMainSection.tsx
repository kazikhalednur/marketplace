import JobList from './JobList';
import JobListSkeleton from './JobListSkeleton';
import DashboardEmptyState from './DashboardEmptyState';
import DashboardPagination, { DashboardPaginationProps } from './DashboardPagination';
import type { JobDetail } from '@/types/job';

type DashboardMainSectionProps = {
  isLoading: boolean;
  isError: boolean;
  filteredJobs: JobDetail[];
  handleJobClick: (job: JobDetail) => void;
  totalPages: number;
  paginationProps: DashboardPaginationProps;
};

export default function DashboardMainSection({
  isLoading, isError, filteredJobs, handleJobClick, totalPages, paginationProps
}: DashboardMainSectionProps) {
  if (isLoading) return <JobListSkeleton />;
  if (isError) return <div className="text-center py-10 text-red-500">Failed to load jobs.</div>;
  if (filteredJobs.length === 0) return <DashboardEmptyState />;
  return (
    <>
      <JobList jobs={filteredJobs} onJobClick={handleJobClick} />
      {totalPages > 1 && <DashboardPagination {...paginationProps} />}
    </>
  );
} 