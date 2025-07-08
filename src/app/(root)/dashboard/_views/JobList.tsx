import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { JobDetail } from './JobDetailModal';

interface JobListProps {
  jobs: JobDetail[];
  onJobClick: (job: JobDetail) => void;
}

function JobCard({ job, onClick }: { job: JobDetail; onClick: (job: JobDetail) => void }) {
  return (
    <Card
      className="p-5 flex flex-col gap-2 hover:shadow-lg transition-shadow group cursor-pointer"
      onClick={() => onClick(job)}
    >
      <div className="flex items-center justify-between">
        <a href="#" className="text-lg font-semibold text-primary group-hover:underline" onClick={e => { e.preventDefault(); onClick(job); }}>
          {job.title}
        </a>
        <span className="text-base font-bold text-green-600">${job.price}</span>
      </div>
      <div className="text-muted-foreground text-sm mb-1 line-clamp-2">{job.description}</div>
      <div className="flex flex-wrap gap-2 mb-1">
        {job.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs px-2 py-1">
            {tag}
          </Badge>
        ))}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted-foreground">{job.posted}</span>
        <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors" onClick={e => { e.stopPropagation(); onClick(job); }}>View Details</Button>
      </div>
    </Card>
  );
}

export default function JobList({ jobs, onJobClick }: JobListProps) {
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} onClick={onJobClick} />
      ))}
    </div>
  );
} 