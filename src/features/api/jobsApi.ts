import type { JobDetail } from '@/app/(root)/dashboard/_views/JobList';
import { normalizeTag } from '@/utils/tags';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
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
    getJobs: builder.query<{ jobs: JobDetail[]; count: number; next: string | null; previous: string | null }, { 
      page?: number; 
      pageSize?: number;
      status?: string;
      search?: string;
      tags?: string[];
      min_budget?: string;
      max_budget?: string;
      skills?: string[];
      category?: string;
    }>({
      query: ({ 
        page = 1, 
        pageSize = 10, 
        status, 
        search, 
        tags, 
        min_budget, 
        max_budget, 
        skills, 
        category 
      }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('page_size', pageSize.toString());
        
        if (status) params.append('status', status);
        if (search) params.append('search', search);
        if (tags && tags.length > 0) {
          const normalizedTags = tags.map(normalizeTag);
          params.append('tags', normalizedTags.join(','));
        }
        if (min_budget) params.append('min_budget', min_budget);
        if (max_budget) params.append('max_budget', max_budget);
        if (skills && skills.length > 0) params.append('skills', skills.join(','));
        if (category) params.append('category', category);
        
        return `/jobs/?${params.toString()}`;
      },
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
    getMyJobs: builder.query<{ jobs: JobDetail[]; count: number; next: string | null; previous: string | null }, { 
      page?: number; 
      pageSize?: number;
      status?: string;
      search?: string;
      tags?: string[];
      min_budget?: string;
      max_budget?: string;
      skills?: string[];
      category?: string;
    }>({
      query: ({ 
        page = 1, 
        pageSize = 10, 
        status, 
        search, 
        tags, 
        min_budget, 
        max_budget, 
        skills, 
        category 
      }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('page_size', pageSize.toString());
        
        if (status) params.append('status', status);
        if (search) params.append('search', search);
        if (tags && tags.length > 0) {
          const normalizedTags = tags.map(normalizeTag);
          params.append('tags', normalizedTags.join(','));
        }
        if (min_budget) params.append('min_budget', min_budget);
        if (max_budget) params.append('max_budget', max_budget);
        if (skills && skills.length > 0) params.append('skills', skills.join(','));
        if (category) params.append('category', category);
        
        return `/jobs/my-jobs/?${params.toString()}`;
      },
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