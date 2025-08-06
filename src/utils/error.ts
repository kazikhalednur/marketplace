// Error handling utility
export interface ErrorInfo {
  message: string;
  code?: string;
  details?: unknown;
  timestamp?: string;
  context?: string;
}

export class AppError extends Error {
  public code?: string;
  public details?: unknown;
  public timestamp: string;
  public context?: string;

  constructor(message: string, options?: Partial<ErrorInfo>) {
    super(message);
    this.name = 'AppError';
    this.code = options?.code;
    this.details = options?.details;
    this.timestamp = options?.timestamp || new Date().toISOString();
    this.context = options?.context;
  }
}

/**
 * Safe execution wrapper with error handling
 */
export function safeExecute<T>(
  fn: () => T,
  context?: string,
  fallback?: T
): T | undefined {
  try {
    return fn();
  } catch (error: unknown) {
    const errorInfo: ErrorInfo = {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof AppError ? (error as AppError).code : undefined,
      details: error,
      context,
      timestamp: new Date().toISOString(),
    };

    console.error('Safe execution failed:', errorInfo);
    return fallback;
  }
}

/**
 * Async safe execution wrapper
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  context?: string,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error: unknown) {
    const errorInfo: ErrorInfo = {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof AppError ? (error as AppError).code : undefined,
      details: error,
      context,
      timestamp: new Date().toISOString(),
    };

    console.error('Async safe execution failed:', errorInfo);
    return fallback;
  }
}

/**
 * Create error with context
 */
export function createError(message: string, options?: Partial<ErrorInfo>): AppError {
  return new AppError(message, options);
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown, context?: string): AppError {
  if (error instanceof AppError) {
    return error;
  }

  let message = 'An unexpected error occurred';
  let code: string | undefined;

  if (error && typeof error === 'object' && 'response' in error && 
      error.response && typeof error.response === 'object' && 'data' in error.response &&
      error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
    message = String(error.response.data.message);
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String(error.message);
  }

  if (error && typeof error === 'object' && 'response' in error && 
      error.response && typeof error.response === 'object' && 'status' in error.response) {
    code = `HTTP_${error.response.status}`;
  }

  return new AppError(message, {
    code,
    details: error,
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, unknown>,
  requiredFields: string[],
  context?: string
): void {
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(', ')}`,
      {
        code: 'VALIDATION_ERROR',
        context,
        details: { missingFields, data },
      }
    );
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
  context?: string
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        throw new AppError(
          `Retry failed after ${maxAttempts} attempts`,
          {
            code: 'RETRY_FAILED',
            context,
            details: { lastError, attempts: maxAttempts },
          }
        );
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
} 

/**
 * Get error message from various error formats
 */
export function getErrorMessage(err: unknown, fallback = 'An error occurred'): string {
  if (err && typeof err === 'object') {
    // Check for nested data.message structure (API errors)
    if ('data' in err && err.data && typeof err.data === 'object' && 'message' in err.data) {
      return String(err.data.message);
    }
    // Check for direct message property
    if ('message' in err) {
      return String(err.message);
    }
  }
  return fallback;
} 