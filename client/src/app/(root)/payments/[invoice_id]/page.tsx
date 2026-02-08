"use client";

import { use } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useGetPaymentStatusQuery } from "@/features/api/paymentsApi";
import PaymentSuccess from "@/components/payment/PaymentSuccess";
import PaymentFailed from "@/components/payment/PaymentFailed";

export default function PaymentStatusPage({
  params,
}: {
  params: Promise<{ invoice_id: string }>;
}) {
  const { invoice_id } = use(params);
  const {
    data: paymentStatusData,
    isLoading,
    isError,
  } = useGetPaymentStatusQuery(invoice_id, {
    skip: !invoice_id,
  });

  // Determine payment status
  const paymentStatus = paymentStatusData?.data?.status?.toUpperCase();
  const isSuccess = paymentStatus === "SUCCESS" || paymentStatus === "COMPLETED" || paymentStatus === "PAID";
  const isFailed = paymentStatus === "CANCELED" || paymentStatus === "FAILED" || paymentStatus === "CANCELLED";

  // Determine background gradient based on status
  const getBackgroundGradient = () => {
    if (isLoading) {
      return "from-blue-50 via-white to-blue-100";
    }
    if (isError) {
      return "from-yellow-50 via-white to-yellow-100";
    }
    if (isSuccess) {
      return "from-green-50 via-white to-green-100";
    }
    if (isFailed) {
      return "from-red-50 via-white to-red-100";
    }
    return "from-gray-50 via-white to-gray-100";
  };

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${getBackgroundGradient()} px-4 py-12`}
    >
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
          className="bg-card/95 border border-blue-200 shadow-blue-100 rounded-2xl p-10 max-w-md w-full flex flex-col items-center text-center"
        >
          <div className="mb-6 flex flex-col items-center">
            <span className="inline-flex items-center justify-center rounded-full bg-blue-100 p-4 mb-4">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            </span>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl font-bold mb-2 text-foreground"
            >
              Checking Payment Status...
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-muted-foreground text-lg"
            >
              Please wait while we verify your payment status.
            </motion.p>
          </div>
        </motion.div>
      ) : isError ? (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
          className="bg-card/95 border border-yellow-200 shadow-yellow-100 rounded-2xl p-10 max-w-md w-full flex flex-col items-center text-center"
        >
          <div className="mb-6 flex flex-col items-center">
            <span className="inline-flex items-center justify-center rounded-full bg-yellow-100 p-4 mb-4">
              <Loader2 className="w-16 h-16 text-yellow-600" />
            </span>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl font-bold mb-2 text-foreground"
            >
              Unable to Verify Payment
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-muted-foreground text-lg mb-4"
            >
              We couldn't retrieve your payment status. Please check your payment history or contact support.
            </motion.p>
          </div>
        </motion.div>
      ) : isSuccess ? (
        <PaymentSuccess />
      ) : isFailed ? (
        <PaymentFailed />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
          className="bg-card/95 border border-gray-200 shadow-gray-100 rounded-2xl p-10 max-w-md w-full flex flex-col items-center text-center"
        >
          <div className="mb-6 flex flex-col items-center">
            <span className="inline-flex items-center justify-center rounded-full bg-gray-100 p-4 mb-4">
              <Loader2 className="w-16 h-16 text-gray-600" />
            </span>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl font-bold mb-2 text-foreground"
            >
              Payment Status Unknown
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-muted-foreground text-lg mb-4"
            >
              Status: {paymentStatus || "Unknown"}
            </motion.p>
          </div>
        </motion.div>
      )}
    </main>
  );
}
