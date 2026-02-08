import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

// Types
export interface SignupResponse {
  success: boolean;
  status_code: number;
  message: string;
}

export interface EmployerSignupPayload {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  company_name: string;
}

export interface StudentSignupPayload extends EmployerSignupPayload {
  student_id: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  success: boolean;
  status_code: number;
  message: string;
  data?: {
    access?: string;
    refresh?: string;
    role?: string;
  };
  error?: {
    detail?: string;
    [key: string]: unknown;
  };
}

// Conversation Types
export interface Conversation {
  id: number;
  conversation_id: string;
  status: string;
  created_at: string;
  contract_title: string;
  freelancer_name: string;
  client_name: string;
  last_message: string | null;
  unread_count: number;
}

export interface ConversationsResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: Conversation[];
}

// Contract Types
export interface Contract {
  id: string;
  job_title: string;
  job_description: string;
  freelancer_profile: {
    full_name: string;
  };
  start_date: string;
  end_date: string;
  is_fixed: boolean;
  budget: string;
  status: string;
}

// Contract Detail Types (for individual contract details)
export interface ContractDetail {
  id: string;
  job: {
    id: string;
    title: string;
    description: string;
    job_link: string;
  };
  freelancer_profile: {
    username: string;
    avatar: string;
    full_name: string;
  };
  status: string;
  start_date: string;
  end_date: string;
  budget: string;
}

export interface ContractDetailResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: ContractDetail;
}

// Milestone Types
export interface Milestone {
  id: string;
  step_number: number;
  title: string;
  description: string;
  amount: string;
  start_date: string;
  due_date: string;
  status: string;
}

export interface MilestonesResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: Milestone[];
  };
}

// Freelancer contract list (different, slimmer shape)
export interface FreelancerContractListItem {
  id: string;
  job_title: string;
  status: string;
  start_date: string;
  end_date: string;
}

export interface FreelancerContractsResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: FreelancerContractListItem[];
  };
}

// Freelancer contract detail (client_profile instead of freelancer_profile)
export interface FreelancerContractDetail {
  id: string;
  job: {
    id: string;
    title: string;
    job_link: string;
  };
  client_profile: {
    username: string;
    avatar: string;
    first_name: string;
    last_name: string;
  };
  budget: string;
  status: string;
  start_date: string;
  end_date: string;
}

export interface FreelancerContractDetailResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: FreelancerContractDetail;
}

// Freelancer milestones list returns an array directly in data
export interface FreelancerMilestoneSubmissionItem {
  id: string;
  message?: string;
  code_zip: string;
  status?: string;
}

export interface FreelancerMilestone extends Omit<Milestone, 'start_date' | 'due_date'> {
  start_date: string | null;
  due_date: string | null;
  submissions?: FreelancerMilestoneSubmissionItem[];
}

export interface FreelancerMilestonesResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: FreelancerMilestone[];
}

export interface FreelancerMilestoneDetailResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: FreelancerMilestone;
}

// Client milestone detail (same shape but accessible via client endpoint)
export interface ClientMilestoneDetailResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: FreelancerMilestone;
}

export interface MilestoneSubmissionResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    code_zip: string;
  };
}

export interface UpdateSubmissionStatusPayload {
  status: string;
}

export interface UpdateSubmissionStatusResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    status: string;
  };
}

export interface CreateMilestonePayload {
  title: string;
  description: string;
  amount: string;
  start_date: string;
  due_date: string;
}

export interface CreateMilestoneResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: Milestone;
}

  // Update milestone (client)
  export interface UpdateClientMilestonePayload {
    title?: string;
    description?: string;
    amount?: string;
    start_date?: string;
    due_date?: string;
    status?: string;
  }

  export interface UpdateClientMilestoneResponse {
    success: boolean;
    status_code: number;
    message: string;
    data: Milestone;
  }

export interface ContractsResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: Contract[];
  };
}

export interface FreelancerProject {
  id: number | null;
  title: string;
  link: string;
  description: string;
}

