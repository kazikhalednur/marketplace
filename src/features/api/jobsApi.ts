import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { JobDetail } from '@/app/(root)/dashboard/_views/JobList';
import Cookies from 'js-cookie';

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
  min_budget: string;
  max_budget: string;
  is_fixed: boolean;
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

interface PaginatedJobsApiResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: JobApi[];
  };
}

interface JobsDropdownsResponse {
  data: {
    categories: { id: number; name: string; slug: string }[];
    skills: { id: number; name: string; slug: string }[];
    currencies: { id: number; name: string; symbol: string | null }[];
    status: { label: string; value: string }[];
    experience_levels: { label: string; value: string }[];
  };
}

interface CreateJobRequest {
  title: string;
  description: string;
  tags: string[];
  category: number;
  skills: number[];
  currency?: number;
  is_fixed: boolean;
  duration: string;
  min_budget: string;
  max_budget: string;
  experience_level: string;
  min_proposal_count: number;
  max_proposal_count: number;
  status: string;
}

interface UpdateJobRequest extends CreateJobRequest {
  id: string;
}

interface CreateJobResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

interface AcceptedDomainResponse {
  success: boolean;
  status_code: number;
  message: string;
  data?: {
    domains?: string[];
  };
}

export const jobsApi = createApi({
  reducerPath: 'jobsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || '',
    prepareHeaders: (headers) => {
      const token = Cookies.get('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include' 
  }),
  endpoints: (builder) => ({
    getJobs: builder.query<{ jobs: JobDetail[]; count: number; next: string | null; previous: string | null }, { page?: number; pageSize?: number }>({
      query: ({ page = 1, pageSize = 10 }) => `/jobs/?page=${page}&page_size=${pageSize}`,
      transformResponse: (response: PaginatedJobsApiResponse) => {
        if (response?.data && Array.isArray(response.data.results)) {
          const jobs = response.data.results.map((job: JobApi) => ({
            id: job.id,
            title: job.title,
            description: job.description,
            tags: job.tags,
            category: job.category,
            skills: job.skills,
            currency: undefined, // Not provided in API response
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
          return {
            jobs,
            count: response.data.count,
            next: response.data.next,
            previous: response.data.previous,
          };
        }
        return {
          jobs: [],
          count: 0,
          next: null,
          previous: null,
        };
      }
    }),
    getDropdowns: builder.query<JobsDropdownsResponse['data'], void>({
      query: () => '/jobs/dropdown/',
      transformResponse: (response: JobsDropdownsResponse) => response.data,
    }),
    createJob: builder.mutation<CreateJobResponse, CreateJobRequest>({
      query: (body) => ({
        url: '/jobs/create/',
        method: 'POST',
        body,
        credentials: 'include',
      }),
    }),
    updateJob: builder.mutation<CreateJobResponse, UpdateJobRequest>({
      query: ({ id, ...body }) => ({
        url: `/jobs/my-jobs/${id}/`,
        method: 'PATCH',
        body,
        credentials: 'include',
      }),
    }),
    deleteJob: builder.mutation<CreateJobResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/jobs/my-jobs/${id}/`,
        method: 'DELETE',
        credentials: 'include',
      }),
    }),
    getMyJobs: builder.query<{ jobs: JobDetail[]; count: number; next: string | null; previous: string | null }, { page?: number; pageSize?: number }>({
      query: ({ page = 1, pageSize = 10 }) => `/jobs/my-jobs/?page=${page}&page_size=${pageSize}`,
      transformResponse: (response: PaginatedJobsApiResponse) => {
        if (response?.data && Array.isArray(response.data.results)) {
          const jobs = response.data.results.map((job: JobApi) => ({
            id: job.id,
            title: job.title,
            description: job.description,
            tags: job.tags,
            category: job.category,
            skills: job.skills,
            currency: undefined, // Not provided in API response
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
          return {
            jobs,
            count: response.data.count,
            next: response.data.next,
            previous: response.data.previous,
          };
        }
        return {
          jobs: [],
          count: 0,
          next: null,
          previous: null,
        };
      },
    }),
    getAcceptedDomains: builder.query<AcceptedDomainResponse, void>({
      query: () => '/accounts/accepted-domain/',
    }),
  }),
});

export const { 
  useGetJobsQuery, 
  useCreateJobMutation, 
  useUpdateJobMutation, 
  useDeleteJobMutation, 
  useGetDropdownsQuery, 
  useGetMyJobsQuery,
  useGetAcceptedDomainsQuery
} = jobsApi; 