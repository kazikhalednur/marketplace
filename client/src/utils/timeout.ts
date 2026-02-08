// Timeout management utility
export class TimeoutManager {
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Set a timeout with automatic cleanup
   * @param key - Unique identifier for the timeout
   * @param callback - Function to execute
   * @param delay - Delay in milliseconds
   * @param options - Additional options
   */
  setTimeout(
    key: string,
    callback: () => void,
    delay: number,
    options?: {
      replace?: boolean; // Replace existing timeout with same key
      autoCleanup?: boolean; // Automatically remove from map after execution
    }
  ): void {
    const { replace = true, autoCleanup = true } = options || {};

    // Clear existing timeout if replace is true
    if (replace) {
      this.clearTimeout(key);
    }

    const timeoutId = setTimeout(() => {
      callback();
      if (autoCleanup) {
        this.timeouts.delete(key);
      }
    }, delay);

    this.timeouts.set(key, timeoutId);
  }

  /**
   * Clear a specific timeout
   * @param key - Unique identifier for the timeout
   */
  clearTimeout(key: string): void {
    const timeoutId = this.timeouts.get(key);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(key);
    }
  }

  /**
   * Clear all timeouts
   */
  clearAll(): void {
    this.timeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.timeouts.clear();
  }

  /**
   * Check if a timeout exists
   * @param key - Unique identifier for the timeout
   */
  hasTimeout(key: string): boolean {
    return this.timeouts.has(key);
  }

  /**
   * Get the number of active timeouts
   */
  getTimeoutCount(): number {
    return this.timeouts.size;
  }
}

// Singleton instance for global use
export const timeoutManager = new TimeoutManager();

// Convenience functions for common timeout patterns
export const createLoadingTimeout = (
  key: string,
  callback: () => void,
  delay: number = 3000
): void => {
  timeoutManager.setTimeout(key, callback, delay, { replace: true, autoCleanup: true });
};

export const createDebounceTimeout = (
  key: string,
  callback: () => void,
  delay: number = 300
): void => {
  timeoutManager.setTimeout(key, callback, delay, { replace: true, autoCleanup: true });
};

export const createReconnectTimeout = (
  key: string,
  callback: () => void,
  delay: number = 5000
): void => {
  timeoutManager.setTimeout(key, callback, delay, { replace: true, autoCleanup: false });
};

// React hook for timeout management
export const useTimeoutManager = () => {
  const manager = new TimeoutManager();

  // Cleanup on unmount
  // Note: This requires React import in the file where it's used
  // useEffect(() => {
  //   return () => {
  //     manager.clearAll();
  //   };
  // }, []);

  return manager;
};