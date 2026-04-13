"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { Home, Music, Upload, LayoutDashboard, Search } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const { user, role } = useAuth();

  const isActive = (href: string) =>
    pathname.startsWith(href);

  const itemClass = (href: string) =>
    `flex flex-col items-center justify-center gap-1 text-[11px] transition ${
      isActive(href)
        ? "text-white"
        : "text-white/50 hover:text-white"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/80 backdrop-blur-xl md:hidden">
      <div
        className={`grid h-16 ${
          role === "artist" ? "grid-cols-4" : "grid-cols-3"
        }`}
      >
        {/* 🏠 HOME */}
        <Link href="/" className={itemClass("/")}>
          <Home size={20} />
          <span>Home</span>
        </Link>

        {/* 🎧 BUYER: MY MUSIC */}
        {role !== "artist" && (
          <Link
            href="/dashboard/buyer"
            className={itemClass("/dashboard")}
          >
            <Music size={20} />
            <span>My Music</span>
          </Link>
        )}

        {/* 🎤 ARTIST: UPLOAD */}
        {role === "artist" && (
          <Link href="/upload" className={itemClass("/upload")}>
            <Upload size={20} />
            <span>Upload</span>
          </Link>
        )}

        {/* 🎤 ARTIST: DASHBOARD */}
        {role === "artist" && (
          <Link
            href="/dashboard/artist"
            className={itemClass("/dashboard")}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
        )}

        {/* 🔍 SEARCH (ALL USERS) */}
        <Link href="/search" className={itemClass("/search")}>
          <Search size={20} />
          <span>Search</span>
        </Link>
      </div>
    </nav>
  );
}