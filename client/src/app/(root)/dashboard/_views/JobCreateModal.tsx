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
import { useCreateJobMutation, useGetDropdownsQuery } from '@/features/api/jobsApi';
import { EXPERIENCE_LEVEL_OPTIONS } from '@/lib/constants';
import {
  jobCategoryRules,
  jobDescriptionRules,
  jobDurationRules,
  jobExperienceLevelRules,
  jobMaxBudgetRules,
  jobMaxProposalRules,
  jobMinBudgetRules,
  jobMinProposalRules,
  jobSkillsRules,
  jobStatusRules,
  jobTitleRules,
  type JobFormValues,
} from '@/lib/jobFormValidation';
import { Briefcase, DollarSign, TrendingUp } from "lucide-react";
import { useForm } from "react-hook-form";
import type { DropdownCategory, DropdownSkill } from '@/types/job';

export default function JobCreateModal({ open, onClose, onJobPosted }: { open: boolean; onClose: () => void; onJobPosted?: () => void }) {
  const { showToast } = useToast();
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
    mode: "onBlur",
    reValidateMode: "onBlur",
  });
  const [createJob, { isLoading }] = useCreateJobMutation();
  const { data: dropdowns, isLoading: dropdownsLoading } = useGetDropdownsQuery();
  const CATEGORY_OPTIONS = (dropdowns?.categories as DropdownCategory[] | undefined)?.map((c) => ({ value: c.id, label: c.name, skills: c.skills })) || [];

  const selectedCategory = CATEGORY_OPTIONS.find((cat) => String(cat.value) === String(form.watch('category')));
  const SKILL_OPTIONS = selectedCategory?.skills?.map((s: DropdownSkill) => ({ value: s.id, label: s.name })) || [];
  // const API_STATUS_OPTIONS = dropdowns?.status || [];
  const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'open', label: 'Open' },
  ];
  // { value: 'closed', label: 'Closed' },
  // { value: 'in_progress', label: 'In Progress' },
  // { value: 'completed', label: 'Completed' },
  const isFixedBudget = form.watch('is_fixed');

  const onSubmit = async (data: JobFormValues) => {
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
      const res = await createJob(payload).unwrap();
      if (!res.success) throw new Error('Failed to post job');
      showToast({ type: 'success', message: 'Job posted successfully' });
      form.reset({
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
      });
      onClose();
      if (onJobPosted) onJobPosted();
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
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
              <p className="text-foreground font-medium">Posting job...</p>
            </div>
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full z-10 w-12 h-12 flex items-center justify-center text-3xl"
          aria-label="Close"
          disabled={isLoading}
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
                noValidate
              >
                <div className="bg-muted/40 rounded-xl p-6 border border-border/10 shadow-sm flex flex-col gap-6">
                  <div className="font-semibold text-lg text-primary mb-2 tracking-wide flex items-center gap-2">
                    <Briefcase className="w-5 h-5" /> Job Details
                  </div>
                  <FormField
                    control={form.control}
                    name="title"
                    rules={jobTitleRules}
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
                    rules={jobDescriptionRules}
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
                        name="category"
                        rules={jobCategoryRules}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <SelectField
                                options={CATEGORY_OPTIONS}
                                placeholder="Select category"
                                value={field.value}
                                onChange={(value) => {
                                  field.onChange(value);
                                  form.setValue('skills', []);
                                  form.clearErrors('skills');
                                }}
                                onBlur={field.onBlur}
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
                        rules={jobSkillsRules}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skills</FormLabel>
                            <FormControl>
                              <MultiSelectField
                                options={selectedCategory ? SKILL_OPTIONS : []}
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                placeholder={selectedCategory ? "Select skills..." : "Select a category first"}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <TagsInput
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder="e.g. React, Next.js, API"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-muted/40 rounded-xl p-6 border border-border/10 shadow-sm flex flex-col gap-6">
                  <div className="font-semibold text-lg text-primary mb-2 tracking-wide flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" /> Budget & Terms
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="duration"
                        rules={jobDurationRules}
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
                        rules={jobMinBudgetRules}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Min Budget</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                placeholder="Minimum budget"
                                name={field.name}
                                value={field.value}
                                ref={field.ref}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
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
                        name="max_budget"
                        rules={jobMaxBudgetRules}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Budget</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                placeholder="Maximum budget"
                                disabled={isFixedBudget}
                                name={field.name}
                                value={field.value}
                                ref={field.ref}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                              />
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
                            onChange={(e) => {
                              field.onChange(e.target.checked);
                              if (form.formState.touchedFields.max_budget) {
                                void form.trigger('max_budget');
                              }
                            }}
                            onBlur={field.onBlur}
                            className="w-5 h-5 accent-primary"
                            id="is_fixed_checkbox"
                          />
                          <label htmlFor="is_fixed_checkbox" className="text-sm select-none cursor-pointer">Fixed Budget?</label>
                        </>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-muted/40 rounded-xl p-6 border border-border/10 shadow-sm flex flex-col gap-6">
                  <div className="font-semibold text-lg text-primary mb-2 tracking-wide flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-700" /> Requirements
                  </div>
                  <FormField
                    control={form.control}
                    name="experience_level"
                    rules={jobExperienceLevelRules}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Level</FormLabel>
                        <FormControl>
                          <SelectField
                            options={EXPERIENCE_LEVEL_OPTIONS}
                            placeholder="Select level"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
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
                        name="min_proposal_count"
                        rules={jobMinProposalRules}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Min Proposals</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                placeholder="Minimum proposals"
                                name={field.name}
                                value={field.value}
                                ref={field.ref}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
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
                        rules={jobMaxProposalRules}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Proposals</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                placeholder="Maximum proposals"
                                name={field.name}
                                value={field.value}
                                ref={field.ref}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  rules={jobStatusRules}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Save as</FormLabel>
                      <FormControl>
                        <SelectField
                          options={STATUS_OPTIONS}
                          placeholder="Select draft or open"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                  Post Job
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
