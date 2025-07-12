"use client";

import { useEffect, useCallback } from 'react';
import { useGetMeQuery } from '../features/api/apiSlice';
import { useAppDispatch } from './useTypedDispatch';
import { useAppSelector } from './useTypedSelector';
import { setUser, clearUser } from '../features/userSlice';
import React from 'react';
import isEqual from 'lodash.isequal';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export function Loader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
    </div>
  );
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const { data, isLoading, isError, refetch } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    // Only update if data exists and is different from user, and user is not empty
    if (data && !isEqual(data, user)) {
      dispatch(setUser(data));
    } else if (isError) {
      dispatch(clearUser());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isError, dispatch]);

  // Helper: is authenticated
  const isAuthenticated = !!user && !!user.email;

  // Helper: check user role
  const hasRole = useCallback((role: string) => user.role === role, [user.role]);

  // Helper: logout (clear user info)
  const logout = useCallback(() => {
    dispatch(clearUser());
    // Clear cookies
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('refreshToken', { path: '/' });
    // Redirect to home page
    router.push('/');
  }, [dispatch, router]);

  // Helper: refresh user info
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loader: show while checking authentication for the first time
  const showLoader = isLoading && !user.email;

  return {
    user,
    isLoading,
    isError,
    isAuthenticated,
    hasRole,
    logout,
    refresh,
    showLoader,
  };
} 