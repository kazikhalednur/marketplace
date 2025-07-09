import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { JobDetail } from '@/app/(root)/dashboard/_views/JobList';

// Define types for API response and job
interface JobApiCategory {
  name: string;
  slug: string;
}

interface JobApiSkill {
  name: string;
  slug: string;
}

interface JobApiCreator {
  full_name: string;
  is_payment_verified: boolean | null;
  date_joined: string;
}

interface JobApi {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: JobApiCategory;
  skills: JobApiSkill[];
  currency: string;
  is_fixed: boolean;
  min_budget: string;
  max_budget: string;
  min_hourly_rate: string | null;
  max_hourly_rate: string | null;
  duration: string;
  experience_level: string;
  min_proposal_count: number;
  max_proposal_count: number;
  status: string;
  created_by: JobApiCreator;
  created_at: string;
}

interface JobsApiResponse {
  data: JobApi[];
}

export const jobsApi = createApi({
  reducerPath: 'jobsApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL }), // Use relative base URL for proxy or absolute if needed
  endpoints: (builder) => ({
    getJobs: builder.query<JobDetail[], void>({
      query: () => '/jobs/',
      transformResponse: (response: JobsApiResponse) => {
        if (response && Array.isArray(response.data)) {
          return response.data.map((job: JobApi) => ({
            id: job.id,
            title: job.title,
            description: job.description,
            tags: job.tags,
            category: job.category,
            skills: job.skills,
            currency: job.currency,
            is_fixed: job.is_fixed,
            min_budget: job.min_budget,
            max_budget: job.max_budget,
            min_hourly_rate: job.min_hourly_rate,
            max_hourly_rate: job.max_hourly_rate,
            duration: job.duration,
            experience_level: job.experience_level,
            min_proposal_count: job.min_proposal_count,
            max_proposal_count: job.max_proposal_count,
            status: job.status,
            created_by: job.created_by,
            created_at: job.created_at,
          }));
        }
        return [];
      }
    }),
  }),
});

export const { useGetJobsQuery } = jobsApi; 