"use client";

import { XCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PaymentFailed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
      className="bg-card/95 border border-red-200 shadow-red-100 rounded-2xl p-10 max-w-md w-full flex flex-col items-center text-center"
    >
      <div className="mb-6 flex flex-col items-center">
        <span className="inline-flex items-center justify-center rounded-full bg-red-100 p-4 mb-4">
          <XCircle className="w-16 h-16 text-red-600 animate-pulse" />
        </span>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold mb-2 text-foreground"
        >
          Payment Failed
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-muted-foreground text-lg mb-4"
        >
          Your payment could not be processed. The transaction was canceled or failed. Please try again.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2 mt-2"
        >
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <span>If you were charged, please contact support.</span>
        </motion.div>
      </div>
      <div className="w-full space-y-3">
        <Button asChild className="w-full" size="lg">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button asChild variant="outline" className="w-full" size="lg">
          <Link href="/my-jobs">Try Again</Link>
        </Button>
      </div>
    </motion.div>
  );
}
