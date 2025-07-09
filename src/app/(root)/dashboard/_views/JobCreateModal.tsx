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
import { SelectField } from "@/components/ui/select-field";
import { TagsInput } from "@/components/ui/tags-input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast-provider";
import { useForm } from "react-hook-form";

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
  experience_level: string;
  min_proposal_count: number;
  max_proposal_count: number | string;
  status: string;
}

// Placeholder data for categories and skills (replace with API fetch)
const CATEGORY_OPTIONS = [
  "Web Development",
  "Mobile App",
  "Design",
  "Writing",
];
// const SKILL_OPTIONS = [
//   "React",
//   "Next.js",
//   "Django",
//   "Figma",
// ];

const EXPERIENCE_LEVEL_OPTIONS = [
  "entry",
  "intermediate",
  "expert",
];

const STATUS_OPTIONS = [
  "draft",
  "open",
  "closed",
  "in_progress",
  "completed",
];

const CURRENCY_OPTIONS = ["USD", "EUR", "BDT"];

export default function JobCreateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { showToast } = useToast();
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      tags: [],
      category: "",
      skills: [],
      currency: "USD",
      is_fixed: false,
      duration: "",
      experience_level: "",
      min_proposal_count: 1,
      max_proposal_count: "",
      status: "draft",
    },
  });

  const onSubmit = async (_data: JobFormValues) => {
    try {
      // Send to API here
      console.log(_data);
      showToast({ type: "success", message: "Job posted successfully" });
    } catch (err) {
        console.log(err);
      showToast({ type: "error", message: "Failed to post job" });
    }
  };

  if (!open) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Card
        className="relative w-full max-w-3xl md:max-w-4xl p-0 rounded-2xl shadow-2xl bg-background animate-in fade-in zoom-in-95 focus:outline-none max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full z-10 w-12 h-12 flex items-center justify-center text-3xl"
          aria-label="Close"
        >
         <span className="text-4xl leading-none">×</span>
        </button>
        <div className="p-6 md:p-10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Post a New Job</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills</FormLabel>
                        <FormControl>
                          <TagsInput
                            {...field}
                            placeholder="e.g. React, Next.js, Django"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {/* Fixed Budget checkbox after budget fields, single line */}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <Button type="submit" className="w-full">
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
