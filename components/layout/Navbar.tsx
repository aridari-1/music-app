"use client";

import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 border-b border-white/10 bg-black/70 backdrop-blur-xl sticky top-0 z-50">

      {/* 🔥 LOGO */}
      <Link
        href="/"
        className="text-lg sm:text-xl font-semibold tracking-tight"
      >
        Musique
      </Link>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-3 sm:gap-4">

        {/* 🌍 LANGUAGE */}
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>

        {user ? (
          <Link
            href="/account"
            className="text-white/80 hover:text-white transition text-sm sm:text-base"
          >
            Account
          </Link>
        ) : (
          <div className="flex items-center gap-2">

            <Link
              href="/auth/login"
              className="text-white/70 hover:text-white text-sm"
            >
              Login
            </Link>

            <Link
              href="/auth/signup"
              className="bg-white text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:opacity-90 transition"
            >
              Sign Up
            </Link>

          </div>
        )}
      </div>
    </header>
  );
}