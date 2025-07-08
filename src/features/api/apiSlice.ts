import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
  data: {
    access: string;
    refresh: string;
  };
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://203.190.14.56:8080/' }),
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
  }),
});

export const { useStudentSignupMutation, useEmployerSignupMutation, useLoginMutation } = apiSlice; 