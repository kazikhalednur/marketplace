import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import * as React from 'react';

export interface JobDetail {
  id: number;
  title: string;
  description: string;
  price: number;
  tags: string[];
  posted: string;
  employer: string;
}

interface JobDetailModalProps {
  open: boolean;
  onClose: () => void;
  job: JobDetail | null;
}

export default function JobDetailModal({ open, onClose, job }: JobDetailModalProps) {
  if (!open || !job) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <Card className="relative w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-primary transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold mb-2 text-primary">{job.title}</h2>
        <div className="mb-4 text-sm text-muted-foreground">Posted by <span className="font-semibold text-foreground">{job.employer}</span> • {job.posted}</div>
        <div className="mb-4 text-base text-foreground whitespace-pre-line">{job.description}</div>
        <div className="mb-4 flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span key={tag} className="inline-block bg-muted text-xs px-3 py-1 rounded-full text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
        <div className="mb-6 text-lg font-semibold text-green-600">Budget: ${job.price}</div>
        <Button className="w-full">Apply for this Job</Button>
      </Card>
    </div>
  );
} 