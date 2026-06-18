import type { JobDetail } from '@/types/job';
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
  is_applied?: boolean;
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
  is_payment_verified?: boolean;
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

interface SingleJobApiResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: JobApi;
}

function mapJobApiToDetail(job: JobApi): JobDetail {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    tags: job.tags,
    category: job.category,
    skills: job.skills,
    currency: undefined,
    is_fixed: job.is_fixed,
    min_budget: job.min_budget,
    max_budget: job.max_budget,
    duration: job.duration,
    experience_level: job.experience_level,
    min_proposal_count: job.min_proposal_count,
    max_proposal_count: job.max_proposal_count,
    status: job.status,
    created_by: job.created_by,
    created_at: job.created_at,
    is_applied: job.is_applied ?? false,
    is_payment_verified: job.is_payment_verified,
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

// Types for Bids API
export interface BidAttachment {
  id: string;
  file: string;
}

export interface BidFreelancerProfile {
  id: number;
  hours_per_week: number;
  is_more_available: boolean;
  hour_rate: string;
  bio: string;
  linkedin: string;
  twitter: string;
  github: string;
  portfolio: string;
  projects: Array<{
    id: number;
    title: string;
    link: string;
    description: string;
  }>;
  experiences: Array<{
    id: number;
    job_title: string;
    company_name: string;
    start_date: string;
    end_date: string;
    is_present: boolean;
    description: string;
  }>;
  educations: Array<{
    id: number;
    institution_name: string;
    degree: string;
    start_date: string;
    end_date: string;
  }>;
}

export interface Bid {
  id: string;
  freelancer_profile: BidFreelancerProfile;
  cover_letter: string;
  attachments: BidAttachment[];
  bid_amount: string;
  status: string;
  submitted_at: string;
}

export interface PaginatedBidsResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: Bid[];
  };
}

export interface FreelancerBid {
  id: string;
  job: string;
  job_link: string;
  cover_letter: string;
  bid_amount: string;
  status: string;
  submitted_at: string;
  uploaded_attachments: BidAttachment[];
}

export interface PaginatedFreelancerBidsResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: FreelancerBid[];
  };
}

export const jobsApi = createApi({
  reducerPath: 'jobsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
      const token = Cookies.get('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include' 
  }),
  tagTypes: ['Jobs', 'MyJobs', 'DashboardJobs', 'JobDetail', 'Bids'],
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
        
        const url = `/jobs/?${params.toString()}`;
        console.log('API call URL:', url, { page, pageSize, status, search, tags, min_budget, max_budget, skills, category });
        return url;
      },
      transformResponse: (response: PaginatedJobsApiResponse) => {
        if (response?.data && Array.isArray(response.data.results)) {
          const jobs = response.data.results.map(mapJobApiToDetail);
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
      providesTags: ['Jobs']
    }),
    getJobById: builder.query<JobDetail, string>({
      query: (id) => `/jobs/${id}/`,
      transformResponse: (response: SingleJobApiResponse) => mapJobApiToDetail(response.data),
      providesTags: (_result, _error, id) => [{ type: 'JobDetail', id }],
    }),
    getDropdowns: builder.query<JobsDropdownsResponse['data'], void>({
      query: () => '/jobs/dropdown/',
      transformResponse: (response: JobsDropdownsResponse) => response.data,
      providesTags: ['Jobs']
    }),
    createJob: builder.mutation<CreateJobResponse, CreateJobRequest>({
      query: (body) => ({
        url: '/jobs/create/',
        method: 'POST',
        body,
        credentials: 'include',
      }),
      // Invalidate all job-related queries after creating a job
      invalidatesTags: ['Jobs', 'MyJobs', 'DashboardJobs'],
    }),
    updateJob: builder.mutation<CreateJobResponse, UpdateJobRequest>({
      query: ({ id, ...body }) => ({
        url: `/jobs/my-jobs/${id}/`,
        method: 'PATCH',
        body,
        credentials: 'include',
      }),
      // Invalidate all job-related queries after updating a job
      invalidatesTags: ['Jobs', 'MyJobs', 'DashboardJobs', 'JobDetail'],
    }),
    deleteJob: builder.mutation<CreateJobResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/jobs/my-jobs/${id}/`,
        method: 'DELETE',
        credentials: 'include',
      }),
      // Invalidate all job-related queries after deleting a job
      invalidatesTags: ['Jobs', 'MyJobs', 'DashboardJobs', 'JobDetail'],
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
          const jobs = response.data.results.map(mapJobApiToDetail);
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
      providesTags: ['MyJobs']
    }),
    getAcceptedDomains: builder.query<AcceptedDomainResponse, void>({
      query: () => '/accounts/accepted-domain/',
      providesTags: ['Jobs']
    }),
    applyToJob: builder.mutation<unknown, FormData>({
      query: (formData) => ({
        url: '/biding/proposals/',
        method: 'POST',
        body: formData,
        // Do NOT set headers: { 'Content-Type': ... }
      }),
      invalidatesTags: ['Jobs', 'Bids']
    }),

    // Get bids for a job (client role)
    getBidsForJob: builder.query<PaginatedBidsResponse['data'], { job_id: string; page?: number; pageSize?: number; status?: string }>({
      query: ({ job_id, page = 1, pageSize = 10, status }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('page_size', pageSize.toString());
        if (status && status !== 'all') {
          params.append('status', status);
        }
        return `/biding/client/proposals/${job_id}/?${params.toString()}`;
      },
      transformResponse: (response: PaginatedBidsResponse) => response.data,
      providesTags: ['Bids']
    }),

    // Update proposal status (client role)
    updateProposalStatus: builder.mutation<
      {
        success: boolean;
        status_code: number;
        message: string;
        data: Bid;
      },
      { proposal_id: string; status: string }
    >({
      query: ({ proposal_id, status }) => ({
        url: `/biding/client/proposals/update/${proposal_id}/`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Bids']
    }),

    getMyBids: builder.query<
      PaginatedFreelancerBidsResponse['data'],
      { page?: number; pageSize?: number }
    >({
      query: ({ page = 1, pageSize = 10 }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('page_size', pageSize.toString());
        return `/biding/proposals/?${params.toString()}`;
      },
      transformResponse: (response: PaginatedFreelancerBidsResponse) => response.data,
      providesTags: ['Bids'],
    }),

    deleteMyBid: builder.mutation<
      { success: boolean; status_code: number; message: string },
      string
    >({
      query: (id) => ({
        url: `/biding/proposals/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Bids'],
    }),
  }),
});

export const { 
  useGetJobsQuery,
  useGetJobByIdQuery,
  useCreateJobMutation, 
  useUpdateJobMutation, 
  useDeleteJobMutation, 
  useGetDropdownsQuery, 
  useGetMyJobsQuery,
  useGetAcceptedDomainsQuery,
  useApplyToJobMutation,
  useGetBidsForJobQuery,
  useUpdateProposalStatusMutation,
  useGetMyBidsQuery,
  useDeleteMyBidMutation,
} = jobsApi; 