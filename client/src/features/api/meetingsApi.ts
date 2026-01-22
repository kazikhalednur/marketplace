import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

// Types
export interface FreelancerListItem {
  username: string;
  full_name: string;
  contract_id: string;
  job_title: string;
  contract_status: string;
}

export interface CreateMeetingPayload {
  topic: string;
  duration: number;
  start_date: string;
  start_time: string;
  contract: string;
}

export interface MeetingData {
  id: string;
  room_name: string;
  topic: string;
  duration: number;
  start_date: string;
  start_time: string;
  created_at: string;
  updated_at: string;
}

export interface JoinMeetingData {
  room_name: string;
  token: string;
  domain: string;
}

export interface MeetingListItem {
  id: string;
  room_name: string;
  topic: string;
  duration: number;
  start_date: string;
  start_time: string;
  created_by: string;
  guest: string;
  job_title: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiResponse<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
}

export const meetingsApi = createApi({
  reducerPath: 'meetingsApi',
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
  tagTypes: ['Meetings', 'FreelancerList', 'MyMeetings', 'ContractMeetings'],
  endpoints: (builder) => ({
    getFreelancerList: builder.query<FreelancerListItem[], void>({
      query: () => 'meetings/freelancer-list/',
      transformResponse: (response: ApiResponse<FreelancerListItem[]>) => response.data,
      providesTags: ['FreelancerList'],
    }),
    getMyMeetings: builder.query<PaginatedResponse<MeetingListItem>, { page?: number; page_size?: number }>({
      query: ({ page = 1, page_size = 10 }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('page_size', page_size.toString());
        return `meetings/my/?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<PaginatedResponse<MeetingListItem>>) => response.data,
      providesTags: ['MyMeetings'],
    }),
    getContractMeetings: builder.query<PaginatedResponse<MeetingListItem>, { contractId: string; page?: number; page_size?: number }>({
      query: ({ contractId, page = 1, page_size = 10 }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('page_size', page_size.toString());
        return `meetings/list/${contractId}/?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<PaginatedResponse<MeetingListItem>>) => response.data,
      providesTags: (result, error, { contractId }) => [
        { type: 'ContractMeetings', id: contractId },
        'ContractMeetings'
      ],
    }),
    createMeeting: builder.mutation<MeetingData, CreateMeetingPayload>({
      query: (body) => ({
        url: 'meetings/create/',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<MeetingData>) => response.data,
      invalidatesTags: ['Meetings', 'MyMeetings', 'ContractMeetings'],
    }),
    joinMeeting: builder.query<JoinMeetingData, string>({
      query: (roomName) => `meetings/join/${roomName}/`,
      transformResponse: (response: ApiResponse<JoinMeetingData>) => response.data,
    }),
  }),
});

export const {
  useGetFreelancerListQuery,
  useGetMyMeetingsQuery,
  useGetContractMeetingsQuery,
  useCreateMeetingMutation,
  useJoinMeetingQuery,
} = meetingsApi;
