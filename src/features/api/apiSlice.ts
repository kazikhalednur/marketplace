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
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = Cookies.get('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Me', 'ClientMe'],
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
        url: '/accounts/password-reset/',
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
      invalidatesTags: ['Me'],
    }),
    updateClientProfile: builder.mutation<ProfileUpdateResponse, ClientProfileUpdatePayload>({
      query: (body) => ({
        url: 'accounts/clients/info/',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['ClientMe'],
    }),
    uploadImage: builder.mutation<ImageUploadResponse, FormData>({
      query: (body) => ({
        url: 'images/upload/',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useStudentSignupMutation, useEmployerSignupMutation, useLoginMutation, useGetMeQuery, useGetClientMeQuery, useVerifyEmailQuery, useResendVerificationEmailQuery, useSendPasswordResetMailMutation, useVerifyOtpMutation, useResetPasswordMutation, useUpdateProfileMutation, useUpdateClientProfileMutation, useUploadImageMutation, useLazyGetMeQuery, useLazyGetClientMeQuery } = apiSlice; 
