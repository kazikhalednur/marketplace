import { useState, useEffect, useRef } from 'react';
import { NetworkStatus, PresenceStatus, getNetworkStatusService } from '@/services/networkStatus';

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: false,
    lastSeen: new Date(),
    connectionType: undefined
  });

  const [presenceStatus, setPresenceStatus] = useState<PresenceStatus[]>([]);
  const previousPresenceRef = useRef<PresenceStatus[]>([]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    const service = getNetworkStatusService();
    
    // Subscribe to network status updates (for current user)
    const unsubscribeNetwork = service.subscribeToNetworkStatus((status) => {
      setNetworkStatus(status);
    });

    // Subscribe to presence updates (for all users)
    const unsubscribePresence = service.subscribeToPresence((users) => {
      // Only update if the presence data has actually changed
      const hasChanged = JSON.stringify(users) !== JSON.stringify(previousPresenceRef.current);
      if (hasChanged) {
        previousPresenceRef.current = users;
        setPresenceStatus(users);
      }
    });

    // Get initial status
    const initialStatus = service.getCurrentNetworkStatus();
    setNetworkStatus(initialStatus);

    return () => {
      unsubscribeNetwork();
      unsubscribePresence();
    };
  }, []);

  const getUserStatus = (username: string): PresenceStatus | null => {
    const service = getNetworkStatusService();
    const userStatus = service.getUserStatus(username);
    return userStatus;
  };

  const updateUserStatus = (username: string, isOnline: boolean, lastSeen?: Date) => {
    const service = getNetworkStatusService();
    service.updateUserStatus(username, isOnline, lastSeen);
  };

  const setCurrentUser = (username: string) => {
    const service = getNetworkStatusService();
    service.setCurrentUser(username);
  };

  return {
    networkStatus,
    presenceStatus,
    isOnline: networkStatus.isOnline,
    lastSeen: networkStatus.lastSeen,
    getUserStatus,
    updateUserStatus,
    setCurrentUser
  };
}; 