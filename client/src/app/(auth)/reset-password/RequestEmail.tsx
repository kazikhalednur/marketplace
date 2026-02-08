"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";
import { useSendPasswordResetMailMutation } from "@/features/api/apiSlice";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useState } from "react";

export default function RequestEmail({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [sendMail, { isLoading }] = useSendPasswordResetMailMutation();
  const { showToast } = useToast();

  const isValid = email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col items-center"
    >
      <span className="inline-flex items-center justify-center rounded-full bg-blue-100 p-4 mb-4">
        <Mail className="w-12 h-12 text-blue-600 animate-pulse" />
      </span>
      <h2 className="text-2xl font-bold mb-2">Reset Your Password</h2>
      <p className="text-muted-foreground mb-6">Enter your email address to receive a password reset code.</p>
      <form
        className="w-full flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!isValid) return;
          const res = await sendMail({ email });
          if ('data' in res && res.data?.success) {
            showToast({ type: 'success', message: res.data.message || 'Email sent!' });
            onSuccess(email);
          } else if (
            'error' in res &&
            res.error &&
            typeof res.error === 'object' &&
            'data' in res.error &&
            res.error.data &&
            typeof res.error.data === 'object' &&
            'message' in res.error.data
          ) {
            showToast({ type: 'error', message: String((res.error.data as { message?: string }).message) });
          }
        }}
      >
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
        <Button type="submit" className="w-full mt-2" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Email"}
        </Button>
      </form>
    </motion.div>
  );
} 