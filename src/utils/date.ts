// Comprehensive date utility
export interface DateFormatOptions {
  format?: 'relative' | 'absolute' | 'short' | 'long' | 'iso';
  timezone?: string;
  locale?: string;
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
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
 * Format date to absolute time
 */
export function getAbsoluteTime(dateString: string, options?: DateFormatOptions): string {
  const date = new Date(dateString);
  const { format = 'short', locale = 'en-US' } = options || {};
  
  switch (format) {
    case 'long':
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'short':
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    case 'iso':
      return date.toISOString();
    default:
      return date.toLocaleDateString(locale);
  }
}

/**
 * Convert YYYY-MM to YYYY-MM-DD format
 */
export function formatDateToFull(dateString: string): string {
  if (!dateString) return '';
  
  // If already in YYYY-MM-DD format, return as is
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }
  
  // If in YYYY-MM format, add -01 to make it YYYY-MM-DD
  if (dateString.match(/^\d{4}-\d{2}$/)) {
    return `${dateString}-01`;
  }
  
  return dateString;
}

/**
 * Format date for display with custom options
 */
export function formatDate(dateString: string, options?: DateFormatOptions): string {
  const { format = 'relative' } = options || {};
  
  switch (format) {
    case 'relative':
      return getRelativeTime(dateString);
    case 'absolute':
      return getAbsoluteTime(dateString, options);
    case 'short':
      return getAbsoluteTime(dateString, { ...options, format: 'short' });
    case 'long':
      return getAbsoluteTime(dateString, { ...options, format: 'long' });
    case 'iso':
      return getAbsoluteTime(dateString, { ...options, format: 'iso' });
    default:
      return getRelativeTime(dateString);
  }
}

/**
 * Check if date is in the past
 */
export function isPast(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
}

/**
 * Check if date is today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Get duration between two dates
 */
export function getDuration(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  }
  
  const months = Math.floor(diffDays / 30);
  const remainingDays = diffDays % 30;
  
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''}${remainingDays > 0 ? ` ${remainingDays} day${remainingDays !== 1 ? 's' : ''}` : ''}`;
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  return `${years} year${years !== 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` : ''}`;
}

/**
 * Validate date string
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Get current timestamp
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Get date from timestamp
 */
export function getDateFromTimestamp(timestamp: string | number): Date {
  return new Date(timestamp);
} 