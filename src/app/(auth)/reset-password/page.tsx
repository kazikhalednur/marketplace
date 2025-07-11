"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
import RequestEmail from "./RequestEmail";
import ResetForm from "./ResetForm";
import VerifyOtp from "./VerifyOtp";

export default function ResetPasswordPage() {
  // Step: 0 = email, 1 = otp, 2 = reset, 3 = done
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
        className="bg-card/95 border border-blue-200 shadow-blue-100 rounded-2xl p-10 max-w-md w-full flex flex-col items-center text-center"
      >
        <AnimatePresence mode="wait">
          {step === 0 && (
            <RequestEmail
              key="step-email"
              onSuccess={(email) => {
                setEmail(email);
                setStep(1);
              }}
            />
          )}
          {step === 1 && (
            <VerifyOtp
              key="step-otp"
              email={email}
              onSuccess={(code) => {
                setCode(code);
                setStep(2);
              }}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <ResetForm
              key="step-reset"
              email={email}
              code={code}
              onSuccess={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <motion.div
              key="step-done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <span className="inline-flex items-center justify-center rounded-full bg-green-100 p-4 mb-4">
                <CheckCircle className="w-16 h-16 text-green-600 animate-bounce" />
              </span>
              <h1 className="text-3xl font-bold mb-2">Password Reset Successful!</h1>
              <p className="text-muted-foreground text-lg mb-4">
                You can now log in with your new password.
              </p>
              <a href="/login" className="mt-4 text-blue-600 font-medium hover:underline">Go to Login</a>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
} 