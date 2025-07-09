import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { JobDetail } from '@/app/(root)/dashboard/_views/JobDetailModal';

// Define types for API response and job
interface JobApi {
  id: string | number;
  title: string;
  description: string;
  tags?: string[];
  category?: { name: string };
  currency?: string;
  min_budget?: number | string;
  max_budget?: number | string;
  duration?: string;
  experience_level?: string;
  status?: string;
  posted?: string;
  employer?: string;
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
        // Map API response to JobDetail[]
        if (response && Array.isArray(response.data)) {
          return response.data.map((job: JobApi) => ({
            id: Number(job.id),
            title: job.title,
            description: job.description,
            tags: job.tags || [],
            category: job.category?.name || '',
            currency: job.currency || '',
            min_budget: Number(job.min_budget) || 0,
            max_budget: Number(job.max_budget) || 0,
            duration: job.duration || '',
            experience_level: job.experience_level || '',
            status: job.status || '',
            posted: job.posted || '', // You may want to format this if available
            employer: job.employer || '', // You may want to map this if available
          }));
        }
        return [];
      },
    }),
  }),
});

export const { useGetJobsQuery } = jobsApi; 