"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Icon from "@/components/ui/Icon";
import { Input } from "@/components/ui/input";
import { useToast } from '@/components/ui/toast-provider';
import { LoginPayload, useLoginMutation } from '@/features/api/apiSlice';
import { Loader, useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/error';
import Cookies from 'js-cookie';
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
    mode: "onBlur",
  });
  const router = useRouter();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const { isAuthenticated, showLoader } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (showLoader || isAuthenticated) return <Loader />;

  const onSubmit = async (data: LoginPayload) => {
    try {
      const res = await login(data).unwrap();
      if (res?.success && res?.data?.access && res?.data?.refresh) {
        showToast({ type: 'success', message: 'Login successful!' });
        // Save tokens as cookies (not HttpOnly, accessible to JS)
        Cookies.set('accessToken', res.data.access, { path: '/', expires: 7 });
        Cookies.set('refreshToken', res.data.refresh, { path: '/', expires: 7 });
        window.location.href = '/dashboard';
      } else {
        const errorDetail = res?.error?.detail;
        showToast({ type: 'error', message: errorDetail || res?.message || 'Invalid email or password.' });
      }
    } catch (err: unknown) {
      let errorDetail = '';
      if (typeof err === 'object' && err !== null) {
        // @ts-expect-error: dynamic error shape
        errorDetail = err?.data?.error?.detail || err?.error?.detail;
      }
      showToast({ type: 'error', message: errorDetail || getErrorMessage(err, 'Invalid email or password.') });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/60 via-background to-muted/80 px-2 sm:px-4 py-8">
      <Card className="w-full max-w-md sm:max-w-lg md:max-w-md lg:max-w-md xl:max-w-md 2xl:max-w-md border border-border/60 shadow-2xl rounded-2xl bg-card/95 backdrop-blur-md p-0 sm:p-0">
        <CardHeader className="pb-0 pt-6 sm:pt-8">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center w-full">Sign in to your account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-2 sm:px-8 px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Email must be a valid email address",
                  },
                }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="example@email.com"
                          autoComplete="email"
                          {...field}
                          className="pl-10"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                          <Icon icon={Mail} size={20} className="text-muted-foreground" />
                        </span>
                      </div>
                    </FormControl>
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                rules={{ required: "Password is required" }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          {...field}
                          className="pl-10 pr-10"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                          <Icon icon={Lock} size={20} className="text-muted-foreground" />
                        </span>
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <Icon icon={EyeOff} size={20} className="w-5 h-5" />
                          ) : (
                            <Icon icon={Eye} size={20} className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                    <div className="flex justify-end mt-1">
                      <a href="/reset-password" className="text-xs text-primary hover:underline font-medium">Forgot password?</a>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="remember"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 mt-2">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                      className="accent-primary w-4 h-4 rounded border border-border focus:ring-2 focus:ring-primary"
                    />
                    <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">
                      Remember me
                    </label>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-0 pb-6 sm:px-8 px-4">
          <div className="flex items-center w-full mb-1 mt-2">
            <hr className="flex-1 border-t border-border" />
            <span className="mx-4 text-muted-foreground text-sm font-medium select-none">or</span>
            <hr className="flex-1 border-t border-border" />
          </div>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 mt-2"
            type="button"
            aria-label="Sign in with Google"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 48 48"
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
              <path fill="#1976D2" d="M43.611 20.083h-19.5v7.833h11.237c-1.212 6.722-7.151 11.25-14.494 11.25-1.653 0-3.262-.324-4.712-.918v6.004c1.43.493 2.952.75 4.712.75 12.18 0 20.88-8.543 20.88-20.48 0-1.38-.14-2.72-.38-4.437z" />
            </svg>
            Sign in with Google
          </Button>
          <div className="w-full text-center text-muted-foreground text-sm">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-primary hover:underline font-medium">
              Register here
            </a>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
