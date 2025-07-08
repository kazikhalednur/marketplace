"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useState, useCallback } from "react";
import { User, IdCard, Phone, Mail, Eye, EyeOff, Lock, RefreshCw } from "lucide-react";
import Icon from "@/components/ui/Icon";

export default function RegisterPage() {
  const form = useForm<{
    fullName: string;
    studentId: string;
    phone: string;
    role: "STUDENT" | "EMPLOYER";
    email: string;
    password: string;
    confirmPassword: string;
  }>({
    defaultValues: {
      fullName: "",
      studentId: "",
      phone: "",
      role: "STUDENT",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<string>("");
  const [remember, setRemember] = useState(false);

  // Password strength checker
  const checkStrength = useCallback((password: string) => {
    if (!password) return "";
    if (password.length < 6) return "Weak";
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password)) return "Strong";
    if (password.length >= 8) return "Medium";
    return "Weak";
  }, []);

  // Password generator
  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue("password", pwd);
    setPasswordStrength(checkStrength(pwd));
  };

  const onSubmit = async (data: {
    fullName: string;
    studentId: string;
    phone: string;
    role: "STUDENT" | "EMPLOYER";
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setError(null);
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      // TODO: Replace with your actual registration API call
      // const res = await fetch("/api/register", { ... });
      // if (!res.ok) throw new Error("Registration failed");
      router.push("/login");
    } catch {
      setError("Failed to register. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/60 via-background to-muted/80 px-2 sm:px-4 py-8">
      <Card className="w-full max-w-md sm:max-w-lg md:max-w-md lg:max-w-md xl:max-w-md 2xl:max-w-md border border-border/60 shadow-2xl rounded-2xl bg-card/95 backdrop-blur-md p-0 sm:p-0">
        <CardHeader className="pb-0 pt-6 sm:pt-8">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center w-full">Create your account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-2 sm:px-8 px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                rules={{ required: "Full name is required" }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="John Doe"
                          autoComplete="name"
                          {...field}
                          className="pl-10"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                          <Icon icon={User} size={20} className="text-muted-foreground" />
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
                name="studentId"
                rules={{ required: "Student ID is required" }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="222-15-6390"
                          autoComplete="off"
                          {...field}
                          className="pl-10"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                          <Icon icon={IdCard} size={20} className="text-muted-foreground" />
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
                name="phone"
                rules={{ required: "Phone number is required" }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="01XXXXXXXXX"
                          autoComplete="tel"
                          {...field}
                          className="pl-10"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                          <Icon icon={Phone} size={20} className="text-muted-foreground" />
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I am a:</FormLabel>
                    <div className="flex gap-6 mt-2">
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="STUDENT"
                          checked={field.value === "STUDENT"}
                          onChange={() => field.onChange("STUDENT")}
                          className="cursor-pointer accent-primary"
                          required
                        />
                        Student
                      </Label>
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="EMPLOYER"
                          checked={field.value === "EMPLOYER"}
                          onChange={() => field.onChange("EMPLOYER")}
                          className="cursor-pointer accent-primary"
                        />
                        Employer
                      </Label>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@diu\.edu\.bd$/,
                    message: "Email must be a valid @diu.edu.bd address",
                  },
                }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="example@diu.edu.bd"
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          {...field}
                          className="pl-10 pr-20"
                          onChange={e => {
                            field.onChange(e);
                            setPasswordStrength(checkStrength(e.target.value));
                          }}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                          <Icon icon={Lock} size={20} className="text-muted-foreground" />
                        </span>
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <Icon icon={EyeOff} size={20} className="w-5 h-5" />
                          ) : (
                            <Icon icon={Eye} size={20} className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                          onClick={generatePassword}
                          aria-label="Generate strong password"
                        >
                          <Icon icon={RefreshCw} size={20} className="w-5 h-5" />
                        </button>
                      </div>
                    </FormControl>
                    {/* Password strength checker */}
                    {passwordStrength && (
                      <div className={`mt-2 text-xs font-medium ${
                        passwordStrength === "Strong"
                          ? "text-green-600"
                          : passwordStrength === "Medium"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}>
                        Password strength: {passwordStrength}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                rules={{ required: "Please confirm your password" }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="new-password"
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
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? (
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
                  </FormItem>
                )}
              />
              {/* Remember me checkbox */}
              <FormItem className="flex flex-row items-center gap-2 mt-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="accent-primary w-4 h-4 rounded border border-border focus:ring-2 focus:ring-primary"
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">
                  Remember me
                </label>
              </FormItem>
              {error && (
                <div className="text-destructive font-medium text-sm" role="alert">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" size="lg">
                Create Account
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-0 pb-6 sm:px-8 px-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 mt-2"
            type="button"
            aria-label="Sign up with Google"
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
            Sign up with Google
          </Button>
          <div className="w-full text-center text-muted-foreground text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline font-medium">
              Login here
            </a>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}