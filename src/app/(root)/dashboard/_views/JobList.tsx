import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getExperienceBadge } from '@/utils/experienceBadge';
import { getCurrencySymbol } from '@/utils/getCurrencySymbol';
import { getStatusBadge } from '@/utils/statusBadge';
import { getRelativeTime } from '@/utils/time';
import { Briefcase, CheckCircle, Clock, Layers, Tag, TrendingUp, XCircle } from 'lucide-react';

export interface JobCreator {
  full_name: string;
  is_payment_verified?: boolean | null;
  date_joined?: string;
}

export interface JobDetail {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category?: string | { name: string; slug: string };
  skills?: { name: string; slug: string }[];
  currency?: string;
  min_budget?: number | string;
  max_budget?: number | string;
  is_fixed?: boolean;
  duration?: string;
  experience_level?: string;
  status?: string;
  min_proposal_count?: number;
  max_proposal_count?: number;
  created_by?: JobCreator;
  created_at?: string;
}

export interface JobListProps {
  jobs: JobDetail[];
  onJobClick: (job: JobDetail) => void;
}

function JobCard({ job, onClick }: { job: JobDetail; onClick: (job: JobDetail) => void }) {
  // const key = job.status?.toLowerCase() || '';
  // const bg = getStatusBadge(key, true); // true for bg color
  // console.log("job", job);
  return (
    <Card
      className="p-0 overflow-hidden group cursor-pointer border border-border/70 hover:shadow-2xl transition-shadow"
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
            {getStatusBadge(job.status)}
          </div>
          <div className="text-xs text-muted-foreground mb-1">
            by <span className="font-semibold text-foreground">{job.created_by?.full_name || 'Unknown'}</span>
            {job.created_at && (
              <>
                {' '}• {getRelativeTime(job.created_at)}
              </>
            )}
          </div>
          <div className="text-muted-foreground text-sm mb-1 line-clamp-2">{job.description}</div>
          <div className="flex flex-wrap gap-2 mb-1">
            {job.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-1 flex items-center gap-1">
                <Tag className="w-3 h-3" /> {tag}
              </Badge>
            ))}
            {job.category && (
              <Badge variant={"secondary"} className="text-xs px-2 py-1 flex items-center gap-1">
                <Layers className="w-3 h-3" /> {typeof job.category === 'string' ? job.category : job.category.name}
              </Badge>
            )}
            {job.skills && job.skills.length > 0 && job.skills.map((skill) => (
              <Badge key={skill.slug} variant="secondary" className="text-xs px-2 py-1 flex items-center gap-1 border-green-200 bg-green-50 text-green-700">
                <TrendingUp className="w-3 h-3" /> {skill.name}
              </Badge>
            ))}
          </div>
        </div>
        {/* Right: Meta Info */}
        <div className="md:w-64 w-full md:border-l border-border/40 bg-muted/40 flex flex-col justify-between p-6 gap-4 md:gap-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-green-700 font-semibold text-lg">
              <span className="text-lg font-extrabold align-middle text-green-700">{getCurrencySymbol(job.currency)}</span>
              <span>{job.min_budget ?? 0}</span>
              {job.max_budget && job.max_budget !== job.min_budget && (
                <span className="text-sm flex items-center text-green-700">- <span className="text-sm font-extrabold align-middle text-green-700 mx-1">{getCurrencySymbol(job.currency)}</span>{job.max_budget}</span>
              )}
            </div>
            {job.duration && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="w-4 h-4 text-primary" /> {job.duration}</div>
            )}
            <div className="flex items-center gap-2">
              {job.is_fixed !== undefined && (
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${job.is_fixed ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-muted-foreground/20'}`}>
                  {job.is_fixed ? <CheckCircle className="w-3 h-3 text-primary" /> : <XCircle className="w-3 h-3 text-muted-foreground" />} {job.is_fixed ? 'Fixed' : 'Flexible'}
                </span>
              )}
              {job.created_by?.is_payment_verified && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3" /> Payment verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {getExperienceBadge(job.experience_level)}
              {job.min_proposal_count !== undefined && job.max_proposal_count !== undefined && (
                <span className="text-xs text-muted-foreground ml-2">{job.min_proposal_count} - {job.max_proposal_count} proposals</span>
              )}
            </div>
          </div>
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