import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

interface ApiResponse {
  success: boolean;
  status_code: number;
  message: string;
}

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
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
  tagTypes: ['Notifications'],
  endpoints: (builder) => ({
    // Mark a single notification as read
    markNotificationAsRead: builder.mutation<ApiResponse, number>({
      query: (id) => ({
        url: `/notifications/read/${id}/`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
    
    // Mark all notifications as read
    markAllNotificationsAsRead: builder.mutation<ApiResponse, void>({
      query: () => ({
        url: '/notifications/read/all/',
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} = notificationsApi;