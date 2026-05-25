import { getAppOrigin } from '@/lib/appUrl';

export type GoogleOAuthFlow = 'login' | 'signup-freelancer' | 'signup-client';

const FLOW_KEY = 'google_oauth_flow';
const STATE_KEY = 'google_oauth_state';
const STUDENT_ID_KEY = 'google_oauth_student_id';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const SCOPES = 'openid email profile';

export function getGoogleClientId(): string | undefined {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
}

export function getGoogleRedirectUri(): string {
  const fromEnv = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  const origin = getAppOrigin();
  return origin ? `${origin}/google-login` : '/google-login';
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(getGoogleClientId() && getGoogleRedirectUri());
}

export function buildGoogleOAuthUrl(): string {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('Google OAuth is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env');
  }

  const state = crypto.randomUUID();
  sessionStorage.setItem(STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(),
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export function startGoogleOAuth(flow: GoogleOAuthFlow, options?: { studentId?: string }): void {
  if (flow === 'signup-client' && !options?.studentId?.trim()) {
    throw new Error('Student ID is required for client registration with Google');
  }

  sessionStorage.setItem(FLOW_KEY, flow);
  if (options?.studentId) {
    sessionStorage.setItem(STUDENT_ID_KEY, options.studentId.trim());
  } else {
    sessionStorage.removeItem(STUDENT_ID_KEY);
  }

  window.location.href = buildGoogleOAuthUrl();
}

export function consumeGoogleOAuthState(): {
  flow: GoogleOAuthFlow | null;
  studentId: string | null;
  expectedState: string | null;
} {
  const flow = sessionStorage.getItem(FLOW_KEY) as GoogleOAuthFlow | null;
  const studentId = sessionStorage.getItem(STUDENT_ID_KEY);
  const expectedState = sessionStorage.getItem(STATE_KEY);

  sessionStorage.removeItem(FLOW_KEY);
  sessionStorage.removeItem(STUDENT_ID_KEY);
  sessionStorage.removeItem(STATE_KEY);

  return { flow, studentId, expectedState };
}

export function verifyOAuthState(receivedState: string | null, expectedState: string | null): boolean {
  if (!expectedState || !receivedState) {
    return false;
  }
  return receivedState === expectedState;
}
