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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { User, Mail, Phone, Building, ArrowLeft } from "lucide-react";
import Icon from "@/components/ui/Icon";

export default function EmployerForm({ onBack }: { onBack?: () => void }) {
  const form = useForm<{
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone: string;
    company?: string;
  }>({
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      phone: "",
      company: "",
    },
    mode: "onBlur",
  });
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
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
        <CardHeader className="pb-0 pt-6 sm:pt-8 flex flex-col items-start">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-2 flex items-center gap-2 text-muted-foreground hover:text-primary text-sm font-medium px-2 py-1 rounded-md bg-transparent self-start"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center w-full">Register as Employer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-2 sm:px-8 px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  rules={{ required: "First name is required" }}
                  render={({ field, fieldState }) => (
                    <FormItem className="flex-1">
                      <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="First Name"
                            autoComplete="given-name"
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
                  name="last_name"
                  rules={{ required: "Last name is required" }}
                  render={({ field, fieldState }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Last Name"
                            autoComplete="family-name"
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
              </div>
              <FormField
                control={form.control}
                name="username"
                rules={{ required: "Username is required" }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Username <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Username"
                          autoComplete="username"
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
                name="email"
                rules={{ required: "Email is required" }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Email"
                          type="email"
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
                name="phone"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Phone"
                          type="tel"
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
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company (optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Company Name"
                          autoComplete="organization"
                          {...field}
                          className="pl-10"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                          <Icon icon={Building} size={20} className="text-muted-foreground" />
                        </span>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              {error && (
                <div className="text-destructive text-sm text-center mt-2">{error}</div>
              )}
              <Button type="submit" className="w-full mt-4">Register</Button>
              <div className="flex items-center mb-1 mt-4">
                <div className="flex-1 h-px bg-border" />
                <span className="mx-4 text-muted-foreground text-sm font-medium select-none">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
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
          <div className="w-full text-center text-muted-foreground text-sm mt-2">
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
