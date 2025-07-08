import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Layers, Tag, Clock, TrendingUp, CheckCircle, XCircle, DollarSign, User } from 'lucide-react';
import * as React from 'react';

export interface JobDetail {
  id: number;
  title: string;
  description: string;
  tags: string[];
  posted: string;
  employer: string;
  category?: string;
  currency?: string;
  min_budget?: number;
  max_budget?: number;
  duration?: string;
  experience_level?: string;
  status?: string;
}

interface JobDetailModalProps {
  open: boolean;
  onClose: () => void;
  job: JobDetail | null;
}

export default function JobDetailModal({ open, onClose, job }: JobDetailModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const [applyLoading, setApplyLoading] = React.useState(false);

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
        className="relative w-full max-w-xl md:max-w-2xl p-6 md:p-10 rounded-2xl shadow-2xl bg-background animate-in fade-in zoom-in-95 focus:outline-none"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-3">
            {job.title}
            {job.status && (
              <span
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium shadow-sm ${job.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                title={job.status === 'Open' ? 'Job is open for applications' : 'Job is closed'}
              >
                {job.status === 'Open' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} {job.status}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 md:mt-0">
            <User className="w-4 h-4" aria-hidden="true" />
            <span className="font-semibold text-foreground">{job.employer}</span>
            <span className="mx-2">•</span>
            <span>{job.posted}</span>
          </div>
        </header>
        <div className="mb-4 flex flex-wrap gap-2">
          {job.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-muted text-xs px-3 py-1 rounded-full text-muted-foreground border border-muted-foreground/10"
              title={`Tag: ${tag}`}
            >
              <Tag className="w-3 h-3" /> {tag}
            </span>
          ))}
          {job.category && (
            <span
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200"
              title={`Category: ${job.category}`}
            >
              <Layers className="w-3 h-3" /> {job.category}
            </span>
          )}
        </div>
        <section className="mb-6 text-base text-foreground whitespace-pre-line leading-relaxed">
          {job.description}
        </section>
        <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2" title="Budget Range">
            <DollarSign className="w-4 h-4 text-green-600" aria-hidden="true" />
            <span className="font-semibold">Budget:</span>
            <span>
              {job.currency || '$'}{job.min_budget}
              {job.max_budget && job.max_budget !== job.min_budget ? ` - ${job.currency || '$'}${job.max_budget}` : ''}
            </span>
          </div>
          {job.duration && (
            <div className="flex items-center gap-2" title="Expected Duration">
              <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
              <span className="font-semibold">Duration:</span>
              <span>{job.duration}</span>
            </div>
          )}
          {job.experience_level && (
            <div className="flex items-center gap-2" title="Experience Level Required">
              <TrendingUp className="w-4 h-4 text-primary" aria-hidden="true" />
              <span className="font-semibold">Experience:</span>
              <span>{job.experience_level}</span>
            </div>
          )}
        </section>
        <Button
          className="w-full mt-2 py-3 text-base font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
          onClick={async () => {
            setApplyLoading(true);
            // Simulate async apply action
            await new Promise((r) => setTimeout(r, 1200));
            setApplyLoading(false);
            // You can add a callback or toast here
          }}
          disabled={applyLoading}
          aria-busy={applyLoading}
        >
          {applyLoading ? (
            <span className="animate-spin mr-2 w-4 h-4 border-2 border-t-transparent border-primary rounded-full" />
          ) : null}
          Apply for this Job
        </Button>
      </Card>
    </div>
  );
} 