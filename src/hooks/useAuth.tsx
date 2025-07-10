"use client";

import { useEffect, useCallback } from 'react';
import { useGetMeQuery } from '../features/api/apiSlice';
import { useAppDispatch } from './useTypedDispatch';
import { useAppSelector } from './useTypedSelector';
import { setUser, clearUser } from '../features/userSlice';
import React from 'react';
import isEqual from 'lodash.isequal';

export function Loader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
    </div>
  );
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { data, isLoading, isError, refetch } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (data && !isEqual(data, user)) {
      dispatch(setUser(data));
    } else if (isError) {
      dispatch(clearUser());
    }
  }, [data, isError, dispatch, user]);

  // Helper: is authenticated
  const isAuthenticated = !!user && !!user.email;

  // Helper: check user role
  const hasRole = useCallback((role: string) => user.role === role, [user.role]);

  // Helper: logout (clear user info)
  const logout = useCallback(() => {
    dispatch(clearUser());
    // Optionally: remove cookies, redirect, etc.
  }, [dispatch]);

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