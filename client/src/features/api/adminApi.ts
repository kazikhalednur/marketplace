import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

// Types
export interface ApiResponse<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// User types based on API response
export interface AdminUser {
  id: string;
  last_login: string | null;
  is_superuser: boolean;
  username: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
  email: string;
  phone: string | null;
  sub: string | null;
  is_google_login: boolean;
  email_verified: boolean;
  is_resent_email: boolean;
  role: 'client' | 'freelancer' | 'admin';
  groups: number[];
  user_permissions: number[];
  // Additional fields from detail endpoint
  client_profile?: any | null;
  freelancer_profile?: any | null;
  projects?: any[];
  education?: any[];
  experience?: any[];
}

export interface AdminUserDetail extends AdminUser {
  client_profile: any | null;
  freelancer_profile: any | null;
  projects: any[];
  education: any[];
  experience: any[];
}

export interface CreateUserPayload {
  password?: string;
  is_superuser?: boolean;
  username: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
  is_active?: boolean;
  email: string;
  phone?: string | null;
  sub?: string | null;
  is_google_login?: boolean;
  email_verified?: boolean;
  is_resent_email?: boolean;
  role?: 'client' | 'freelancer' | 'admin';
  groups?: number[];
  user_permissions?: number[];
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> {
  password?: string;
}

export interface UsersListParams {
  page?: number;
  page_size?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
}

// Admin Jobs types (from /admin-api/jobs/jobs/)
export interface AdminJob {
  id: string;
  title: string;
  description: string;
  tags: string[];
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
  connect: number;
  privacy: string;
  is_payment_verified: boolean;
  created_at: string;
  updated_at: string;
  category: number;
  created_by: string;
  skills: number[];
}

export interface AdminJobsListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  category?: number;
  skills?: number[];
}

export interface AdminJobPatchPayload {
  title?: string;
  description?: string;
  tags?: string[];
  min_budget?: string;
  max_budget?: string;
  is_fixed?: boolean;
  min_hourly_rate?: string | null;
  max_hourly_rate?: string | null;
  duration?: string;
  experience_level?: string;
  min_proposal_count?: number;
  max_proposal_count?: number;
  status?: string;
  connect?: number;
  privacy?: string;
  is_payment_verified?: boolean;
  category?: number;
  created_by?: string;
  skills?: number[];
}

// --- Admin Biding Proposals types (from /admin-api/biding/proposals/) ---
export type AdminProposalStatus = 'pending' | 'accepted' | 'rejected' | string;

export interface AdminProposal {
  id: string;
  cover_letter: string;
  bid_amount: string;
  used_connects: number;
  status: AdminProposalStatus;
  submitted_at: string;
  freelancer_sub_profile: number;
  job: string;
}

export interface AdminProposalsListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  job?: string;
  freelancer_sub_profile?: number;
}

export interface CreateAdminProposalPayload {
  cover_letter: string;
  bid_amount: string;
  used_connects: number;
  status: AdminProposalStatus;
  freelancer_sub_profile: number;
  job: string;
}

export type UpdateAdminProposalPayload = Partial<CreateAdminProposalPayload>;

// --- Admin Biding Contracts types (from /admin-api/biding/contracts/) ---
export type AdminContractStatus = 'active' | 'completed' | 'pending' | 'cancelled' | string;

export interface AdminContract {
  id: string;
  budget: string;
  start_date: string;
  end_date: string;
  status: AdminContractStatus;
  freelancer_profile: number;
  freelancer_sub_profile: number;
  client_profile: number;
  proposal: string;
  job: string;
}

export interface AdminContractsListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  job?: string;
  proposal?: string;
  client_profile?: number;
  freelancer_profile?: number;
  freelancer_sub_profile?: number;
}

export interface CreateAdminContractPayload {
  budget: string;
  end_date: string;
  status: AdminContractStatus;
  freelancer_profile: number;
  freelancer_sub_profile: number;
  client_profile: number;
  proposal: string;
  job: string;
}

