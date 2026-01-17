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
  guest_username: string;
}

export interface MeetingGuest {
  username: string;
  email: string;
  full_name: string;
}

export interface MeetingData {
  id: string;
  room_name: string;
  topic: string;
  duration: number;
  start_date: string;
  start_time: string;
  guest: MeetingGuest;
  created_at: string;
  updated_at: string;
}

export interface JoinMeetingData {
  room_name: string;
  token: string;
  domain: string;
}

export interface MyMeetingItem {
  id: string;
  room_name: string;
  topic: string;
  duration: number;
  start_date: string;
  start_time: string;
  created_by_name: string;
  guest_name: string;
  created_at: string;
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
  tagTypes: ['Meetings', 'FreelancerList', 'MyMeetings'],
  endpoints: (builder) => ({
    getFreelancerList: builder.query<FreelancerListItem[], void>({
      query: () => 'meetings/freelancer-list/',
      transformResponse: (response: ApiResponse<FreelancerListItem[]>) => response.data,
      providesTags: ['FreelancerList'],
    }),
    getMyMeetings: builder.query<MyMeetingItem[], void>({
      query: () => 'meetings/my/',
      transformResponse: (response: ApiResponse<MyMeetingItem[]>) => response.data,
      providesTags: ['MyMeetings'],
    }),
    createMeeting: builder.mutation<MeetingData, CreateMeetingPayload>({
      query: (body) => ({
        url: 'meetings/create/',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<MeetingData>) => response.data,
      invalidatesTags: ['Meetings', 'MyMeetings'],
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
  useCreateMeetingMutation,
  useJoinMeetingQuery,
} = meetingsApi;
