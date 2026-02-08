import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getExperienceBadge } from '@/utils/experienceBadge';
import { getStatusBadge } from '@/utils/statusBadge';
import { getRelativeTime } from '@/utils/time';
import { Briefcase, CheckCircle, Clock, Layers, Tag, TrendingUp, XCircle, Edit, Trash2 } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { JobDetail } from '@/types/job';

export interface JobListProps {
  jobs: JobDetail[];
  onJobClick: (job: JobDetail) => void;
  showEditButton?: boolean;
  onEditJob?: (job: JobDetail) => void;
  onDeleteJob?: (job: JobDetail) => void;
}

function JobCard({ job, onClick, showEditButton, onEditJob, onDeleteJob }: { 
  job: JobDetail; 
  onClick: (job: JobDetail) => void;
  showEditButton?: boolean;
  onEditJob?: (job: JobDetail) => void;
  onDeleteJob?: (job: JobDetail) => void;
}) {
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
            {showEditButton && (onEditJob || onDeleteJob) && (
              <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                {onEditJob && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditJob(job);
                    }}
                    title="Edit job"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                {onDeleteJob && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteJob(job);
                    }}
                    title="Delete job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
            {/* Applied check icon at the end */}
            {job.is_applied && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-2 text-blue-600 cursor-pointer">
                    <CheckCircle className="w-5 h-5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  You have already applied.
                </TooltipContent>
              </Tooltip>
            )}
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
            {job.skills && job.skills.length > 0 && job.skills.map((skill, skillIndex) => (
              <Badge key={`${skill.slug || skill.name}-${skillIndex}`} variant="secondary" className="text-xs px-2 py-1 flex items-center gap-1 border-green-200 bg-green-50 text-green-700">
                <TrendingUp className="w-3 h-3" /> {skill.name}
              </Badge>
            ))}
          </div>
        </div>
        {/* Right: Meta Info */}
        <div className="md:w-64 w-full md:border-l border-border/40 bg-muted/40 flex flex-col justify-between p-6 gap-4 md:gap-2">
          <div className="flex flex-col gap-3">
            {/* Budget Row */}
            <div className="flex items-center gap-2 text-green-700 font-semibold text-lg mb-1">
              <span className="text-lg font-extrabold align-middle text-green-700">
                {/* {getCurrencySymbol(job.currency)} */}৳
                </span>
              <span>{job.min_budget ?? 0}</span>
              {job.max_budget && job.max_budget !== job.min_budget && (
                <span className="text-sm flex items-center text-green-700">- <span className="text-sm font-extrabold align-middle text-green-700 mx-1">
                  {/* {getCurrencySymbol(job.currency)} */}৳
                </span>{job.max_budget}</span>
              )}
            </div>
            {/* Fixed/Flexible and Duration Row */}
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              {job.is_fixed !== undefined && (
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${job.is_fixed ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-muted-foreground/20'}`}>
                  {job.is_fixed ? <CheckCircle className="w-3 h-3 text-primary" /> : <XCircle className="w-3 h-3 text-muted-foreground" />} {job.is_fixed ? 'Fixed' : 'Flexible'}
                </span>
              )}
              {job.duration && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" /> {job.duration}
                </span>
              )}
            </div>
            {/* Payment verified badge */}
            {job.is_payment_verified && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3" /> Payment verified
              </span>
            )}
            {/* Experience and Proposals */}
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

export default function JobList({ jobs, onJobClick, showEditButton, onEditJob, onDeleteJob }: JobListProps) {
  return (
    <div className="space-y-4">
      {jobs.map((job, idx) => (
        <JobCard 
          key={job.id || `${job.title}-${idx}` } 
          job={job} 
          onClick={onJobClick}
          showEditButton={showEditButton}
          onEditJob={onEditJob}
          onDeleteJob={onDeleteJob}
        />
      ))}
    </div>
  );
}