export interface FreelancerExperience {
  id: number | null;
  job_title: string;
  company_name: string;
  start_date: string;
  end_date: string | null;
  is_present: boolean;
  description: string;
}

export interface FreelancerEducation {
  id: number | null;
  institution_name: string;
  degree: string;
  start_date: string;
  end_date: string | null;
}

export interface FreelancerSubProfile {
  id: number | null;
  hours_per_week: number;
  is_more_available: boolean;
  hour_rate: string;
  bio: string;
  linkedin: string;
  github: string;
  portfolio: string;
  skills: number[];
  projects: FreelancerProject[];
  experiences: FreelancerExperience[];
  educations: FreelancerEducation[];
}

export interface UserInfo {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  phone: string;
  role: string;
  email_verified: boolean;
  is_google_login: boolean;
  student_id: string;
  avatar?: string;
  freelancer_sub_profiles: FreelancerSubProfile[];
  // Additional fields for profile display
  bio?: string;
  skills?: string[];
  company_name?: string;
  linkedin?: string;
  twitter?: string;
  about?: string;
  is_payment_verified?: boolean;
  is_phone_verified?: boolean;
  notification_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Profile response type
export interface ProfileResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: UserInfo;
}

// Profile update types
export interface ProfileUpdateResponse {
  success: boolean;
  status_code: number;
  message: string;
}

// Image upload types
export interface ImageUploadResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    id: string;
    image: string;
  };
}

export interface ClientProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
  username?: string;
  phone?: string;
  company_name?: string;
  twitter?: string;
  linkedin?: string;
  bio?: string;
  avatar?: string | null;
}

export interface FreelancerProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
  username?: string;
  phone?: string;
  avatar?: string | null;
  freelancer_sub_profiles?: FreelancerSubProfile[];
}

