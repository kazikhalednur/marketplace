"use client";

import RegisterRolePicker from "@/components/auth/RegisterRolePicker";
import { Button } from "@/components/ui/button";
import { startGoogleOAuth } from "@/lib/googleOAuth";
import { useToast } from "@/components/ui/toast-provider";
import { useState, useEffect } from "react";
import EmployerForm from "./EmployerForm";
import StudentForm from "./StudentForm";
import GoogleClientSignupStep from "./GoogleClientSignupStep";
import { useRouter } from "next/navigation";
import { useAuth, Loader } from "@/hooks/useAuth";

type EmailRole = "student" | "employer" | null;
type GoogleSignupStep = null | "role" | "client-details";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isAuthenticated, showLoader } = useAuth();
  const [emailRole, setEmailRole] = useState<EmailRole>(null);
  const [googleStep, setGoogleStep] = useState<GoogleSignupStep>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (showLoader || isAuthenticated) return <Loader />;

  if (emailRole === "student") {
    return <StudentForm onBack={() => setEmailRole(null)} />;
  }
  if (emailRole === "employer") {
    return <EmployerForm onBack={() => setEmailRole(null)} />;
  }

  if (googleStep === "client-details") {
    return <GoogleClientSignupStep onBack={() => setGoogleStep("role")} />;
  }

  if (googleStep === "role") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-20 text-foreground">
        <RegisterRolePicker
          title="Register with Google"
          subtitle="Choose how you want to join the marketplace."
          onBack={() => setGoogleStep(null)}
          onSelectFreelancer={() => {
            try {
              startGoogleOAuth("signup-freelancer");
            } catch (err) {
              showToast({
                type: "error",
                message:
                  err instanceof Error ? err.message : "Could not start Google sign-up",
              });
            }
          }}
          onSelectClient={() => setGoogleStep("client-details")}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-20 text-foreground">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
        Join as a Freelancer or Client
      </h1>
      <RegisterRolePicker
        onSelectFreelancer={() => setEmailRole("student")}
        onSelectClient={() => setEmailRole("employer")}
      />
      <div className="flex items-center w-full max-w-xl mx-auto mt-10 mb-6 px-4">
        <hr className="flex-1 border-t border-border" />
        <span className="mx-4 text-muted-foreground text-sm font-medium select-none">or</span>
        <hr className="flex-1 border-t border-border" />
      </div>
      <div className="w-full max-w-md px-4">
        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={() => setGoogleStep("role")}
        >
          Sign up with Google
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <a href="/login" className="text-primary hover:underline font-medium">
          Login here
        </a>
      </p>
    </main>
  );
}
