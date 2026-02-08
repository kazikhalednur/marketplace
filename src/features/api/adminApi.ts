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

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://cpchub.diu.edu.bd:8443',
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = Cookies.get('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['AdminUsers', 'AdminUserDetail', 'AdminJobs', 'AdminJobDetail'],
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
} = adminApi;
