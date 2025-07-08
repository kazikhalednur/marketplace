// Utility functions for error extraction
export function hasMessage(obj: unknown): obj is { message: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'message' in obj &&
    typeof (obj as { message?: unknown }).message === 'string'
  );
}
export function hasDataMessage(obj: unknown): obj is { data: { message: string } } {
  const o: unknown = obj;
  return (
    typeof o === 'object' &&
    o !== null &&
    'data' in o &&
    typeof (o as { data?: unknown }).data === 'object' &&
    (o as { data?: unknown }).data !== null &&
    'message' in ((o as { data?: { message?: unknown } }).data ?? {}) &&
    typeof ((o as { data: { message?: unknown } }).data?.message) === 'string'
  );
}
export function getErrorMessage(err: unknown, fallback = 'An error occurred'): string {
  if (hasDataMessage(err)) {
    return (err as { data: { message: string } }).data.message;
  }
  if (hasMessage(err)) {
    return (err as { message: string }).message;
  }
  return fallback;
} 