'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/Icon';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { ArrowLeft, IdCard } from 'lucide-react';
import { useState } from 'react';

interface GoogleClientSignupStepProps {
  onBack: () => void;
}

export default function GoogleClientSignupStep({ onBack }: GoogleClientSignupStepProps) {
  const [studentId, setStudentId] = useState('');

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/60 via-background to-muted/80 px-2 sm:px-4 py-8">
      <Card className="w-full max-w-md border border-border/60 shadow-2xl rounded-2xl bg-card/95 backdrop-blur-md">
        <CardHeader className="pt-6">
          <button
            type="button"
            onClick={onBack}
            className="mb-2 flex items-center gap-2 text-muted-foreground hover:text-primary text-sm font-medium"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <CardTitle className="text-2xl font-bold text-center">
            Client registration with Google
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Enter your student ID, then continue with your university Google account.
          </p>
        </CardHeader>
        <CardContent className="px-6 pb-2">
          <label htmlFor="google-client-student-id" className="text-sm font-medium">
            Student ID <span className="text-destructive">*</span>
          </label>
          <div className="relative mt-2">
            <Input
              id="google-client-student-id"
              placeholder="222-15-6390"
              autoComplete="off"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="pl-10"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <Icon icon={IdCard} size={20} className="text-muted-foreground" />
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pb-6 px-6">
          <GoogleSignInButton
            flow="signup-client"
            label="Continue with Google"
            studentId={studentId}
            disabled={!studentId.trim()}
          />
        </CardFooter>
      </Card>
    </main>
  );
}
