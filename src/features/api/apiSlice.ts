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

export interface UserInfo {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  phone: string;
  role: string;
  email_verified: boolean;
  is_google_login: boolean;
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
  }),
});

export const { useStudentSignupMutation, useEmployerSignupMutation, useLoginMutation, useGetMeQuery, useVerifyEmailQuery, useResendVerificationEmailQuery, useSendPasswordResetMailMutation, useVerifyOtpMutation, useResetPasswordMutation } = apiSlice; 
