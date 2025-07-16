import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast-provider';
import { useAuth } from '@/hooks/useAuth';
import { getExperienceBadge } from '@/utils/experienceBadge';
import { getStatusBadge } from '@/utils/statusBadge';
import { getRelativeTime } from '@/utils/time';
import { CheckCircle, Clock, Layers, Tag, TrendingUp, User, X, XCircle, Copy, Check, ArrowLeft, Trash2 } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import type { JobDetail } from './JobList';
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useApplyToJobMutation } from '@/features/api/jobsApi';

// Utility for file validation
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "png", "jpg", "jpeg", "zip", "rar", "txt"];
const EXECUTABLE_EXTENSIONS = ["exe", "bat", "sh", "msi", "apk", "com", "scr", "pif", "gadget", "jar"];
const MAX_FILE_SIZE_MB = 2;
const MAX_FILES = 3;

function isExecutableFile(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase();
  return EXECUTABLE_EXTENSIONS.includes(ext || "");
}
function isAllowedFile(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext || "");
}
function validateFiles(files: File[] | null) {
  if (!files) return "No files selected.";
  if (files.length > MAX_FILES) return `You can upload up to ${MAX_FILES} files.`;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `File ${file.name} exceeds ${MAX_FILE_SIZE_MB}MB.`;
    if (!isAllowedFile(file)) return `File type not allowed: ${file.name}`;
    if (isExecutableFile(file)) return `Executable files are not allowed: ${file.name}`;
  }
  return null;
}

