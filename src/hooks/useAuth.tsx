"use client";

import { useEffect, useCallback, useState } from 'react';
import { useGetMeQuery, useGetClientMeQuery } from '../features/api/apiSlice';
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
  
  const [hasToken, setHasToken] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const token = Cookies.get('accessToken');
    setHasToken(!!token);
    setMounted(true);
    
    // Extract role from token if available
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role || payload.user_role || null;
        console.log('useAuth: Extracted role from token:', role);
        setUserRole(role);
      } catch {
        console.log('useAuth: Could not extract role from token');
        setUserRole(null);
      }
    }
  }, []);
  
  // Determine which query to use based on user role
  const currentRole = user.role || userRole;
  const isClient = currentRole === 'client';
  
  console.log('useAuth: Role detection - currentRole:', currentRole, 'isClient:', isClient);
  
  // Use only the appropriate query based on role
  const { data: freelancerData, isLoading: freelancerLoading, refetch: refetchFreelancer } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
    skip: !hasToken || isClient, // Skip if user is client
  });

  const { data: clientData, isLoading: clientLoading, refetch: refetchClient } = useGetClientMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
    skip: !hasToken || !isClient, // Skip if user is NOT client (i.e., freelancer)
  });

  // Use the appropriate data based on which query was called
  const data = isClient ? clientData : freelancerData;
  const isLoading = isClient ? clientLoading : freelancerLoading;
  const isError = false; // Since we're not using error states, set to false
  
  // Refetch function that uses the appropriate endpoint
  const refetch = useCallback(() => {
    console.log('useAuth: Refetching with role:', currentRole);
    if (isClient) {
      console.log('useAuth: Using client endpoint for refetch');
      refetchClient();
    } else {
      console.log('useAuth: Using freelancer endpoint for refetch');
      refetchFreelancer();
    }
  }, [isClient, refetchClient, refetchFreelancer, currentRole]);

  useEffect(() => {
    // Only update if data exists and is different from user
    if (data && !isEqual(data, user)) {
      console.log('useAuth: Setting user data from API:', data);
      dispatch(setUser(data));
    } else if (isError) {
      console.log('useAuth: API error, clearing user');
      dispatch(clearUser());
    }
    // Only clear user if we're sure there's no token (after initial mount)
    else if (!hasToken && mounted) {
      console.log('useAuth: No token, clearing user');
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
  const showLoader = !mounted || (hasToken && isLoading);

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