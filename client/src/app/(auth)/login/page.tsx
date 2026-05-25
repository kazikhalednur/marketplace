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
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { LoginPayload, useLoginMutation } from '@/features/api/apiSlice';
import { Loader, useAuth } from '@/hooks/useAuth';
import { setAuthTokens } from '@/utils/authTokens';
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
  
  // Check if user had remember me enabled and restore saved credentials
  useEffect(() => {
    const rememberMe = Cookies.get('rememberMe');
    const savedEmail = Cookies.get('savedEmail');
    const savedPassword = Cookies.get('savedPassword');
    
    if (rememberMe === 'true') {
      form.setValue('remember', true);
      
      // Auto-fill saved credentials if they exist
      if (savedEmail) {
        form.setValue('email', savedEmail);
      }
      if (savedPassword) {
        form.setValue('password', savedPassword);
      }
    }
  }, [form]);
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
        
        // Set cookie expiration based on remember me
        const expires = data.remember ? 30 : 7; // 30 days if remember me, 7 days otherwise
        
        setAuthTokens(res.data.access, res.data.refresh, data.remember);
        
        // Save remember me preference and credentials if remember me is checked
        Cookies.set('rememberMe', data.remember ? 'true' : 'false', { path: '/', expires });
        
        if (data.remember) {
          // Save email and password for auto-fill
          Cookies.set('savedEmail', data.email, { path: '/', expires });
          Cookies.set('savedPassword', data.password, { path: '/', expires });
        } else {
          // Clear saved credentials if remember me is unchecked
          Cookies.remove('savedEmail', { path: '/' });
          Cookies.remove('savedPassword', { path: '/' });
        }
        
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
                    <div className="flex items-center">
                      <input
                        id="remember"
                        type="checkbox"
                        checked={field.value}
                        onChange={e => {
                          const isChecked = e.target.checked;
                          field.onChange(isChecked);
                          
                          // Clear saved credentials if unchecked
                          if (!isChecked) {
                            Cookies.remove('savedEmail', { path: '/' });
                            Cookies.remove('savedPassword', { path: '/' });
                          }
                        }}
                        className="w-4 h-4 rounded border border-border focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background accent-primary cursor-pointer"
                      />
                      <label htmlFor="remember" className="ml-2 text-sm text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors">
                        Remember me
                      </label>
                    </div>
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
          <GoogleSignInButton flow="login" />
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
