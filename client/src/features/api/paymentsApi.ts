import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

// Types
export interface PaymentJobPayload {
  job_id: string;
}

export interface PaymentJobResponseData {
  payment_url: string;
}

export interface PaymentStatusData {
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
}

export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
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
  tagTypes: ['Payments', 'JobPayment', 'PaymentStatus'],
  endpoints: (builder) => ({
    payForJob: builder.mutation<ApiResponse<PaymentJobResponseData>, PaymentJobPayload>({
      query: (body) => ({
        url: 'payments/job/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['JobPayment'],
    }),
    getPaymentStatus: builder.query<ApiResponse<PaymentStatusData>, string>({
      query: (invoiceNumber) => `payments/status/${invoiceNumber}/`,
      providesTags: (result, error, invoiceNumber) => [
        { type: 'PaymentStatus', id: invoiceNumber },
      ],
    }),
  }),
});

export const { usePayForJobMutation, useGetPaymentStatusQuery } = paymentsApi;
