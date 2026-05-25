'use client';

import { useToast } from '@/components/ui/toast-provider';
import {
  useGoogleClientSignupMutation,
  useGoogleFreelancerSignupMutation,
  useGoogleLoginMutation,
} from '@/features/api/apiSlice';
import { Loader } from '@/hooks/useAuth';
import {
  consumeGoogleOAuthState,
  verifyOAuthState,
} from '@/lib/googleOAuth';
import { setAuthTokens } from '@/utils/authTokens';
import { getErrorMessage } from '@/utils/error';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

function handleAuthSuccess(
  access: string,
  refresh: string,
  message: string,
  showToast: (opts: { type: 'success' | 'error'; message: string }) => void,
) {
  setAuthTokens(access, refresh);
  showToast({ type: 'success', message });
  window.location.href = '/dashboard';
}

function GoogleLoginCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const handled = useRef(false);

  const [googleLogin] = useGoogleLoginMutation();
  const [googleFreelancerSignup] = useGoogleFreelancerSignupMutation();
  const [googleClientSignup] = useGoogleClientSignupMutation();

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const run = async () => {
      const oauthError = searchParams.get('error');
      if (oauthError) {
        showToast({ type: 'error', message: 'Google sign-in was cancelled or denied.' });
        router.replace('/login');
        return;
      }

      const code = searchParams.get('code');
      const receivedState = searchParams.get('state');
      const { flow, studentId, expectedState } = consumeGoogleOAuthState();

      if (!verifyOAuthState(receivedState, expectedState)) {
        showToast({ type: 'error', message: 'Invalid OAuth state. Please try again.' });
        router.replace('/login');
        return;
      }

      if (!code) {
        showToast({ type: 'error', message: 'No authorization code received from Google.' });
        router.replace('/login');
        return;
      }

      if (!flow) {
        showToast({ type: 'error', message: 'Sign-in session expired. Please try again.' });
        router.replace('/login');
        return;
      }

      const signupFailureRedirect = '/register';

      try {
        if (flow === 'login') {
          const res = await googleLogin({ code }).unwrap();
          if (res?.success && res?.data?.access && res?.data?.refresh) {
            handleAuthSuccess(
              res.data.access,
              res.data.refresh,
              res.message || 'Login successful!',
              showToast,
            );
            return;
          }
          showToast({
            type: 'error',
            message: res?.error?.detail || res?.error?.email || res?.message || 'Authentication failed.',
          });
          router.replace('/login');
          return;
        }

        if (flow === 'signup-freelancer') {
          const res = await googleFreelancerSignup({ code }).unwrap();
          if (res?.success && res?.data?.access && res?.data?.refresh) {
            handleAuthSuccess(
              res.data.access,
              res.data.refresh,
              res.message || 'Registration successful!',
              showToast,
            );
            return;
          }
          showToast({ type: 'error', message: res?.message || 'Registration failed.' });
          router.replace(signupFailureRedirect);
          return;
        }

        if (flow === 'signup-client') {
          if (!studentId) {
            showToast({ type: 'error', message: 'Student ID is required for client registration.' });
            router.replace(signupFailureRedirect);
            return;
          }
          const res = await googleClientSignup({ code, student_id: studentId }).unwrap();
          if (res?.success && res?.data?.access && res?.data?.refresh) {
            handleAuthSuccess(
              res.data.access,
              res.data.refresh,
              res.message || 'Registration successful!',
              showToast,
            );
            return;
          }
          showToast({ type: 'error', message: res?.message || 'Registration failed.' });
          router.replace(signupFailureRedirect);
        }
      } catch (err) {
        showToast({
          type: 'error',
          message: getErrorMessage(err, 'Google authentication failed.'),
        });
        router.replace(flow === 'login' ? '/login' : signupFailureRedirect);
      }
    };

    void run();
  }, [
    googleClientSignup,
    googleFreelancerSignup,
    googleLogin,
    router,
    searchParams,
    showToast,
  ]);

  return <Loader />;
}

export default function GoogleLoginPage() {
  return (
    <Suspense fallback={<Loader />}>
      <GoogleLoginCallback />
    </Suspense>
  );
}
