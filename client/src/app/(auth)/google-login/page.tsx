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

      try {
        if (flow === 'login') {
          const res = await googleLogin({ code }).unwrap();
          if (res?.success && res?.data?.access && res?.data?.refresh) {
            setAuthTokens(res.data.access, res.data.refresh);
            showToast({ type: 'success', message: res.message || 'Login successful!' });
            window.location.href = '/dashboard';
            return;
          }
          showToast({
            type: 'error',
            message: res?.error?.detail || res?.message || 'Authentication failed.',
          });
          router.replace('/login');
          return;
        }

        if (flow === 'signup-freelancer') {
          const res = await googleFreelancerSignup({ code }).unwrap();
          if (res?.success) {
            showToast({
              type: 'success',
              message: res.message || 'Registration successful! Please sign in with Google.',
            });
            router.replace('/login');
            return;
          }
          showToast({ type: 'error', message: res?.message || 'Registration failed.' });
          router.replace('/register');
          return;
        }

        if (flow === 'signup-client') {
          if (!studentId) {
            showToast({ type: 'error', message: 'Student ID is required for client registration.' });
            router.replace('/register');
            return;
          }
          const res = await googleClientSignup({ code, student_id: studentId }).unwrap();
          if (res?.success) {
            showToast({
              type: 'success',
              message: res.message || 'Registration successful! Please sign in with Google.',
            });
            router.replace('/login');
            return;
          }
          showToast({ type: 'error', message: res?.message || 'Registration failed.' });
          router.replace('/register');
        }
      } catch (err) {
        showToast({
          type: 'error',
          message: getErrorMessage(err, 'Google authentication failed.'),
        });
        router.replace(flow === 'login' ? '/login' : '/register');
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
