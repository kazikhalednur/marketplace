"use client";

import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PaymentSuccess() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
      className="bg-card/95 border border-green-200 shadow-green-100 rounded-2xl p-10 max-w-md w-full flex flex-col items-center text-center"
    >
      <div className="mb-6 flex flex-col items-center">
        <span className="inline-flex items-center justify-center rounded-full bg-green-100 p-4 mb-4">
          <CheckCircle className="w-16 h-16 text-green-600 animate-bounce" />
        </span>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold mb-2 text-foreground"
        >
          Payment Successful!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-muted-foreground text-lg mb-4"
        >
          Your payment has been processed successfully. You can now proceed with your job posting.
        </motion.p>
      </div>
      <div className="w-full space-y-3">
        <Button asChild className="w-full" size="lg">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button asChild variant="outline" className="w-full" size="lg">
          <Link href="/my-jobs">View My Jobs</Link>
        </Button>
      </div>
    </motion.div>
  );
}
