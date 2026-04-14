"use client";

import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="hidden md:flex items-center justify-between px-8 h-16 border-b border-white/10 bg-black/70 backdrop-blur-xl sticky top-0 z-50">

      {/* LOGO */}
      <Link href="/" className="text-xl font-semibold tracking-tight">
        Musique
      </Link>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">

        {/* 🌍 LANGUAGE SWITCH */}
        <LanguageSwitcher />

        {user ? (
          <Link
            href="/account"
            className="text-white/80 hover:text-white transition"
          >
            Account
          </Link>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="text-white/70 hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/auth/sign-up"
              className="bg-white text-black px-4 py-2 rounded-xl text-sm"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}