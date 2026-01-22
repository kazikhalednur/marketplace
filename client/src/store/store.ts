import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '@/features/api/apiSlice';
import { jobsApi } from '@/features/api/jobsApi';
import { notificationsApi } from '@/features/api/notificationsApi';
import { meetingsApi } from '@/features/api/meetingsApi';
import jobsFilterReducer from '@/features/jobs/jobsFilterSlice';
import userReducer from '@/features/userSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [jobsApi.reducerPath]: jobsApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [meetingsApi.reducerPath]: meetingsApi.reducer,
    jobsFilter: jobsFilterReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware, jobsApi.middleware, notificationsApi.middleware, meetingsApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;