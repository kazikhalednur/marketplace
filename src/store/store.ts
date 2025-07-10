import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '@/features/api/apiSlice';
import { jobsApi } from '@/features/api/jobsApi';
import jobsFilterReducer from '@/features/jobs/jobsFilterSlice';
import userReducer from '@/features/userSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [jobsApi.reducerPath]: jobsApi.reducer,
    jobsFilter: jobsFilterReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware, jobsApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;