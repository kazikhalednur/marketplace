"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, MailWarning } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { ReactElement } from 'react';
import { useResendVerificationEmailQuery, useVerifyEmailQuery } from '@/features/api/apiSlice';

type ScenarioKey = 'success' | 'expired' | 'error' | 'loading';

const SCENARIOS: Record<ScenarioKey, {
  icon: ReactElement;
  title: string;
  accent: string;
  card: string;
}> = {
  success: {
    icon: <CheckCircle className="w-16 h-16 text-green-600 animate-bounce" />,
    title: 'Email Verified!',
    accent: 'from-green-50 via-white to-green-100',
    card: 'border-green-200 shadow-green-100',
  },
  expired: {
    icon: <XCircle className="w-16 h-16 text-red-500 animate-pulse" />,
    title: 'Verification Link Expired',
    accent: 'from-red-50 via-white to-red-100',
    card: 'border-red-200 shadow-red-100',
  },
  error: {
    icon: <MailWarning className="w-16 h-16 text-yellow-500 animate-pulse" />,
    title: 'Email Not Verified',
    accent: 'from-yellow-50 via-white to-yellow-100',
    card: 'border-yellow-200 shadow-yellow-100',
  },
  loading: {
    icon: <MailWarning className="w-16 h-16 text-blue-500 animate-spin" />,
    title: 'Verifying Email...',
    accent: 'from-blue-50 via-white to-blue-100',
    card: 'border-blue-200 shadow-blue-100',
  },
};

export default function EmailVerifiedPage({ params }: { params: Promise<{ uid: string; token: string }> }) {
  const router = useRouter();
  const { uid, token } = use(params);

  const { data, isLoading, isError, isSuccess } = useVerifyEmailQuery({ uid, token });
  // --- State for triggering resend query ---
  const [resendParams, setResendParams] = useState<{ uid: string; token: string } | null>(null);

  // --- Resend verification email query ---
  const {
    data: resendData,
    isLoading: isResending,
    isSuccess: resendSuccess,
    isError: resendError,
    error: resendErrorData,
  } = useResendVerificationEmailQuery(resendParams ?? { uid: '', token: '' }, { skip: resendParams == null });

  // --- Scenario and message state ---
  const [scenario, setScenario] = useState<ScenarioKey>('loading');
  const [message, setMessage] = useState('Verifying your email. Please wait...');

  useEffect(() => {
    if (isLoading) {
      setScenario('loading');
      setMessage('Verifying your email. Please wait...');
      return;
    }
    if (isError) {
      setScenario('error');
      setMessage('An error occurred while verifying your email. Please try again later.');
      return;
    }
    if (isSuccess && data) {
      if (data.data.is_success) {
        setScenario('success');
        setMessage(data.message || 'Your email has been successfully verified. You can now enjoy all features of your account.');
      } else if (data.data.is_expired) {
        setScenario('expired');
        setMessage(data.message || 'Sorry, this verification link has expired or is invalid. Please request a new verification email.');
      } else {
        setScenario('error');
        setMessage(data.message || 'Your email is not verified yet. Please check your inbox for the verification link or request a new one.');
      }
    }
  }, [isLoading, isError, isSuccess, data]);

  useEffect(() => {
    if (resendSuccess) {
      const timeout = setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [resendSuccess, router]);

  useEffect(() => {
    if (scenario === 'success') {
      const timeout = setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [scenario, router]);

  const scenarioData = SCENARIOS[scenario];

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${scenarioData.accent} px-4 py-12`}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
        className={`bg-card/95 border ${scenarioData.card} rounded-2xl p-10 max-w-md w-full flex flex-col items-center text-center`}
      >
        <div className="mb-6 flex flex-col items-center">
          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4 mb-4">
            {scenarioData.icon}
          </span>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl font-bold mb-2"
          >
            {scenarioData.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-muted-foreground text-lg mb-4"
          >
            {message}
          </motion.p>
        </div>
        {scenario === 'expired' ? (
          !resendSuccess ? (
            <Button
              className="w-full mt-2"
              disabled={isResending}
              onClick={() => {
                setResendParams({ uid, token });
              }}
            >
              {isResending ? 'Resending...' : 'Resend Email Verification Link'}
            </Button>
          ) : (
            <p className="text-green-600 font-medium mt-2">{resendData?.message || 'A new verification link has been sent to your email.'}</p>
          )
        ) : (
          <Button asChild className="w-full mt-2" disabled={scenario === 'loading'}>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        )}
        {((resendError && resendErrorData) || resendData?.success === false) && scenario === 'expired' && !resendSuccess && (
          <p className="text-red-600 font-medium mt-2">
            {/* Type guard for FetchBaseQueryError */}
            {resendErrorData && typeof resendErrorData === 'object' && 'data' in resendErrorData &&
              typeof resendErrorData.data === 'object' && resendErrorData.data && 'message' in resendErrorData.data
              ? String(resendErrorData.data.message)
              : resendData?.message || 'Failed to resend verification email.'}
          </p>
        )}
      </motion.div>
    </main>
  );
}
