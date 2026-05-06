"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ProcessingContent() {
  const router = useRouter();
  const params = useSearchParams();
  const reference = params.get("reference");

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

        if (data.success) {
          clearInterval(interval);

          setTimeout(() => {
            router.push("/dashboard/buyer");
          }, 1000);
        }

        // ⏱ stop after ~30 sec
        if (attempts >= 15) {
          clearInterval(interval);
        }

      } catch (error) {
        console.error("VERIFY POLLING ERROR:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [reference, router]);

  return (
    <main className="min-h-screen flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />

        <p className="text-white/70">
          Processing payment...
        </p>
      </div>
    </main>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center text-white">
          Loading...
        </main>
      }
    >
      <ProcessingContent />
    </Suspense>
  );
}