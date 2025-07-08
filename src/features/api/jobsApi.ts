import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { JobDetail } from '@/app/(root)/dashboard/_views/JobDetailModal';

export const jobsApi = createApi({
  reducerPath: 'jobsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }), // Replace with real API base URL
  endpoints: (builder) => ({
    getJobs: builder.query<JobDetail[], { search?: string; tags?: string[] }>(
      {
        query: () => {
          // For real API: return { url: '/jobs', params: { search, tags } }
          return '/jobs'; // Dummy endpoint
        },
      }
    ),
  }),
});

export const { useGetJobsQuery } = jobsApi; 