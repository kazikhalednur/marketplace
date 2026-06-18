/** Default API origin when env vars are missing (matches apiSlice fallback). */
const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || "";

/** Reject empty or placeholder values baked in when env vars are unset at build time. */
function isValidEnvUrl(value: string | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  return (
    trimmed.length > 0 &&
    trimmed !== "undefined" &&
    trimmed !== "null"
  );
}

/** Convert an HTTP(S) API origin to a WebSocket origin. */
function httpOriginToWs(origin: string): string {
  const trimmed = origin.replace(/\/$/, "");
  if (trimmed.startsWith("https://")) {
    return `wss://${trimmed.slice("https://".length)}`;
  }
  if (trimmed.startsWith("http://")) {
    return `ws://${trimmed.slice("http://".length)}`;
  }
  if (trimmed.startsWith("wss://") || trimmed.startsWith("ws://")) {
    return trimmed;
  }
  return trimmed;
}

function getBrowserWebSocketBaseUrl(): string {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const { hostname, port } = window.location;

  // Staging/production: API (and Channels) are exposed on :8443, not the Next.js :443 host.
  if (window.location.protocol === "https:") {
    if (!port || port === "443") {
      return `wss://${hostname}:8443`;
    }
    return `${protocol}://${window.location.host}`;
  }

  // Local dev: Next (3000) and nginx front door (80) reach the API on 8000.
  if (port === "3000" || port === "80" || port === "") {
    return `${protocol}://${hostname}:8000`;
  }

  return `${protocol}://${window.location.host}`;
}

/**
 * WebSocket server origin (no path, no trailing slash), e.g. ws://localhost:8000.
 * Falls back from NEXT_PUBLIC_WEBSOCKET_URL → NEXT_PUBLIC_API_URL → browser/local defaults.
 */
export function getWebSocketBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
  if (isValidEnvUrl(fromEnv)) {
    return httpOriginToWs(fromEnv.trim());
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (isValidEnvUrl(apiUrl)) {
    return httpOriginToWs(apiUrl.trim());
  }

  if (typeof window !== "undefined") {
    return getBrowserWebSocketBaseUrl();
  }

  return httpOriginToWs(DEFAULT_API_URL);
}

export function buildNotificationWebSocketUrl(
  notificationId: string,
  token: string,
): string {
  return `${getWebSocketBaseUrl()}/ws/notification/${notificationId}/?token=${token}`;
}

export function buildChatWebSocketUrl(roomName: string, token: string): string {
  return `${getWebSocketBaseUrl()}/ws/chat/${roomName}/?token=${token}`;
}
