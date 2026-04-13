"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function BottomNav() {
  const pathname = usePathname();
  const { user, role } = useAuth();

  // ✅ Better active detection
  const isActive = (href: string) => pathname.startsWith(href);

  const itemClass = (href: string) =>
    `flex flex-col items-center justify-center gap-1 text-xs transition ${
      isActive(href) ? "text-white" : "text-white/55"
    }`;

  const dashboardHref =
    role === "artist" ? "/dashboard/artist" : "/dashboard/buyer";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/90 backdrop-blur-xl md:hidden">
      <div className="grid h-16 grid-cols-4">

        {/* 🏠 HOME */}
        <Link href="/" className={itemClass("/")}>
          <span>Home</span>
        </Link>

        {/* 🎧 LIBRARY */}
        {user ? (
          <Link href={dashboardHref} className={itemClass("/dashboard")}>
            <span>Library</span>
          </Link>
        ) : (
          <Link href="/auth/login" className={itemClass("/auth")}>
            <span>Library</span>
          </Link>
        )}

        {/* ⬆️ UPLOAD / BROWSE */}
        {user && role === "artist" ? (
          <Link href="/upload" className={itemClass("/upload")}>
            <span>Upload</span>
          </Link>
        ) : (
          <Link href="/" className={itemClass("/")}>
            <span>Browse</span>
          </Link>
        )}

        {/* 👤 ACCOUNT */}
        {user ? (
          <Link href={dashboardHref} className={itemClass("/dashboard")}>
            <span>Account</span>
          </Link>
        ) : (
          <Link href="/auth/sign-up" className={itemClass("/auth")}>
            <span>Account</span>
          </Link>
        )}

      </div>
    </nav>
  );
}