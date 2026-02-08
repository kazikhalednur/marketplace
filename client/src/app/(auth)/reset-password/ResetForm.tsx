"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";
import { useResetPasswordMutation } from "@/features/api/apiSlice";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Key, Sparkles } from "lucide-react";
import React, { useState } from "react";

function checkStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;
  if (score >= 4) return "Strong";
  if (score === 3) return "Medium";
  return "Weak";
}

function generatePassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~";
  let pass = "";
  for (let i = 0; i < 14; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

export default function ResetForm({ email, code, onSuccess, onBack }: { email: string; code: string; onSuccess: () => void; onBack: () => void }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState(false);
  const [resetPassword, { isLoading, isSuccess, isError, error, data }] = useResetPasswordMutation();
  const { showToast } = useToast();

  const isValid = newPassword.length >= 6 && newPassword === confirmPassword;
  const errorMsg =
    !isValid && touched ? (newPassword.length < 6 ? "Password must be at least 6 characters." : "Passwords do not match.") :
    isError && error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && error.data && 'message' in error.data ? String(error.data.message) :
    undefined;

  // Show toast on error or success
  React.useEffect(() => {
    if (isError && errorMsg) {
      showToast({ type: "error", message: errorMsg });
    }
    if (isSuccess && data?.message) {
      showToast({ type: "success", message: data.message });
    }
  }, [isError, isSuccess, errorMsg, data, showToast]);

  const passwordStrength = checkStrength(newPassword);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col items-center"
    >
      <span className="inline-flex items-center justify-center rounded-full bg-blue-100 p-4 mb-4">
        <Key className="w-12 h-12 text-blue-600 animate-pulse" />
      </span>
      <h2 className="text-2xl font-bold mb-2">Set New Password</h2>
      <p className="text-muted-foreground mb-6">Enter your new password below.</p>
      <form
        className="w-full flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setTouched(true);
          if (!isValid) return;
          const res = await resetPassword({ email, code, new_password: newPassword, confirm_password: confirmPassword });
          if ('data' in res && res.data?.success) {
            onSuccess();
          }
        }}
      >
        <div className="relative flex items-center">
          <Input
            type={showNew ? "text" : "password"}
            placeholder="New password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            onBlur={() => setTouched(true)}
            disabled={isLoading || isSuccess}
            required
            className="pl-10 pr-20"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            <Key className="text-muted-foreground" size={20} />
          </span>
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
            onClick={() => setShowNew((v) => !v)}
            aria-label={showNew ? "Hide password" : "Show password"}
          >
            {showNew ? <EyeOff size={20} className="w-5 h-5" /> : <Eye size={20} className="w-5 h-5" />}
          </button>
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
            onClick={() => setNewPassword(generatePassword())}
            aria-label="Generate strong password"
          >
            <Sparkles size={20} className="w-5 h-5" />
          </button>
        </div>
        {/* Password strength checker label */}
        {newPassword && (
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
        <div className="relative flex items-center">
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            onBlur={() => setTouched(true)}
            disabled={isLoading || isSuccess}
            required
            className="pl-10 pr-10"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            <Key className="text-muted-foreground" size={20} />
          </span>
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff size={20} className="w-5 h-5" /> : <Eye size={20} className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex gap-2 mt-2">
          <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading || isSuccess}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
} 