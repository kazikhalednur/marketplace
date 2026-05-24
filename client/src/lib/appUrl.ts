/**
 * Public site origin for shareable links (jobs, profiles, etc.).
 * Prefer NEXT_PUBLIC_BASE_URL so links match the deployed domain, not dev localhost.
 */
export function getAppOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}

export function getJobDashboardPath(jobId: string): string {
  return `/dashboard?jobId=${jobId}`;
}

/** Absolute URL for copying/sharing a job link. */
export function buildJobShareUrl(jobId: string): string {
  const origin = getAppOrigin();
  const path = getJobDashboardPath(jobId);
  if (!origin) {
    return path;
  }
  return `${origin}${path}`;
}
