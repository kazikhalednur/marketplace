// src/utils/time.ts
export function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diff = (now.getTime() - date.getTime()) / 1000; // seconds
  if (diff < 60) return 'just now';
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(diff / 86400);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

/**
 * Get formatted date for chat message grouping
 * @param timestamp - ISO timestamp string
 * @returns Formatted date string (Today, Yesterday, or full date)
 */
export function getFormattedDateForChat(timestamp: string): string {
  if (!timestamp) return 'Unknown Date';
  
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Use toDateString() for consistent date comparison
  const dateString = date.toDateString();
  const todayString = today.toDateString();
  const yesterdayString = yesterday.toDateString();

  if (dateString === todayString) {
    return 'Today';
  } else if (dateString === yesterdayString) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}

/**
 * Check if two timestamps are from the same day
 * @param timestamp1 - First ISO timestamp string
 * @param timestamp2 - Second ISO timestamp string
 * @returns boolean indicating if both timestamps are from the same day
 */
export function isSameDay(timestamp1: string, timestamp2: string): boolean {
  if (!timestamp1 || !timestamp2) return false;
  
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  
  return date1.toDateString() === date2.toDateString();
}

/**
 * Get the day key for grouping messages by date
 * @param timestamp - ISO timestamp string
 * @returns A string key representing the day for grouping
 */
export function getDayKey(timestamp: string): string {
  if (!timestamp) return 'unknown';
  
  const date = new Date(timestamp);
  return date.toDateString();
}

/**
 * Get the minute key for grouping messages by 1-minute intervals
 * @param timestamp - ISO timestamp string
 * @returns A string key representing the minute for grouping
 */
export function getMinuteKey(timestamp: string): string {
  if (!timestamp) return 'unknown';
  
  const date = new Date(timestamp);
  // Round down to the nearest minute by setting seconds and milliseconds to 0
  const minuteDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), 0, 0);
  return minuteDate.toISOString();
}

/**
 * Check if two timestamps are from the same minute (within 1-minute interval)
 * @param timestamp1 - First ISO timestamp string
 * @param timestamp2 - Second ISO timestamp string
 * @returns boolean indicating if both timestamps are within the same 1-minute interval
 */
export function isSameMinute(timestamp1: string, timestamp2: string): boolean {
  if (!timestamp1 || !timestamp2) return false;
  
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  
  // Round both dates to the nearest minute
  const minute1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate(), date1.getHours(), date1.getMinutes(), 0, 0);
  const minute2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate(), date2.getHours(), date2.getMinutes(), 0, 0);
  
  return minute1.getTime() === minute2.getTime();
}

/**
 * Get formatted time for 1-minute grouping
 * @param timestamp - ISO timestamp string
 * @returns Formatted time string for 1-minute grouping
 */
export function getFormattedTimeForMinuteGrouping(timestamp: string): string {
  if (!timestamp) return 'Unknown Time';
  
  const date = new Date(timestamp);
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  
  // Round to the nearest minute
  const minuteDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), 0, 0);
  const minuteNow = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0);
  const minuteOneMinuteAgo = new Date(oneMinuteAgo.getFullYear(), oneMinuteAgo.getMonth(), oneMinuteAgo.getDate(), oneMinuteAgo.getHours(), oneMinuteAgo.getMinutes(), 0, 0);
  const minuteFiveMinutesAgo = new Date(fiveMinutesAgo.getFullYear(), fiveMinutesAgo.getMonth(), fiveMinutesAgo.getDate(), fiveMinutesAgo.getHours(), fiveMinutesAgo.getMinutes(), 0, 0);
  
  if (minuteDate.getTime() === minuteNow.getTime()) {
    return 'Just now';
  } else if (minuteDate.getTime() === minuteOneMinuteAgo.getTime()) {
    return '1 minute ago';
  } else if (minuteDate.getTime() >= minuteFiveMinutesAgo.getTime()) {
    const diffMinutes = Math.floor((minuteNow.getTime() - minuteDate.getTime()) / (60 * 1000));
    return `${diffMinutes} minutes ago`;
  } else {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }
}

/**
 * Test function to verify 1-minute grouping logic
 * @param timestamps - Array of ISO timestamp strings
 * @returns Array of grouped timestamps with separator flags
 */
export function testMinuteGrouping(timestamps: string[]): Array<{ timestamp: string; shouldShowSeparator: boolean; group: string }> {
  const results: Array<{ timestamp: string; shouldShowSeparator: boolean; group: string }> = [];
  
  for (let i = 0; i < timestamps.length; i++) {
    const currentTimestamp = timestamps[i];
    const previousTimestamp = i > 0 ? timestamps[i - 1] : null;
    
    const shouldShowSeparator = i === 0 || (previousTimestamp !== null && !isSameMinute(currentTimestamp, previousTimestamp));
    const group = getMinuteKey(currentTimestamp);
    
    results.push({
      timestamp: currentTimestamp,
      shouldShowSeparator,
      group
    });
  }
  
  return results;
} 