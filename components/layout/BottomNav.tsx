"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function BottomNav() {
  const pathname = usePathname();
  const { user, role } = useAuth();

  const itemClass = (href: string) =>
    `flex flex-col items-center justify-center gap-1 text-xs ${
      pathname === href ? "text-white" : "text-white/55"
    }`;

  const dashboardHref =
    role === "artist" ? "/dashboard/artist" : "/dashboard/buyer";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/90 backdrop-blur-xl md:hidden">
      <div className="grid h-16 grid-cols-4">
        <Link href="/" className={itemClass("/")}>
          <span>Home</span>
        </Link>

        {user ? (
          <Link href={dashboardHref} className={itemClass(dashboardHref)}>
            <span>Library</span>
          </Link>
        ) : (
          <Link href="/auth/login" className={itemClass("/auth/login")}>
            <span>Library</span>
          </Link>
        )}

        {user && role === "artist" ? (
          <Link href="/upload" className={itemClass("/upload")}>
            <span>Upload</span>
          </Link>
        ) : (
          <Link href="/" className={itemClass("/")}>
            <span>Browse</span>
          </Link>
        )}

        {user ? (
          <Link href={dashboardHref} className={itemClass(dashboardHref)}>
            <span>Account</span>
          </Link>
        ) : (
          <Link href="/auth/sign-up" className={itemClass("/auth/sign-up")}>
            <span>Account</span>
          </Link>
        )}
      </div>
    </nav>
  );
}