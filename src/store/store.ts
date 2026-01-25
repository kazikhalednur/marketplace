import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '@/features/api/apiSlice';
import { jobsApi } from '@/features/api/jobsApi';
import { notificationsApi } from '@/features/api/notificationsApi';
import { meetingsApi } from '@/features/api/meetingsApi';
import { paymentsApi } from '@/features/api/paymentsApi';
import jobsFilterReducer from '@/features/jobs/jobsFilterSlice';
import userReducer from '@/features/userSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [jobsApi.reducerPath]: jobsApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [meetingsApi.reducerPath]: meetingsApi.reducer,
    [paymentsApi.reducerPath]: paymentsApi.reducer,
    jobsFilter: jobsFilterReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware, jobsApi.middleware, notificationsApi.middleware, meetingsApi.middleware, paymentsApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;