import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelectField, SelectField } from "@/components/ui/select-field";
import { TagsInput } from "@/components/ui/tags-input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast-provider";
import { useGetDropdownsQuery, useUpdateJobMutation } from '@/features/api/jobsApi';
import { Briefcase, DollarSign, TrendingUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import type { JobDetail } from "./JobList";

// Define a type for the form values
interface JobFormValues {
  title: string;
  description: string;
  tags: string[];
  category: string;
  skills: string[];
  is_fixed: boolean;
  duration: string;
  min_budget: string;
  max_budget: string;
  experience_level: string;
  min_proposal_count: number;
  max_proposal_count: number | string;
  status: string;
}

// Types for dropdowns
interface DropdownCategory {
  id: number;
  name: string;
  slug: string;
  skills?: DropdownSkill[];
}
interface DropdownSkill {
  id: number;
  name: string;
  slug: string;
}
interface DropdownExperienceLevel {
  label: string;
  value: string;
}
interface DropdownStatus {
  label: string;
  value: string;
}

interface JobEditModalProps {
  open: boolean;
  onClose: () => void;
  job: JobDetail;
  onJobUpdated?: () => void;
}

export default function JobEditModal({ open, onClose, job, onJobUpdated }: JobEditModalProps) {
  const { showToast } = useToast();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  const { data: dropdowns, isLoading: dropdownsLoading } = useGetDropdownsQuery();
  
  const form = useForm<JobFormValues>({
    defaultValues: {
      title: "",
      description: "",
      tags: [],
      category: "",
      skills: [],
      is_fixed: false,
      duration: "",
      min_budget: "",
      max_budget: "",
      experience_level: "",
      min_proposal_count: 1,
      max_proposal_count: "",
      status: "draft",
    },
  });

  // Pre-populate form when job changes
  useEffect(() => {
    if (job && dropdowns) {
      // Map job skills to their IDs from dropdown data
      const allSkills = dropdowns.categories?.flatMap((cat: DropdownCategory) => cat.skills || []) || [];
      const skillIdMap = new Map();
      allSkills.forEach(skill => {
        skillIdMap.set(skill.name, skill.id);
        skillIdMap.set(skill.slug, skill.id);
      });
      
      const mappedSkills = job.skills?.map(skill => {
        const skillId = skillIdMap.get(skill.name) || skillIdMap.get(skill.slug);
        return skillId?.toString() || skill.slug || skill.name;
      }).filter(Boolean) || [];

      form.reset({
        title: job.title || "",
        description: job.description || "",
        tags: job.tags || [],
        category: typeof job.category === 'object' ? job.category.slug || "" : job.category || "",
        skills: mappedSkills,
        is_fixed: job.is_fixed || false,
        duration: job.duration || "",
        min_budget: job.min_budget?.toString() || "",
        max_budget: job.max_budget?.toString() || "",
        experience_level: job.experience_level || "",
        min_proposal_count: job.min_proposal_count || 1,
        max_proposal_count: job.max_proposal_count?.toString() || "",
        status: job.status || "draft",
      });
    }
  }, [job, form, dropdowns]);
  const CATEGORY_OPTIONS = dropdowns?.categories?.map((c: DropdownCategory) => ({ value: c.id, label: c.name, skills: c.skills })) || [];
  const EXPERIENCE_LEVEL_OPTIONS = (dropdowns?.experience_levels as DropdownExperienceLevel[] | undefined)?.map((e) => ({ value: e.value, label: e.label })) || [];
  const STATUS_OPTIONS = (dropdowns?.status as DropdownStatus[] | undefined)?.map((s) => ({ value: s.value, label: s.label })) || [];

  // Get selected category object
  const selectedCategory = CATEGORY_OPTIONS.find((cat) => String(cat.value) === String(form.watch('category')));
  const SKILL_OPTIONS = selectedCategory?.skills?.map((s: DropdownSkill) => ({ value: s.id, label: s.name })) || [];

  const onSubmit = async (data: JobFormValues) => {
    // Validation
    if (!data.is_fixed && Number(data.min_budget) >= Number(data.max_budget)) {
      showToast({ type: 'error', message: 'Min budget must be less than max budget.' });
      return;
    }
    if (Number(data.min_proposal_count) >= Number(data.max_proposal_count)) {
      showToast({ type: 'error', message: 'Min proposal must be less than max proposal.' });
      return;
    }

    try {
      const payload = {
        title: data.title,
        description: data.description,
        category: Number(data.category),
        tags: data.tags,
        skills: data.skills.map(Number),
        min_budget: data.min_budget,
        max_budget: data.is_fixed ? data.min_budget : data.max_budget,
        is_fixed: data.is_fixed,
        duration: data.duration,
        experience_level: data.experience_level,
        min_proposal_count: Number(data.min_proposal_count),
        max_proposal_count: Number(data.max_proposal_count),
        status: data.status,
      };
      
      await updateJob({ id: job.id, ...payload }).unwrap();
      
      showToast({ type: 'success', message: 'Job updated successfully' });
      onClose();
      if (onJobUpdated) onJobUpdated();
    } catch (err) {
      console.log(err);
      showToast({ type: 'error', message: 'Failed to update job' });
    }
  };

  if (!open) return null;
  
  if (dropdownsLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading form options...</div>;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Card
        className="relative w-full max-w-2xl md:max-w-3xl py-0 rounded-2xl border border-border/30 shadow-xl bg-gradient-to-br from-background to-muted/60 animate-in fade-in zoom-in-95 focus:outline-none max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent"
      >
        {/* Loading overlay */}
        {isUpdating && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
              <p className="text-foreground font-medium">Updating job...</p>
            </div>
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full z-10 w-12 h-12 flex items-center justify-center text-3xl"
          aria-label="Close"
          disabled={isUpdating}
        >
         <span className="text-4xl leading-none">×</span>
        </button>
        
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-2">Edit Job</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              {/* Job Details Section */}
              <div className="bg-muted/40 rounded-xl p-6 border border-border/10 shadow-sm flex flex-col gap-6">
                <div className="font-semibold text-lg text-primary mb-2 tracking-wide flex items-center gap-2">
                  <Briefcase className="w-5 h-5" /> Job Details
                </div>
                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: "Job title is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. React Developer for E-Commerce App" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  rules={{ required: "Description is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={6}
                          placeholder="Describe the job, responsibilities, and expectations."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Category & Skills on the same line */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="category"
                      rules={{ required: "Category is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <SelectField
                              {...field}
                              options={CATEGORY_OPTIONS}
                              placeholder="Select category"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="skills"
                      rules={{ required: "At least one skill is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skills</FormLabel>
                          <FormControl>
                            <MultiSelectField
                              options={selectedCategory ? SKILL_OPTIONS : []}
                              value={field.value}
                              onChange={field.onChange}
                              placeholder={selectedCategory ? "Select skills..." : "Select a category first"}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {/* Tags full width below */}
                <div>
                <FormField
                  control={form.control}
                    name="tags"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tags</FormLabel>
                      <FormControl>
                          <TagsInput {...field} placeholder="e.g. React, Next.js, API" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
              </div>
              {/* Budget & Terms Section */}
              <div className="bg-muted/40 rounded-xl p-6 border border-border/10 shadow-sm flex flex-col gap-6">
                <div className="font-semibold text-lg text-primary mb-2 tracking-wide flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" /> Budget & Terms
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="duration"
                      rules={{ required: "Duration is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Duration</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 2 weeks, 1 month" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="min_budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Budget</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} placeholder="Minimum budget" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="max_budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Budget</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} placeholder="Maximum budget" {...field} disabled={form.watch('is_fixed')} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="is_fixed"
                    render={({ field }) => (
                      <>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={e => field.onChange(e.target.checked)}
                          className="w-5 h-5 accent-primary"
                          id="is_fixed_checkbox"
                        />
                        <label htmlFor="is_fixed_checkbox" className="text-sm select-none cursor-pointer">Fixed Budget?</label>
                      </>
                    )}
                  />
                </div>
              </div>
              {/* Requirements Section */}
              <div className="bg-muted/40 rounded-xl p-6 border border-border/10 shadow-sm flex flex-col gap-6">
                <div className="font-semibold text-lg text-primary mb-2 tracking-wide flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-700" /> Requirements
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="experience_level"
                      rules={{ required: "Experience level is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Level</FormLabel>
                          <FormControl>
                            <SelectField
                              {...field}
                              options={EXPERIENCE_LEVEL_OPTIONS}
                              placeholder="Select level"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <SelectField
                              {...field}
                              options={STATUS_OPTIONS}
                              placeholder="Select status"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="min_proposal_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Proposals</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              placeholder="Minimum proposals"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="max_proposal_count"
                      rules={{ required: "Max proposals is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Proposals</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              placeholder="Maximum proposals"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full py-3 text-base font-semibold shadow-lg bg-gradient-to-tr from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUpdating}
              >
                Update Job
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
} 