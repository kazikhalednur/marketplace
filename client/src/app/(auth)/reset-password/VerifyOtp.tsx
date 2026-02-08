"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useVerifyOtpMutation } from "@/features/api/apiSlice";

export default function VerifyOtp({ email, onSuccess, onBack }: { email: string; onSuccess: (code: string) => void; onBack: () => void }) {
  const [code, setCode] = useState("");
  const [touched, setTouched] = useState(false);
  const [verifyOtp, { isLoading, isSuccess, isError, error, data }] = useVerifyOtpMutation();

  const isValid = code.length >= 4; // Accept 4+ chars for flexibility
  const errorMsg =
    !isValid && touched ? "Please enter the code sent to your email." :
    isError && error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && error.data && 'message' in error.data ? String(error.data.message) :
    undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col items-center"
    >
      <span className="inline-flex items-center justify-center rounded-full bg-blue-100 p-4 mb-4">
        <Lock className="w-12 h-12 text-blue-600 animate-pulse" />
      </span>
      <h2 className="text-2xl font-bold mb-2">Enter Verification Code</h2>
      <p className="text-muted-foreground mb-6">Check your email for a code and enter it below.</p>
      <form
        className="w-full flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setTouched(true);
          if (!isValid) return;
          const res = await verifyOtp({ email, code });
          if ('data' in res && res.data?.success) {
            onSuccess(code);
          }
        }}
      >
        <Input
          type="text"
          placeholder="Verification code"
          value={code}
          onChange={e => setCode(e.target.value)}
          onBlur={() => setTouched(true)}
          disabled={isLoading || isSuccess}
          required
        />
        {errorMsg && <div className="text-red-600 text-sm flex items-center gap-1"><XCircle className="w-4 h-4" />{errorMsg}</div>}
        {isSuccess && (
          <div className="text-green-600 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4 animate-bounce" />{data?.message || "Code verified!"}</div>
        )}
        <div className="flex gap-2 mt-2">
          <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading || isSuccess}>
            {isLoading ? "Verifying..." : "Verify Code"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
} 