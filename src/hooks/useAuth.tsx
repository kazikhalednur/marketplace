"use client";

import { useEffect, useCallback, useState } from 'react';
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
  
  // Check if we have a token to determine if we should make the API call
  // Use useState to avoid hydration mismatch
  const [hasToken, setHasToken] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setHasToken(!!Cookies.get('accessToken'));
    setMounted(true);
  }, []);
  
  const { data, isLoading, isError, refetch } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
    skip: !hasToken, // Skip the query if there's no token
  });

  useEffect(() => {
    // Only update if data exists and is different from user, and user is not empty
    if (data && !isEqual(data, user)) {
      dispatch(setUser(data));
    } else if (isError) {
      dispatch(clearUser());
    }
    // Only clear user if we're sure there's no token (after initial mount)
    else if (!hasToken && mounted) {
      dispatch(clearUser());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isError, hasToken, dispatch]);

  // Helper: is authenticated
  const isAuthenticated = !!user && !!user.email && mounted;

  // Helper: check user role
  const hasRole = useCallback((role: string) => user.role === role, [user.role]);

  // Helper: logout (clear user info)
  const logout = useCallback(() => {
    dispatch(clearUser());
    // Clear cookies
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('refreshToken', { path: '/' });
    // Redirect to login page
    router.push('/login');
  }, [dispatch, router]);

  // Helper: refresh user info
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loader: show while checking authentication for the first time
  const showLoader = isLoading && !user.email && mounted;

  // Helper: check if remember me is enabled
  const isRememberMeEnabled = useCallback(() => {
    return Cookies.get('rememberMe') === 'true';
  }, []);

  return {
    user,
    isLoading,
    isError,
    isAuthenticated,
    hasRole,
    logout,
    refresh,
    showLoader,
    isRememberMeEnabled,
  };
} 