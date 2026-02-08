import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useGetMeQuery, useGetClientMeQuery, useGetProfileByUsernameQuery, UserInfo } from '@/features/api/apiSlice';

interface UseProfileReturn {
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  isOwnProfile: boolean;
  refetch: () => void;
}

export function useProfile(username: string): UseProfileReturn {
  const { user: currentUser } = useAuth();
  const { data: liveUser } = useGetMeQuery();
  const { data: liveClientUser } = useGetClientMeQuery();
  
  // Use RTK Query for profile fetching
  const { 
    data: profileData, 
    isLoading, 
    error: profileError, 
    refetch 
  } = useGetProfileByUsernameQuery(username, {
    skip: !username,
  });
  
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    // Get current user's username from Redux store
    const currentUsername = currentUser?.username || liveUser?.username || liveClientUser?.username;
    
    // Determine if this is the current user's own profile
    const isOwn = Boolean(currentUsername && currentUsername === username);
    setIsOwnProfile(isOwn);
  }, [username, currentUser, liveUser, liveClientUser]);

  return {
    user: profileData || null,
    loading: isLoading,
    error: profileError ? 'Failed to load user profile' : null,
    isOwnProfile,
    refetch,
  };
} 