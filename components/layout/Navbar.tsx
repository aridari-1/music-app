"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageProvider";

export default function Navbar() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "h-14 bg-black/80 backdrop-blur-xl border-b border-white/10"
            : "h-16 bg-black/60 backdrop-blur-lg"
        } flex items-center justify-between px-4 sm:px-6 lg:px-8`}
      >

        {/* 🔥 LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo.png"
            alt="logo"
            width={34}
            height={34}
            className="object-contain transition group-hover:scale-110 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]"
            priority
          />

          <span className="text-sm sm:text-lg font-semibold tracking-tight bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Naluma Music
          </span>
        </Link>

        {/* 💻 DESKTOP */}
        <div className="hidden md:flex items-center gap-6">
          <LanguageSwitcher />

          {user ? (
            <Link
              href="/account"
              className="text-white/80 hover:text-white transition"
            >
              {t.account}
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-white/70 hover:text-white"
              >
                {t.login}
              </Link>

              <Link
                href="/auth/signup"
                className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition"
              >
                {t.signup}
              </Link>
            </>
          )}
        </div>

        {/* 📱 MOBILE BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1.5"
        >
          <span className="w-6 h-[2px] bg-white"></span>
          <span className="w-6 h-[2px] bg-white"></span>
          <span className="w-6 h-[2px] bg-white"></span>
        </button>
      </header>

      {/* 📱 MOBILE MENU */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* 🔥 BACKDROP (CLICK TO CLOSE) */}
        <div
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        />

        {/* MENU CONTENT */}
        <div
          className={`relative z-50 flex flex-col items-center justify-center h-full gap-8 text-lg transform transition duration-300 ${
            open ? "translate-y-0" : "translate-y-10"
          }`}
        >

          {/* ❌ CLOSE BUTTON */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-6 right-6 text-white text-2xl"
          >
            ✕
          </button>

          {/* 🔥 BRAND */}
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="logo" width={40} height={40} />
            <span className="text-xl font-semibold">Naluma</span>
          </div>

          <LanguageSwitcher />

          {user ? (
            <Link href="/account" onClick={() => setOpen(false)}>
              {t.account}
            </Link>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setOpen(false)}>
                {t.login}
              </Link>

              <Link
                href="/auth/signup"
                onClick={() => setOpen(false)}
                className="bg-white text-black px-6 py-3 rounded-full"
              >
                {t.signup}
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}