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
import { SelectField, MultiSelectField } from "@/components/ui/select-field";
import { TagsInput } from "@/components/ui/tags-input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast-provider";
import { useForm } from "react-hook-form";
import { Briefcase, DollarSign, TrendingUp } from "lucide-react";
import { useCreateJobMutation, useGetDropdownsQuery } from '@/features/api/jobsApi';

// Define a type for the form values
interface JobFormValues {
  title: string;
  description: string;
  tags: string[];
  category: string;
  skills: string[];
  currency: string;
  is_fixed: boolean;
  duration: string;
  min_budget: string;
  max_budget: string;
  experience_level: string;
  min_proposal_count: number;
  max_proposal_count: number | string;
  status: string;
}

export default function JobCreateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { showToast } = useToast();
  const form = useForm<JobFormValues>({
    defaultValues: {
      title: "",
      description: "",
      tags: [],
      category: "",
      skills: [],
      currency: "USD",
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

  const [createJob, { isLoading }] = useCreateJobMutation();
  const { data: dropdowns, isLoading: dropdownsLoading } = useGetDropdownsQuery();
  const CATEGORY_OPTIONS = dropdowns?.categories?.map(c => ({ value: c.id, label: c.name })) || [];
  const SKILL_OPTIONS = dropdowns?.skills?.map(s => ({ value: s.id, label: s.name })) || [];
  const EXPERIENCE_LEVEL_OPTIONS = dropdowns?.experience_levels?.map(e => ({ value: e.value, label: e.label })) || [];
  const STATUS_OPTIONS = dropdowns?.status?.map(s => ({ value: s.value, label: s.label })) || [];
  const CURRENCY_OPTIONS = dropdowns?.currencies?.map(c => ({ value: c.id, label: c.name })) || [];

  const onSubmit = async (data: JobFormValues) => {
    try {
      const payload = {
        ...data,
        category: Number(data.category), // send as id
        currency: Number(data.currency), // send as id
        tags: data.tags,
        skills: data.skills.map(Number), // send as array of ids
        min_budget: data.min_budget,
        max_budget: data.max_budget,
        is_fixed: data.is_fixed,
        duration: data.duration,
        experience_level: data.experience_level, // already value
        min_proposal_count: Number(data.min_proposal_count),
        max_proposal_count: Number(data.max_proposal_count),
        status: data.status, // already value
      };
      const res = await createJob(payload).unwrap();
      if (!res.success) throw new Error('Failed to post job');
      showToast({ type: 'success', message: 'Job posted successfully' });
      // Optionally reset form or close modal here
    } catch (err) {
      console.log(err);
      showToast({ type: 'error', message: 'Failed to post job' });
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
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full z-10 w-12 h-12 flex items-center justify-center text-3xl"
          aria-label="Close"
        >
         <span className="text-4xl leading-none">×</span>
        </button>
        <div className="p-3 md:p-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold mb-2">Post a New Job</CardTitle>
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
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skills/Tags</FormLabel>
                            <FormControl>
                              <TagsInput {...field} placeholder="e.g. React, Next.js, API" />
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
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skills</FormLabel>
                            <FormControl>
                              <MultiSelectField
                                options={SKILL_OPTIONS}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select skills..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
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
                {/* Budget & Terms Section */}
                <div className="bg-muted/40 rounded-xl p-6 border border-border/10 shadow-sm flex flex-col gap-6">
                  <div className="font-semibold text-lg text-primary mb-2 tracking-wide flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" /> Budget & Terms
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <FormControl>
                              <SelectField
                                {...field}
                                options={CURRENCY_OPTIONS}
                                placeholder="Select currency"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
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
                              <Input type="number" min={0} placeholder="Maximum budget" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-6">
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
                <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                  {isLoading ? 'Posting...' : 'Post Job'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter />
        </div>
      </Card>
    </div>
  );
}