// ApplyJobForm component
function ApplyJobForm({ job, onSuccess, onCancel }: { job: JobDetail, onSuccess: () => void, onCancel: () => void }) {
  const { showToast } = useToast();
  const form = useForm({
    defaultValues: {
      cover_letter: "",
      bid_amount: "",
      attachments: [] as File[],
    },
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [applyToJob] = useApplyToJobMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const currentFiles = form.getValues("attachments") || [];
    const combinedFiles = [...currentFiles, ...Array.from(files)]
      .filter((file, idx, arr) =>
        arr.findIndex(f => f.name === file.name && f.size === file.size) === idx
      );
    if (combinedFiles.length > MAX_FILES) {
      setFileError(`You can upload up to ${MAX_FILES} files.`);
      // Only keep the first 3 files
      form.setValue("attachments", combinedFiles.slice(0, MAX_FILES));
      e.target.value = '';
      return;
    }
    const fileValidationError = validateFiles(combinedFiles);
    setFileError(fileValidationError);
    if (!fileValidationError) {
      form.setValue("attachments", combinedFiles);
    }
    e.target.value = '';
  };

  const handleRemoveFile = (idx: number) => {
    const currentFiles = form.getValues("attachments") || [];
    const newFiles = currentFiles.filter((_: File, i: number) => i !== idx);
    form.setValue("attachments", newFiles);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    const newFiles = Array.from(files);
    const error = validateFiles(newFiles);
    setFileError(error);
    if (!error && files) {
      form.setValue("attachments", newFiles);
    } else {
      form.setValue("attachments", []);
    }
  };

  type FormValues = { cover_letter: string; bid_amount: string; attachments: File[] };
  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('job', job.id);
      formData.append('cover_letter', data.cover_letter);
      formData.append('bid_amount', data.bid_amount);
      (data.attachments || []).forEach((file: File) => {
        formData.append('attachments', file);
      });
      await applyToJob(formData).unwrap();
      showToast({ type: "success", message: "Application submitted successfully!" });
      onSuccess(); // This will trigger a refetch in the parent
    } catch {
      showToast({ type: "error", message: "Failed to apply. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-3 md:p-6 relative">
      {/* Back Icon */}
      <button
        type="button"
        onClick={onCancel}
        className="absolute left-0 top-0 mt-2 ml-2 flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full z-10 border border-border/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Back to job details"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="sr-only">Back</span>
      </button>
      <h2 className="text-xl font-bold mb-4 text-primary text-center">Apply for {job.title}</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent max-h-[80vh] overflow-y-auto">
          <FormField
            control={form.control}
            name="cover_letter"
            rules={{ required: "Cover letter is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Letter</FormLabel>
                <FormControl>
                  <Textarea placeholder="Write your cover letter..." {...field} rows={5} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bid_amount"
            rules={{ required: "Bid amount is required", min: { value: 1, message: "Bid must be positive" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Bid Amount</FormLabel>
                <FormControl>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-lg text-muted-foreground pointer-events-none">৳</span>
                    <input
                      type="number"
                      min={1}
                      placeholder="Enter your bid"
                      {...field}
                      className="pl-8 pr-3 py-2 w-full rounded-lg border border-border/30 bg-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20 text-base transition-all outline-none shadow-xs"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel className="text-base font-semibold">Attachments <span className="text-xs font-normal">(max {MAX_FILES}, {MAX_FILE_SIZE_MB}MB each)</span></FormLabel>
            <div
              className={`border-2 border-dashed rounded-xl p-6 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer select-none ${dragActive ? 'border-primary bg-primary/10' : 'border-border bg-muted/40 hover:border-primary/60 hover:bg-primary/5'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('apply-attachments-input')?.click()}
              tabIndex={0}
              role="button"
              aria-label="Upload attachments"
            >
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="mb-1 text-primary"><path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="16" width="18" height="4" rx="2" fill="currentColor" fillOpacity=".05"/></svg>
              <span className="text-sm text-muted-foreground">Drag & drop files here, or <span className="underline text-primary">click to select</span></span>
              <Input
                id="apply-attachments-input"
                type="file"
                multiple
                accept={ALLOWED_EXTENSIONS.map((e) => '.' + e).join(',')}
                onChange={handleFileChange}
                aria-invalid={!!fileError}
                className="hidden"
              />
            </div>
            {/* File list below drop area */}
            {form.watch("attachments")?.length > 0 && (
              <ul className="mt-3 w-full space-y-2">
                {form.watch("attachments").map((file: File, idx: number) => (
                  <li key={idx} className="flex items-center justify-between gap-2 bg-muted/60 rounded-lg px-4 py-2 shadow-sm border border-border/20">
                    <span className="truncate max-w-[180px] font-medium text-foreground" title={file.name}>{file.name} <span className="text-muted-foreground font-normal">({(file.size / 1024 / 1024).toFixed(2)} MB)</span></span>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); handleRemoveFile(idx); }}
                      className="ml-1 p-1 rounded hover:bg-destructive/10 text-destructive border border-border/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={`Remove ${file.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {fileError && <p className="text-destructive text-sm mt-2 w-full text-center">{fileError}</p>}
          </FormItem>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting} className="rounded-lg px-6 border border-border/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed">Cancel</Button>
            <Button type="submit" disabled={submitting} aria-busy={submitting} className="rounded-lg px-6 shadow-md bg-gradient-to-tr from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 border border-border/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed">
              {submitting ? <span className="animate-spin mr-2 w-4 h-4 border-2 border-t-transparent border-white rounded-full" /> : null}
              Submit Application
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

interface JobDetailModalProps {
  open: boolean;
  onClose: () => void;
  job: JobDetail | null;
  onJobApplied?: () => void;
}

export default function JobDetailModal({ open, onClose, job, onJobApplied }: JobDetailModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [showApplyForm, setShowApplyForm] = React.useState(false);
  // Remove local applied state, use job.is_applied

  // Reset copied state when modal opens/closes
  React.useEffect(() => {
    if (!open) {
      setCopied(false);
    }
  }, [open]);

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
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open || !job) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      onClick={handleBackdropClick}
    >
      <Card
        ref={modalRef}
        className="relative w-full max-w-3xl md:max-w-4xl p-0 rounded-2xl shadow-2xl bg-background focus:outline-none py-4"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full z-10 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        {showApplyForm ? (
          <ApplyJobForm job={job} onSuccess={() => { setShowApplyForm(false); if (onJobApplied) onJobApplied(); }} onCancel={() => setShowApplyForm(false)} />
        ) : (
          <div className="flex flex-col md:flex-row gap-0 md:gap-8 p-6 md:p-8 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
            {/* Left/Main Info */}
            <div className="flex-1 flex flex-col gap-6">
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
                  {job.skills && job.skills.length > 0 && job.skills.map((skill, skillIndex) => (
                    <span
                      key={`${skill.slug || skill.name}-${skillIndex}`}
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
            <div className="md:w-96 w-full flex flex-col gap-6 p-6 border-t md:border-t-0 md:border-l border-border/20 bg-white">
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
              <div className="mt-6 mb-4">
                <div className="font-semibold mb-1 text-sm">Job link</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={typeof window !== 'undefined' ? `${window.location.origin}/dashboard?jobId=${job.id}` : ''}
                    readOnly
                    className="bg-muted text-muted-foreground rounded px-3 py-2 text-xs w-full font-mono border border-border/20 focus:ring-2 focus:ring-primary/30 transition-all overflow-x-auto whitespace-nowrap"
                    style={{ cursor: 'text' }}
                  />
                  <button
                    className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium text-xs transition-all duration-200 border ${
                      copied
                        ? 'bg-green-100 text-green-700 border-green-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!copied) {
                        const jobLink = typeof window !== 'undefined' ? `${window.location.origin}/dashboard?jobId=${job.id}` : '';
                        navigator.clipboard.writeText(jobLink);
                        setCopied(true);
                      }
                    }}
                    type="button"
                    disabled={copied}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
              {isAuthenticated && user.role === 'freelancer' && (
                <Button
                  className="w-full mt-2 py-3 text-base font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all disabled:cursor-not-allowed"
                  onClick={() => setShowApplyForm(true)}
                  disabled={job.is_applied || job.status === 'closed'}
                >
                  {job.is_applied ? 'Applied' : job.status === 'closed' ? 'Closed' : 'Apply for this Job'}
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
