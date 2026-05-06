"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ProcessingPage() {
  const router = useRouter();
  const params = useSearchParams();

  const reference = params.get("reference");

  const [status, setStatus] = useState<
    "processing" | "success" | "timeout"
  >("processing");

  useEffect(() => {
    if (!reference) return;

    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const res = await fetch(
          `/api/paystack/verify?reference=${reference}`,
          {
            cache: "no-store",
          }
        );

        const data = await res.json();

        // ✅ PURCHASE FOUND
        if (data.success) {
          clearInterval(interval);

          setStatus("success");

          // 🎧 SMALL DELAY FOR UX
          setTimeout(() => {
            router.push("/dashboard/buyer");
          }, 1200);
        }

        // ⏱️ STOP AFTER ~30 SECONDS
        if (attempts >= 15) {
          clearInterval(interval);
          setStatus("timeout");
        }

      } catch (error) {
        console.error("VERIFY POLLING ERROR:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [reference, router]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="flex flex-col items-center text-center">

        {/* 🔄 PROCESSING */}
        {status === "processing" && (
          <>
            <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mb-6" />

            <h1 className="text-2xl font-semibold mb-2">
              Processing payment...
            </h1>

            <p className="text-white/60 max-w-sm">
              Please wait while we confirm your payment and unlock your song.
            </p>
          </>
        )}

        {/* ✅ SUCCESS */}
        {status === "success" && (
          <>
            <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-2xl mb-6">
              ✓
            </div>

            <h1 className="text-2xl font-semibold mb-2 text-green-400">
              Payment successful
            </h1>

            <p className="text-white/60">
              Your song has been unlocked.
            </p>
          </>
        )}

        {/* ⏱️ TIMEOUT */}
        {status === "timeout" && (
          <>
            <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-2xl mb-6">
              !
            </div>

            <h1 className="text-2xl font-semibold mb-2 text-red-400">
              Still processing
            </h1>

            <p className="text-white/60 max-w-sm mb-6">
              Your payment may still be processing. Please check your library in a few moments.
            </p>

            <button
              onClick={() => router.push("/dashboard/buyer")}
              className="px-6 py-3 rounded-full bg-white text-black font-medium hover:opacity-90 transition"
            >
              Go to library
            </button>
          </>
        )}

      </div>
    </main>
  );
}