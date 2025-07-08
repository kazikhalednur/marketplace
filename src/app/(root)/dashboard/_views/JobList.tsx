import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { JobDetail } from './JobDetailModal';
import { Briefcase, Tag, Clock, DollarSign, Layers, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

interface JobListProps {
  jobs: JobDetail[];
  onJobClick: (job: JobDetail) => void;
}

function JobCard({ job, onClick }: { job: JobDetail; onClick: (job: JobDetail) => void }) {
  return (
    <Card
      className="p-0 overflow-hidden group cursor-pointer border border-border/70 bg-gradient-to-br from-background via-card to-muted/80 hover:shadow-2xl transition-shadow"
      onClick={() => onClick(job)}
    >
      <div className="flex flex-col md:flex-row">
        {/* Left: Main Info */}
        <div className="flex-1 p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-5 h-5 text-primary" />
            <a href="#" className="text-xl font-bold text-primary group-hover:underline" onClick={e => { e.preventDefault(); onClick(job); }}>
              {job.title}
            </a>
            {job.status && (
              <span className={`ml-2 flex items-center gap-1 text-xs px-2 py-1 rounded-full ${job.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {job.status === 'Open' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} {job.status}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mb-1">by <span className="font-semibold text-foreground">{job.employer}</span> • {job.posted}</div>
          <div className="text-muted-foreground text-sm mb-1 line-clamp-2">{job.description}</div>
          <div className="flex flex-wrap gap-2 mb-1">
            {job.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-1 flex items-center gap-1">
                <Tag className="w-3 h-3" /> {tag}
              </Badge>
            ))}
            {job.category && (
              <Badge variant={"secondary"} className="text-xs px-2 py-1 flex items-center gap-1">
                <Layers className="w-3 h-3" /> {job.category}
              </Badge>
            )}
          </div>
        </div>
        {/* Right: Meta Info */}
        <div className="md:w-64 w-full md:border-l border-border/40 bg-muted/40 flex flex-col justify-between p-6 gap-4 md:gap-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-green-700 font-semibold text-lg">
              <DollarSign className="w-5 h-5" />
              <span>{(job.currency || '$')}{job.min_budget ?? 0}</span>
              {job.max_budget && job.max_budget !== job.min_budget && (
                <span className="text-xs text-muted-foreground">- {(job.currency || '$')}{job.max_budget}</span>
              )}
            </div>
            {job.duration && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="w-4 h-4 text-primary" /> {job.duration}</div>
            )}
            {job.experience_level && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="w-4 h-4 text-primary" /> {job.experience_level}</div>
            )}
          </div>
          <Button size="sm" variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors mt-4 md:mt-0" onClick={e => { e.stopPropagation(); onClick(job); }}>View Details</Button>
        </div>
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