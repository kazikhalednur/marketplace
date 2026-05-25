'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast-provider';
import {
  GoogleOAuthFlow,
  isGoogleOAuthConfigured,
  startGoogleOAuth,
} from '@/lib/googleOAuth';

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 48 48"
      aria-hidden
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083h-19.5v7.833h11.237c-1.212 6.722-7.151 11.25-14.494 11.25-8.327 0-15.1-6.773-15.1-15.1s6.773-15.1 15.1-15.1c4.073 0 7.78 1.564 10.575 4.117l5.58-5.58C34.35 6.4 29.412 4 24.11 4 12.648 4 3.11 13.537 3.11 25s9.538 21 21 21c12.18 0 20.88-8.543 20.88-20.48 0-1.38-.14-2.72-.38-4.437z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.546 4.81c1.94-4.44 6.646-7.544 11.85-7.544 4.073 0 7.78 1.564 10.575 4.117l5.58-5.58C34.35 6.4 29.412 4 24.11 4c-7.983 0-15.025 5.058-17.804 12.691z"
      />
      <path
        fill="#4CAF50"
        d="M24.11 44c5.627 0 10.518-2.216 14.198-5.83l-6.58-5.44c-2.46 1.66-5.71 2.642-9.617 2.642-4.254 0-7.92-2.727-9.247-6.53l-6.65 5.17C8.644 39.45 15.856 44 24.11 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083h-19.5v7.833h11.237c-1.212 6.722-7.151 11.25-14.494 11.25-1.653 0-3.262-.324-4.712-.918v6.004c1.43.493 2.952.75 4.712.75 12.18 0 20.88-8.543 20.88-20.48 0-1.38-.14-2.72-.38-4.437z"
      />
    </svg>
  );
}

interface GoogleSignInButtonProps {
  flow: GoogleOAuthFlow;
  label: string;
  studentId?: string;
  disabled?: boolean;
  className?: string;
}

export default function GoogleSignInButton({
  flow,
  label,
  studentId,
  disabled,
  className,
}: GoogleSignInButtonProps) {
  const { showToast } = useToast();

  const handleClick = () => {
    if (!isGoogleOAuthConfigured()) {
      showToast({
        type: 'error',
        message: 'Google sign-in is not configured. Contact the administrator.',
      });
      return;
    }

    try {
      startGoogleOAuth(flow, { studentId });
    } catch (err) {
      showToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Could not start Google sign-in',
      });
    }
  };

  return (
    <Button
      variant="outline"
      className={className ?? 'w-full flex items-center justify-center gap-2 mt-2'}
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={handleClick}
    >
      <GoogleIcon />
      {label}
    </Button>
  );
}
