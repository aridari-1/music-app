"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, loading } = useAuth();

  const linkClass = (href: string) =>
    `text-sm transition hover:text-white ${
      pathname === href ? "text-white" : "text-white/60"
    }`;

  return (
    <header className="sticky top-0 z-50 hidden md:block border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Musique
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/" className={linkClass("/")}>
            Discover
          </Link>

          {user && role === "buyer" && (
            <Link href="/dashboard/buyer" className={linkClass("/dashboard/buyer")}>
              Library
            </Link>
          )}

          {user && role === "artist" && (
            <>
              <Link
                href="/dashboard/artist"
                className={linkClass("/dashboard/artist")}
              >
                Artist Dashboard
              </Link>
              <Link href="/upload" className={linkClass("/upload")}>
                Upload
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-24 rounded-xl bg-white/10 animate-pulse" />
          ) : user ? (
            <Link
              href={role === "artist" ? "/dashboard/artist" : "/dashboard/buyer"}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}