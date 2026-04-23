"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!password || password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    // ✅ SUCCESS → AUTO REDIRECT
   const { data: userData } = await supabase.auth.getUser();

const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", userData.user?.id)
  .single();

if (profile?.role === "artist") {
  router.push("/dashboard/artist");
} else {
  router.push("/dashboard/buyer");
} // default
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative overflow-hidden">

      {/* 🌌 GLOW */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-500/20 blur-3xl rounded-full" />

      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative z-10">

        <h1 className="text-2xl font-semibold mb-2">
          Set new password
        </h1>

        <p className="text-white/60 mb-6">
          Enter a new password to access your account.
        </p>

        <div className="space-y-4">

          <input
            type="password"
            placeholder="New password"
            className="w-full p-3 rounded-xl bg-white/10 border border-white/10 outline-none focus:border-white/30"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleUpdate}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-medium transition ${
              loading
                ? "bg-white/50 text-black"
                : "bg-gradient-to-r from-purple-500 to-blue-600 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {loading ? "Updating..." : "Update password"}
          </button>

        </div>

      </div>
    </main>
  );
}