export const apiSlice = createApi({
  reducerPath: 'api',
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
  tagTypes: ['Me', 'ClientMe', 'Conversations', 'Profile', 'Contracts', 'Milestones'],
  endpoints: (builder) => ({
    studentSignup: builder.mutation<SignupResponse, StudentSignupPayload>({
      query: (body) => ({
        url: 'accounts/signup/',
        method: 'POST',
        body,
      }),
    }),
    employerSignup: builder.mutation<SignupResponse, EmployerSignupPayload>({
      query: (body) => ({
        url: 'accounts/clients/signup/',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation<LoginResponse, LoginPayload>({
      query: (body) => ({
        url: 'accounts/signin/',
        method: 'POST',
        body,
      }),
    }),
    getMe: builder.query<UserInfo, void>({
      query: () => 'accounts/info/',
      transformResponse: (response: { data: UserInfo }) => response.data,
      providesTags: ['Me'],
    }),
    getClientMe: builder.query<UserInfo, void>({
      query: () => 'accounts/clients/info/',
      transformResponse: (response: { data: UserInfo }) => response.data,
      providesTags: ['ClientMe'],
    }),
    // Profile endpoint that returns different structures based on user role
    getProfileByUsername: builder.query<UserInfo, string>({
      query: (username) => `accounts/info/${username}/`,
      transformResponse: (response: ProfileResponse) => response.data,
      providesTags: (result, error, username) => [
        { type: 'Profile', id: username },
        // Also provide a general Profile tag that can be invalidated by profile updates
        'Profile'
      ],
      // Force refetch when cache is invalidated
      keepUnusedDataFor: 0,
    }),
    verifyEmail: builder.query<
      {
        success: boolean;
        status_code: number;
        message: string;
        data: { is_success: boolean; is_expired: boolean; is_invalid: boolean };
      },
      { uid: string; token: string }
    >({
      query: ({ uid, token }) => `accounts/verify/email/${uid}/${token}/`,
    }),
    resendVerificationEmail: builder.query<
      {
        success: boolean;
        status_code: number;
        message: string;
      },
      { uid: string; token: string }
    >({
      query: ({ uid, token }) => `accounts/resend/email/${uid}/${token}/`,
    }),
    sendPasswordResetMail: builder.mutation<
      {
        success: boolean;
        status_code: number;
        message: string;
      },
      { email: string }
    >({
      query: (body) => ({
        url: 'accounts/password-reset-mail/',
        method: 'POST',
        body,
      }),
    }),
    verifyOtp: builder.mutation<
      {
        success: boolean;
        status_code: number;
        message: string;
      },
      { email: string; code: string }
    >({
      query: (body) => ({
        url: 'accounts/otp-verify/',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<
      {
        success: boolean;
        status_code: number;
        message: string;
      },
      { email: string; code: string; new_password: string; confirm_password: string }
    >({
      query: (body) => ({
        url: 'accounts/password-reset/',
        method: 'POST',
        body,
      }),
    }),
    updateProfile: builder.mutation<ProfileUpdateResponse, FreelancerProfileUpdatePayload>({
      query: (body) => ({
        url: 'accounts/info/',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [
        'Me',
        // Invalidate all Profile tags to ensure profile pages update immediately
        'Profile'
      ],
    }),
    updateClientProfile: builder.mutation<ProfileUpdateResponse, ClientProfileUpdatePayload>({
      query: (body) => ({
        url: 'accounts/clients/info/',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['ClientMe', 'Profile'],
    }),
    uploadImage: builder.mutation<ImageUploadResponse, FormData>({
      query: (body) => ({
        url: 'images/upload/',
        method: 'POST',
        body,
      }),
    }),
    getConversations: builder.query<ConversationsResponse, void>({
      query: () => 'chat/conversations/',
      transformResponse: (response: ConversationsResponse) => response,
      providesTags: ['Conversations'],
    }),
    getContracts: builder.query<ContractsResponse, { page?: number; page_size?: number } | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params && params.page) searchParams.append('page', params.page.toString());
        if (params && params.page_size) searchParams.append('page_size', params.page_size.toString());
        
        const queryString = searchParams.toString();
        return `biding/client/contracts/${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: ContractsResponse) => response,
      providesTags: ['Contracts'],
    }),
    getContractById: builder.query<ContractDetailResponse, string>({
      query: (id) => `biding/client/contracts/${id}/`,
      transformResponse: (response: ContractDetailResponse) => response,
      providesTags: (result, error, id) => [{ type: 'Contracts', id }],
    }),
    getMilestones: builder.query<
      MilestonesResponse,
      { contractId: string; page?: number; page_size?: number }
    >({
      query: ({ contractId, page, page_size }) => {
        const searchParams = new URLSearchParams();
        if (page) searchParams.append('page', page.toString());
        if (page_size) searchParams.append('page_size', page_size.toString());
        const queryString = searchParams.toString();
        return `work-diary/client/milestones/${contractId}/steps/${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: MilestonesResponse) => response,
      providesTags: (result, error, { contractId }) => [{ type: 'Milestones', id: contractId }],
    }),
    createMilestone: builder.mutation<CreateMilestoneResponse, { contractId: string; payload: CreateMilestonePayload }>({
      query: ({ contractId, payload }) => ({
        url: `work-diary/client/milestones/${contractId}/steps/`,
        method: 'POST',
        body: payload,
      }),
      transformResponse: (response: CreateMilestoneResponse) => response,
      invalidatesTags: (result, error, { contractId }) => [{ type: 'Milestones', id: contractId }],
    }),

    // (removed) client milestone detail - use list data instead

    // Client: update milestone (edit fields or change status)
    updateClientMilestone: builder.mutation<UpdateClientMilestoneResponse, { contractId: string; stepId: string; payload: UpdateClientMilestonePayload }>(
      {
        query: ({ contractId, stepId, payload }) => ({
          url: `work-diary/client/milestones/${contractId}/steps/${stepId}/`,
          method: 'PATCH',
          body: payload,
        }),
        transformResponse: (response: UpdateClientMilestoneResponse) => response,
        invalidatesTags: (result, error, { contractId, stepId }) => [
          { type: 'Milestones', id: contractId },
          { type: 'Milestones', id: `${contractId}:${stepId}` },
        ],
      }
    ),

    // Freelancer side endpoints
    getFreelancerContracts: builder.query<FreelancerContractsResponse, { page?: number; page_size?: number } | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params && params.page) searchParams.append('page', params.page.toString());
        if (params && params.page_size) searchParams.append('page_size', params.page_size.toString());
        const queryString = searchParams.toString();
        return `biding/contracts/${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: FreelancerContractsResponse) => response,
      providesTags: ['Contracts'],
    }),
    getFreelancerContractById: builder.query<FreelancerContractDetailResponse, string>({
      query: (id) => `biding/contracts/${id}/`,
      transformResponse: (response: FreelancerContractDetailResponse) => response,
      providesTags: (result, error, id) => [{ type: 'Contracts', id }],
    }),
    getFreelancerMilestones: builder.query<
      FreelancerMilestonesResponse,
      { contractId: string; page?: number; page_size?: number }
    >({
      query: ({ contractId, page, page_size }) => {
        const searchParams = new URLSearchParams();
        if (page) searchParams.append('page', page.toString());
        if (page_size) searchParams.append('page_size', page_size.toString());
        const queryString = searchParams.toString();
        return `work-diary/milestones/${contractId}/steps/${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: FreelancerMilestonesResponse) => response,
      providesTags: (result, error, { contractId }) => [{ type: 'Milestones', id: contractId }],
    }),
    getFreelancerMilestoneDetail: builder.query<FreelancerMilestoneDetailResponse, { contractId: string; stepId: string }>(
      {
        query: ({ contractId, stepId }) => `work-diary/milestones/${contractId}/steps/${stepId}/`,
        transformResponse: (response: FreelancerMilestoneDetailResponse) => response,
        providesTags: (result, error, { contractId, stepId }) => [
          { type: 'Milestones', id: `${contractId}-${stepId}` },
        ],
      }
    ),
    // (removed duplicate) getClientMilestoneDetail defined above
    submitMilestoneWork: builder.mutation<MilestoneSubmissionResponse, { contractId: string; stepId: string; formData: FormData }>(
      {
        query: ({ contractId, stepId, formData }) => ({
          url: `work-diary/milestones/${contractId}/steps/${stepId}/`,
          method: 'PATCH',
          body: formData,
        }),
        transformResponse: (response: MilestoneSubmissionResponse) => response,
        invalidatesTags: (result, error, { contractId }) => [{ type: 'Milestones', id: contractId }],
      }
    ),
    updateSubmissionStatus: builder.mutation<
      UpdateSubmissionStatusResponse,
      { contractId: string; stepId: string; submissionId: string; payload: UpdateSubmissionStatusPayload }
    >({
      query: ({ contractId, stepId, submissionId, payload }) => ({
        url: `work-diary/client/milestones/${contractId}/steps/${stepId}/submissions/${submissionId}/update/`,
        method: 'PATCH',
        body: payload,
      }),
      transformResponse: (response: UpdateSubmissionStatusResponse) => response,
      invalidatesTags: (result, error, { contractId }) => [{ type: 'Milestones', id: contractId }],
    }),
  }),
});

export const { 
  useStudentSignupMutation, 
  useEmployerSignupMutation, 
  useLoginMutation, 
  useGetMeQuery, 
  useGetClientMeQuery, 
  useGetProfileByUsernameQuery,
  useVerifyEmailQuery, 
  useResendVerificationEmailQuery, 
  useSendPasswordResetMailMutation, 
  useVerifyOtpMutation, 
  useResetPasswordMutation, 
  useUpdateProfileMutation, 
  useUpdateClientProfileMutation, 
  useUploadImageMutation, 
  useLazyGetMeQuery, 
  useLazyGetClientMeQuery, 
  useGetConversationsQuery,
  useGetContractsQuery,
  useGetContractByIdQuery,
  useGetMilestonesQuery,
  useCreateMilestoneMutation
} = apiSlice; 

export const {
  useGetFreelancerContractsQuery,
  useGetFreelancerContractByIdQuery,
  useGetFreelancerMilestonesQuery,
  useSubmitMilestoneWorkMutation,
  useUpdateSubmissionStatusMutation,
  useUpdateClientMilestoneMutation,
} = apiSlice;
