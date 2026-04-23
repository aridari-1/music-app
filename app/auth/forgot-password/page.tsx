"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) return;

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    setLoading(false);

    if (!error) {
      setSent(true);
    } else {
      alert(error.message);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10">

        <h1 className="text-2xl font-semibold mb-4">
          Reset password
        </h1>

        {sent ? (
          <p className="text-green-400">
            Check your email for reset link.
          </p>
        ) : (
          <>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded-xl bg-white/10 border border-white/10 mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl bg-white text-black"
            >
              {loading ? "..." : "Send reset link"}
            </button>
          </>
        )}

      </div>
    </main>
  );
}