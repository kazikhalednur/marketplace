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
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import {
  EmployerSignupPayload,
  useEmployerSignupMutation,
} from "@/features/api/apiSlice";
import { getErrorMessage } from "@/utils/error";
import { checkStrength, generatePassword } from "@/utils/password";
import {
  ArrowLeft,
  Building,
  Eye,
  EyeOff,
  IdCard,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/toast-provider";

export default function EmployerForm({ onBack }: { onBack?: () => void }) {
  const form = useForm<EmployerSignupPayload>({
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      phone: "",
      company_name: "",
      password: "",
      confirm_password: "",
    },
    mode: "onBlur",
  });
  const router = useRouter();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<string>("");
  const [employerSignup, { isLoading }] = useEmployerSignupMutation();
  const [googleStudentId, setGoogleStudentId] = useState("");

  // Password strength checker and generator are now imported

  const onSubmit = async (data: EmployerSignupPayload) => {
    try {
      const res = await employerSignup(data).unwrap();
      if (res?.success) {
        showToast({
          type: "success",
          message: "Registration successful! Please login.",
        });
        router.push("/login");
      } else {
        showToast({
          type: "error",
          message: res?.message || "Registration failed.",
        });
      }
    } catch (err) {
      showToast({
        type: "error",
        message: getErrorMessage(err, "Registration failed."),
      });
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
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center w-full">
            Register as Client
          </CardTitle>
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
                      <FormLabel>
                        First Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="First Name"
                            autoComplete="given-name"
                            {...field}
                            className="pl-10"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Icon
                              icon={User}
                              size={20}
                              className="text-muted-foreground"
                            />
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
                      <FormLabel>
                        Last Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Last Name"
                            autoComplete="family-name"
                            {...field}
                            className="pl-10"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Icon
                              icon={User}
                              size={20}
                              className="text-muted-foreground"
                            />
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
                    <FormLabel>
                      Username <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Username"
                          autoComplete="username"
                          {...field}
                          className="pl-10"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                          <Icon
                            icon={User}
                            size={20}
                            className="text-muted-foreground"
                          />
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
                    <FormLabel>
                      Email <span className="text-destructive">*</span>
                    </FormLabel>
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
                          <Icon
                            icon={Mail}
                            size={20}
                            className="text-muted-foreground"
                          />
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
                          <Icon
                            icon={Phone}
                            size={20}
                            className="text-muted-foreground"
                          />
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
                name="company_name"
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
                          <Icon
                            icon={Building}
                            size={20}
                            className="text-muted-foreground"
                          />
                        </span>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                rules={{ required: "Password is required" }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      Password <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          autoComplete="new-password"
                          {...field}
                          className="pl-10 pr-20"
                          onChange={(e) => {
                            field.onChange(e);
                            setPasswordStrength(checkStrength(e.target.value));
                          }}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                          <Icon
                            icon={Lock}
                            size={20}
                            className="text-muted-foreground"
                          />
                        </span>
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
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
                          onClick={() => {
                            const pwd = generatePassword();
                            form.setValue("password", pwd);
                            setPasswordStrength(checkStrength(pwd));
                          }}
                          aria-label="Generate strong password"
                        >
                          <Icon
                            icon={RefreshCw}
                            size={20}
                            className="w-5 h-5"
                          />
                        </button>
                      </div>
                    </FormControl>
                    {/* Password strength checker */}
                    {passwordStrength && (
                      <div
                        className={`mt-2 text-xs font-medium ${
                          passwordStrength === "Strong"
                            ? "text-green-600"
                            : passwordStrength === "Medium"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        Password strength: {passwordStrength}
                      </div>
                    )}
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm_password"
                rules={{ required: "Please confirm your password" }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      Confirm Password{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm Password"
                          autoComplete="new-password"
                          {...field}
                          className="pl-10 pr-10"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                          <Icon
                            icon={Lock}
                            size={20}
                            className="text-muted-foreground"
                          />
                        </span>
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
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
              <Button
                type="submit"
                className="w-full mt-4"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-0 pb-6 sm:px-8 px-4">
          <div className="flex items-center w-full mb-1 mt-2">
            <hr className="flex-1 border-t border-border" />
            <span className="mx-4 text-muted-foreground text-sm font-medium select-none">or</span>
            <hr className="flex-1 border-t border-border" />
          </div>
          <div>
            <label htmlFor="client-google-student-id" className="text-sm font-medium">
              Student ID <span className="text-destructive">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-2">Required for Google registration.</p>
            <div className="relative">
              <Input
                id="client-google-student-id"
                placeholder="222-15-6390"
                autoComplete="off"
                value={googleStudentId}
                onChange={(e) => setGoogleStudentId(e.target.value)}
                className="pl-10"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                <Icon icon={IdCard} size={20} className="text-muted-foreground" />
              </span>
            </div>
          </div>
          <GoogleSignInButton
            flow="signup-client"
            studentId={googleStudentId}
            disabled={!googleStudentId.trim()}
          />
          <div className="w-full text-center text-muted-foreground text-sm mt-2">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Login here
            </a>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
