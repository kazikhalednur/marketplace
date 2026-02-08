

export interface NetworkStatus {
  isOnline: boolean;
  lastSeen: Date;
  connectionType?: string;
}

export interface PresenceStatus {
  username: string;
  isOnline: boolean;
  lastSeen: Date;
  status: 'online' | 'offline' | 'away' | 'busy';
}

type NetworkStatusCallback = (status: NetworkStatus) => void;
type PresenceCallback = (presence: PresenceStatus[]) => void;

export class NetworkStatusService {
  private callbacks: NetworkStatusCallback[] = [];
  private presenceCallbacks: PresenceCallback[] = [];
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private isInitialized: boolean = false;
  
  // Individual user presence tracking
  private userPresence: Map<string, PresenceStatus> = new Map();
  private currentUser: string | null = null;

  constructor() {
    // Don't initialize immediately - wait for client-side call
  }

  public initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    this.initializeNetworkMonitoring();
    this.initializeLocalPresence();
    this.isInitialized = true;
    
    // Force update current user status if set
    if (this.currentUser) {
      this.forceUpdateCurrentUserStatus();
    }
  }

  private forceUpdateCurrentUserStatus(): void {
    if (!this.currentUser) return;
    
    const isOnline = navigator.onLine && document.visibilityState === 'visible';
    this.updateCurrentUserStatus(isOnline);
  }

  private initializeNetworkMonitoring() {
    if (typeof window === 'undefined') return;
    
    // Monitor online/offline events for current user
    window.addEventListener('online', () => {
      this.updateCurrentUserStatus(true);
    });

    window.addEventListener('offline', () => {
      this.updateCurrentUserStatus(false);
    });

    // Monitor page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const isOnline = navigator.onLine;
        this.updateCurrentUserStatus(isOnline);
      } else {
        this.updateCurrentUserStatus(false);
      }
    });

    // Start heartbeat to track last seen for current user
    this.heartbeatInterval = setInterval(() => {
      if (this.currentUser) {
        const isOnline = navigator.onLine && document.visibilityState === 'visible';
        this.updateCurrentUserStatus(isOnline);
      }
    }, 30000); // Update every 30 seconds
  }

  private initializeLocalPresence() {
    // For local testing, we'll simulate presence for common usernames
    const testUsers = ['john', 'jane', 'admin', 'user', 'test', 'demo'];
    
    testUsers.forEach(username => {
      this.userPresence.set(username, {
        username,
        isOnline: Math.random() > 0.3, // 70% chance of being online for testing
        lastSeen: new Date(Date.now() - Math.random() * 300000), // Random last seen
        status: Math.random() > 0.3 ? 'online' : 'away'
      });
    });

    // Update presence every 10 seconds for testing
    setInterval(() => {
      this.updateLocalPresence();
    }, 10000);
  }

  private updateLocalPresence() {
    this.userPresence.forEach((user, username) => {
      // Skip current user - they're handled separately
      if (username === this.currentUser) return;
      
      // Randomly change status for testing
      if (Math.random() > 0.8) {
        user.isOnline = !user.isOnline;
        user.status = user.isOnline ? 'online' : 'away';
        user.lastSeen = new Date();
      }
    });

    // Notify callbacks with all users
    const allUsers = Array.from(this.userPresence.values());
    this.notifyPresenceCallbacks(allUsers);
  }

  private updateCurrentUserStatus(isOnline: boolean) {
    if (!this.currentUser) return;

    const currentUserStatus = this.userPresence.get(this.currentUser);
    if (currentUserStatus) {
      // Consider both network status and page visibility
      const isActuallyOnline = isOnline && document.visibilityState === 'visible';
      
      // Only update if the status has actually changed
      if (currentUserStatus.isOnline !== isActuallyOnline) {
        currentUserStatus.isOnline = isActuallyOnline;
        currentUserStatus.lastSeen = new Date();
        currentUserStatus.status = isActuallyOnline ? 'online' : 'offline';
        
        // Notify callbacks with updated presence
        const allUsers = Array.from(this.userPresence.values());
        this.notifyPresenceCallbacks(allUsers);
      }
    }
  }

  private notifyCallbacks() {
    // Get current user's network status
    const currentUserStatus = this.currentUser ? this.userPresence.get(this.currentUser) : null;
    const status: NetworkStatus = {
      isOnline: currentUserStatus?.isOnline || false,
      lastSeen: currentUserStatus?.lastSeen || new Date(),
      connectionType: typeof navigator !== 'undefined' ? (navigator as Navigator & { connection?: { type?: string } }).connection?.type : undefined
    };

    this.callbacks.forEach(callback => callback(status));
  }

  private notifyPresenceCallbacks(users: PresenceStatus[]) {
    this.presenceCallbacks.forEach(callback => callback(users));
  }

  // Public API
  public subscribeToNetworkStatus(callback: NetworkStatusCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  public subscribeToPresence(callback: PresenceCallback): () => void {
    this.presenceCallbacks.push(callback);
    
    // Immediately send current presence data
    const allUsers = Array.from(this.userPresence.values());
    callback(allUsers);
    
    return () => {
      this.presenceCallbacks = this.presenceCallbacks.filter(cb => cb !== callback);
    };
  }

  public unsubscribeFromNetworkStatus(callback: NetworkStatusCallback): void {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  public unsubscribeFromPresence(callback: PresenceCallback): void {
    this.presenceCallbacks = this.presenceCallbacks.filter(cb => cb !== callback);
  }

  public getCurrentNetworkStatus(): NetworkStatus {
    const currentUserStatus = this.currentUser ? this.userPresence.get(this.currentUser) : null;
    return {
      isOnline: currentUserStatus?.isOnline || false,
      lastSeen: currentUserStatus?.lastSeen || new Date(),
      connectionType: typeof navigator !== 'undefined' ? (navigator as Navigator & { connection?: { type?: string } }).connection?.type : undefined
    };
  }

  public updateUserStatus(username: string, isOnline: boolean, lastSeen?: Date): void {
    // Update specific user status
    this.userPresence.set(username, {
      username,
      isOnline,
      lastSeen: lastSeen || new Date(),
      status: isOnline ? 'online' : 'offline'
    });
    
    // Notify callbacks
    const allUsers = Array.from(this.userPresence.values());
    this.notifyPresenceCallbacks(allUsers);
  }

  public setCurrentUser(username: string): void {
    this.currentUser = username;
    
    // Add current user to presence tracking if not exists
    if (!this.userPresence.has(username)) {
      this.userPresence.set(username, {
        username,
        isOnline: navigator.onLine && document.visibilityState === 'visible',
        lastSeen: new Date(),
        status: (navigator.onLine && document.visibilityState === 'visible') ? 'online' : 'offline'
      });
    } else {
      // Update existing user's status based on current network and visibility
      const userStatus = this.userPresence.get(username)!;
      const isOnline = navigator.onLine && document.visibilityState === 'visible';
      userStatus.isOnline = isOnline;
      userStatus.lastSeen = new Date();
      userStatus.status = isOnline ? 'online' : 'offline';
    }

    // Force update the status
    this.forceUpdateCurrentUserStatus();

    // Notify callbacks with updated presence
    const allUsers = Array.from(this.userPresence.values());
    this.notifyPresenceCallbacks(allUsers);
  }

  public getUserStatus(username: string): PresenceStatus | null {
    return this.userPresence.get(username) || null;
  }

  public destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.callbacks = [];
    this.presenceCallbacks = [];
    this.isInitialized = false;
  }
}

// Create singleton instance but don't initialize immediately
let networkStatusServiceInstance: NetworkStatusService | null = null;

export const getNetworkStatusService = (): NetworkStatusService => {
  if (!networkStatusServiceInstance) {
    networkStatusServiceInstance = new NetworkStatusService();
  }
  return networkStatusServiceInstance;
};

// Initialize the service when this module is imported on the client side
if (typeof window !== 'undefined') {
  const service = getNetworkStatusService();
  service.initialize();
} 