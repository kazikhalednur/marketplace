import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast-provider';
import { useAuth } from '@/hooks/useAuth';
import { getExperienceBadge } from '@/utils/experienceBadge';
import { getStatusBadge } from '@/utils/statusBadge';
import { getRelativeTime } from '@/utils/time';
import { CheckCircle, Clock, Layers, Tag, TrendingUp, User, X, XCircle } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import type { JobDetail } from './JobList';

interface JobDetailModalProps {
  open: boolean;
  onClose: () => void;
  job: JobDetail | null;
}

export default function JobDetailModal({ open, onClose, job }: JobDetailModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const [applyLoading, setApplyLoading] = React.useState(false);
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Accessibility: Focus trap and Escape key
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open || !job) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      onClick={handleBackdropClick}
    >
      <Card
        ref={modalRef}
        className="relative w-full max-w-3xl md:max-w-4xl p-0 rounded-2xl shadow-2xl bg-background animate-in fade-in zoom-in-95 focus:outline-none"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex flex-col md:flex-row gap-0 md:gap-8 p-0 md:p-8 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
          {/* Left/Main Info */}
          <div className="flex-1 p-6 md:p-0 flex flex-col gap-6">
            {/* Job Overview */}
            <div className="flex flex-col gap-2 border-b pb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-3">
                  {job.title}
                </h2>
                {getStatusBadge(job.status)}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" aria-hidden="true" />
                  <span className="font-semibold text-foreground">{job.created_by?.full_name || 'Unknown'}</span>
                </span>
                <span className="mx-2 hidden md:inline">•</span>
                <span>{job.created_at ? getRelativeTime(job.created_at) : ''}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="font-semibold text-lg text-primary mb-1">Tags & Skills</div>
              <div className="flex flex-wrap gap-2">
                {job.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-muted text-xs px-3 py-1 rounded-full text-muted-foreground border border-muted-foreground/10 hover:bg-primary/10 hover:text-primary transition-colors"
                    title={`Tag: ${tag}`}
                  >
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
                {job.category && (
                  <span
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200 hover:bg-blue-200/60 transition-colors"
                    title={`Category: ${typeof job.category === 'string' ? job.category : job.category.name}`}
                  >
                    <Layers className="w-3 h-3" /> {typeof job.category === 'string' ? job.category : job.category.name}
                  </span>
                )}
                {job.skills && job.skills.length > 0 && job.skills.map((skill) => (
                  <span
                    key={skill.slug}
                    className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full border border-green-200 hover:bg-green-200/60 transition-colors"
                    title={`Skill: ${skill.name}`}
                  >
                    <TrendingUp className="w-3 h-3" /> {skill.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="font-semibold text-lg text-primary mt-4 mb-1">Description</div>
            <div className="text-base text-foreground whitespace-pre-line leading-relaxed bg-muted/40 rounded-lg p-4 border border-muted-foreground/10">
              {job.description}
            </div>
          </div>
          {/* Right/Meta & Apply */}
          <div className="md:w-96 w-full flex flex-col gap-6 p-8 border-t md:border-t-0 md:border-l border-border/20 bg-white">
            <div>
              <div className="font-semibold text-lg text-primary mb-2 tracking-wide">Budget & Terms</div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-base">Budget:</span>
                  <span className="text-lg font-extrabold align-middle text-green-700">
                    {/* {getCurrencySymbol(job.currency)} */}৳
                  </span>
                  <span className="text-lg font-bold">{job.min_budget}</span>
                  {job.max_budget && job.max_budget !== job.min_budget && (
                    <span className="text-sm flex items-center text-green-700">- <span className="text-sm font-extrabold align-middle text-green-700 mx-1">
                      {/* {getCurrencySymbol(job.currency)} */}৳
                    </span>{job.max_budget}</span>
                  )}
                </div>
                {job.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                    <span className="font-medium text-base">Duration:</span>
                    <span className="text-base">{job.duration}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium text-base">Type:</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold border ${job.is_fixed ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-muted-foreground/20'}`}>
                    {job.is_fixed ? <CheckCircle className="w-4 h-4 text-primary" /> : <XCircle className="w-4 h-4 text-muted-foreground" />} {job.is_fixed ? 'Fixed' : 'Flexible'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-base">Experience:</span>
                  <span className="w-full flex justify-start">{getExperienceBadge(job.experience_level)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-base">Proposals:</span>
                  <span className="text-base">{job.min_proposal_count} - {job.max_proposal_count}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-base">Status:</span>
                  {getStatusBadge(job.status)}
                </div>
              </div>
            </div>
            <hr className="my-4 border-border/20" />
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                <span>Posted {job.created_at ? getRelativeTime(job.created_at) : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" aria-hidden="true" />
                <span>{job.created_by?.full_name || 'Unknown'}</span>
              </div>
              {job.created_by?.date_joined && (
                <div className="ml-6">
                  Member since <span className="font-medium">{new Date(job.created_by.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              )}
              {job.created_by?.is_payment_verified ? (
                <div className="flex items-center gap-2 text-green-600 font-medium ml-6">
                  <CheckCircle className="w-4 h-4" />
                  Payment method verified
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground ml-6">
                  <XCircle className="w-4 h-4" />
                  Payment not verified
                </div>
              )}
            </div>
            <div className="mt-6">
              <div className="font-semibold mb-1 text-sm">Job link</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  readOnly
                  className="bg-muted text-muted-foreground rounded px-3 py-2 text-xs w-full font-mono border border-border/20 focus:ring-2 focus:ring-primary/30 transition-all"
                  style={{ cursor: 'not-allowed' }}
                />
                <button
                  className={`text-green-600 font-medium text-xs px-2 py-1 rounded hover:bg-green-50 focus:bg-green-100 transition-all border border-green-100 ${copied ? 'bg-green-100' : ''}`}
                  onClick={() => {
                    navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1200);
                  }}
                  type="button"
                >
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
              </div>
            </div>
            {isAuthenticated && user.role === 'freelancer' && (
              <Button
                className="w-full mt-2 py-3 text-base font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
                onClick={async () => {
                  setApplyLoading(true);
                  try {
                    // Simulate async apply action
                    await new Promise((r) => setTimeout(r, 1200));
                    showToast({
                      type: 'success',
                      message: 'Application submitted successfully!'
                    });
                  } catch (err) {
                    showToast({
                      type: 'error',
                      message: 'Failed to apply for this job. Please try again.'
                    });
                    console.error(err);
                  } finally {
                    setApplyLoading(false);
                  }
                }}
                disabled={applyLoading}
                aria-busy={applyLoading}
              >
                {applyLoading ? (
                  <span className="animate-spin mr-2 w-4 h-4 border-2 border-t-transparent border-primary rounded-full" />
                ) : null}
                Apply for this Job
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