export type UpdateAdminContractPayload = Partial<CreateAdminContractPayload>;

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = Cookies.get('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'AdminUsers',
    'AdminUserDetail',
    'AdminJobs',
    'AdminJobDetail',
    'AdminProposals',
    'AdminProposalDetail',
    'AdminContracts',
    'AdminContractDetail',
  ],
  endpoints: (builder) => ({
    // Get users list with pagination
    getUsers: builder.query<PaginatedResponse<AdminUser>, UsersListParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.page_size) searchParams.append('page_size', params.page_size.toString());
        if (params.search) searchParams.append('search', params.search);
        if (params.role) searchParams.append('role', params.role);
        if (params.is_active !== undefined) searchParams.append('is_active', params.is_active.toString());
        
        const queryString = searchParams.toString();
        return `admin-api/accounts/users/${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: ApiResponse<PaginatedResponse<AdminUser>>) => response.data,
      providesTags: ['AdminUsers'],
    }),
    
    // Get single user detail
    getUserById: builder.query<AdminUserDetail, string>({
      query: (id) => `admin-api/accounts/users/${id}/`,
      transformResponse: (response: ApiResponse<AdminUserDetail>) => response.data,
      providesTags: (result, error, id) => [{ type: 'AdminUserDetail', id }],
    }),
    
    // Create user
    createUser: builder.mutation<AdminUser, CreateUserPayload>({
      query: (body) => ({
        url: 'admin-api/accounts/users/',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<AdminUser>) => response.data,
      invalidatesTags: ['AdminUsers'],
    }),
    
    // Update user (PUT - full update)
    updateUser: builder.mutation<AdminUser, { id: string; data: UpdateUserPayload }>({
      query: ({ id, data }) => ({
        url: `admin-api/accounts/users/${id}/`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<AdminUser>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        'AdminUsers',
        { type: 'AdminUserDetail', id },
      ],
    }),
    
    // Update user (PATCH - partial update)
    patchUser: builder.mutation<AdminUser, { id: string; data: UpdateUserPayload }>({
      query: ({ id, data }) => ({
        url: `admin-api/accounts/users/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: ApiResponse<AdminUser>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        'AdminUsers',
        { type: 'AdminUserDetail', id },
      ],
    }),
    
    // Delete user
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `admin-api/accounts/users/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminUsers'],
    }),

    // --- Admin Jobs ---
    getAdminJobs: builder.query<PaginatedResponse<AdminJob>, AdminJobsListParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.page_size) searchParams.append('page_size', params.page_size.toString());
        if (params.search) searchParams.append('search', params.search);
        if (params.status) searchParams.append('status', params.status);
        if (params.category != null) searchParams.append('category', params.category.toString());
        if (params.skills?.length) params.skills.forEach((s) => searchParams.append('skills', s.toString()));
        const queryString = searchParams.toString();
        return `admin-api/jobs/jobs/${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: ApiResponse<PaginatedResponse<AdminJob>>) => response.data,
      providesTags: ['AdminJobs'],
    }),
    getAdminJobById: builder.query<AdminJob, string>({
      query: (id) => `admin-api/jobs/jobs/${id}/`,
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      providesTags: (result, error, id) => [{ type: 'AdminJobDetail', id }],
    }),
    patchAdminJob: builder.mutation<AdminJob, { id: string; data: AdminJobPatchPayload }>({
      query: ({ id, data }) => ({
        url: `admin-api/jobs/jobs/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      invalidatesTags: (result, error, { id }) => ['AdminJobs', { type: 'AdminJobDetail', id }],
    }),
    deleteAdminJob: builder.mutation<void, string>({
      query: (id) => ({
        url: `admin-api/jobs/jobs/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminJobs'],
    }),

    // --- Admin Biding Proposals ---
    getAdminProposals: builder.query<PaginatedResponse<AdminProposal>, AdminProposalsListParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.page_size) searchParams.append('page_size', params.page_size.toString());
        if (params.search) searchParams.append('search', params.search);
        if (params.status) searchParams.append('status', params.status);
        if (params.job) searchParams.append('job', params.job);
        if (params.freelancer_sub_profile != null) {
          searchParams.append('freelancer_sub_profile', params.freelancer_sub_profile.toString());
        }
        const queryString = searchParams.toString();
        return `admin-api/biding/proposals/${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: ApiResponse<PaginatedResponse<AdminProposal>>) => response.data,
      providesTags: ['AdminProposals'],
    }),
    getAdminProposalById: builder.query<AdminProposal, string>({
      query: (id) => `admin-api/biding/proposals/${id}/`,
      transformResponse: (response: ApiResponse<AdminProposal>) => response.data,
      providesTags: (result, error, id) => [{ type: 'AdminProposalDetail', id }],
    }),
    createAdminProposal: builder.mutation<AdminProposal, CreateAdminProposalPayload>({
      query: (body) => ({
        url: 'admin-api/biding/proposals/',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<AdminProposal>) => response.data,
      invalidatesTags: ['AdminProposals'],
    }),
    updateAdminProposal: builder.mutation<AdminProposal, { id: string; data: CreateAdminProposalPayload }>({
      query: ({ id, data }) => ({
        url: `admin-api/biding/proposals/${id}/`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<AdminProposal>) => response.data,
      invalidatesTags: (result, error, { id }) => ['AdminProposals', { type: 'AdminProposalDetail', id }],
    }),
    patchAdminProposal: builder.mutation<AdminProposal, { id: string; data: UpdateAdminProposalPayload }>({
      query: ({ id, data }) => ({
        url: `admin-api/biding/proposals/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: ApiResponse<AdminProposal>) => response.data,
      invalidatesTags: (result, error, { id }) => ['AdminProposals', { type: 'AdminProposalDetail', id }],
    }),
    deleteAdminProposal: builder.mutation<void, string>({
      query: (id) => ({
        url: `admin-api/biding/proposals/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminProposals'],
    }),

    // --- Admin Biding Contracts ---
    getAdminContracts: builder.query<PaginatedResponse<AdminContract>, AdminContractsListParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.page_size) searchParams.append('page_size', params.page_size.toString());
        if (params.search) searchParams.append('search', params.search);
        if (params.status) searchParams.append('status', params.status);
        if (params.job) searchParams.append('job', params.job);
        if (params.proposal) searchParams.append('proposal', params.proposal);
        if (params.client_profile != null) searchParams.append('client_profile', params.client_profile.toString());
        if (params.freelancer_profile != null) searchParams.append('freelancer_profile', params.freelancer_profile.toString());
        if (params.freelancer_sub_profile != null) {
          searchParams.append('freelancer_sub_profile', params.freelancer_sub_profile.toString());
        }
        const queryString = searchParams.toString();
        return `admin-api/biding/contracts/${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: ApiResponse<PaginatedResponse<AdminContract>>) => response.data,
      providesTags: ['AdminContracts'],
    }),
    getAdminContractById: builder.query<AdminContract, string>({
      query: (id) => `admin-api/biding/contracts/${id}/`,
      transformResponse: (response: ApiResponse<AdminContract>) => response.data,
      providesTags: (result, error, id) => [{ type: 'AdminContractDetail', id }],
    }),
    createAdminContract: builder.mutation<AdminContract, CreateAdminContractPayload>({
      query: (body) => ({
        url: 'admin-api/biding/contracts/',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<AdminContract>) => response.data,
      invalidatesTags: ['AdminContracts'],
    }),
    updateAdminContract: builder.mutation<AdminContract, { id: string; data: CreateAdminContractPayload }>({
      query: ({ id, data }) => ({
        url: `admin-api/biding/contracts/${id}/`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<AdminContract>) => response.data,
      invalidatesTags: (result, error, { id }) => ['AdminContracts', { type: 'AdminContractDetail', id }],
    }),
    patchAdminContract: builder.mutation<AdminContract, { id: string; data: UpdateAdminContractPayload }>({
      query: ({ id, data }) => ({
        url: `admin-api/biding/contracts/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: ApiResponse<AdminContract>) => response.data,
      invalidatesTags: (result, error, { id }) => ['AdminContracts', { type: 'AdminContractDetail', id }],
    }),
    deleteAdminContract: builder.mutation<void, string>({
      query: (id) => ({
        url: `admin-api/biding/contracts/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminContracts'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  usePatchUserMutation,
  useDeleteUserMutation,
  useGetAdminJobsQuery,
  useGetAdminJobByIdQuery,
  usePatchAdminJobMutation,
  useDeleteAdminJobMutation,
  useGetAdminProposalsQuery,
  useGetAdminProposalByIdQuery,
  useCreateAdminProposalMutation,
  useUpdateAdminProposalMutation,
  usePatchAdminProposalMutation,
  useDeleteAdminProposalMutation,
  useGetAdminContractsQuery,
  useGetAdminContractByIdQuery,
  useCreateAdminContractMutation,
  useUpdateAdminContractMutation,
  usePatchAdminContractMutation,
  useDeleteAdminContractMutation,
} = adminApi;
