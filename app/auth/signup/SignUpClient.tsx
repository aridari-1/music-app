"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageProvider";
import { signUp } from "./actions";

export default function SignUpClient() {
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("buyer");

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative overflow-hidden">

      {/* 🌌 BACKGROUND GLOW */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-500/20 blur-3xl rounded-full" />

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl relative z-10">

        {/* TITLE */}
        <h1 className="text-3xl font-semibold mb-2">
          {t.createAccount}
        </h1>

        <p className="text-white/60 mb-6">
          {t.signupSubtitle}
        </p>

        <form
          action={signUp}
          onSubmit={() => setLoading(true)}
          className="space-y-5"
        >

          {/* EMAIL */}
          <div className="relative">
            <input
              name="email"
              type="email"
              required
              placeholder=" "
              className="peer w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
            />
            <label className="absolute left-4 top-3 text-white/50 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-[-8px] peer-focus:text-xs peer-focus:text-white bg-black px-1">
              {t.email}
            </label>
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder=" "
              className="peer w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
            />
            <label className="absolute left-4 top-3 text-white/50 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-[-8px] peer-focus:text-xs peer-focus:text-white bg-black px-1">
              {t.password}
            </label>

            {/* SHOW/HIDE */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-sm text-white/60"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* ROLE SELECT (UPGRADED) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("buyer")}
              className={`p-3 rounded-xl border transition ${
                role === "buyer"
                  ? "bg-white text-black border-white"
                  : "border-white/10 text-white/70"
              }`}
            >
              {t.buyer}
            </button>

            <button
              type="button"
              onClick={() => setRole("artist")}
              className={`p-3 rounded-xl border transition ${
                role === "artist"
                  ? "bg-white text-black border-white"
                  : "border-white/10 text-white/70"
              }`}
            >
              {t.artist}
            </button>
          </div>

          {/* HIDDEN INPUT FOR ROLE */}
          <input type="hidden" name="role" value={role} />

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-medium transition ${
              loading
                ? "bg-white/50 text-black"
                : "bg-gradient-to-r from-purple-500 to-blue-600 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {loading ? "..." : t.signup}
          </button>

        </form>

        {/* LOGIN LINK */}
        <p className="text-center text-sm text-white/60 mt-6">
          {t.alreadyAccount}{" "}
          <a
            href="/auth/login"
            className="text-white underline hover:text-purple-400"
          >
            {t.login}
          </a>
        </p>

      </div>
    </main>
  );
}