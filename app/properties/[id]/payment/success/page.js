"use client";

import { Suspense, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiCheckCircle, FiArrowRight } from "react-icons/fi";

function SuccessContent({ propertyId }) {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transactionId") || "N/A";

  return (
    <div className="flex-grow flex items-center justify-center py-20 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 shadow-xl text-center space-y-6"
      >
        <div className="flex justify-center">
          <span className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-full text-emerald-500 text-5xl">
            <FiCheckCircle className="animate-bounce" />
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Booking Confirmed!
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Your booking request has been submitted successfully to the property owner. You will be notified once the owner updates the request status.
          </p>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/10 space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Transaction ID
          </span>
          <code className="text-xs text-indigo-600 dark:text-indigo-400 font-bold select-all">
            {transactionId}
          </code>
        </div>

        <div className="pt-4 flex flex-col space-y-2">
          <Link
            href="/dashboard"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-1"
          >
            <span>Go to My Dashboard</span>
            <FiArrowRight />
          </Link>
          <Link
            href="/properties"
            className="w-full py-3 border border-zinc-200 dark:border-zinc-800 font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            Explore More Listings
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage({ params }) {
  const resolvedParams = use(params);
  const propertyId = resolvedParams.id;

  return (
    <Suspense
      fallback={
        <div className="flex-grow flex items-center justify-center py-20 bg-zinc-50 dark:bg-zinc-950">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <SuccessContent propertyId={propertyId} />
    </Suspense>
  );
}
