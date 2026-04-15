"use client";

import { useState } from "react";
import Link from "next/link";
import usePlayer from "@/hooks/usePlayer";

export default function SongCard({
  song,
  owned,
}: {
  song: any;
  owned: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const {
    play,
    pause,
    currentSongId,
    isPlaying,
    loading: playerLoading,
  } = usePlayer();

  // 🔥 FIX
  const songId = song?.id;
  const safeHref = songId ? `/song/${songId}` : "#";

  const isCurrent = currentSongId === songId;
  const isActive = isCurrent && isPlaying;

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!songId) return;

    if (isCurrent && isPlaying) {
      pause();
    } else {
      play(song);
    }
  };

  // 🔥 FIXED BUY LOGIC (IMPORTANT)
  const handleBuy = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!songId) return;

    try {
      setLoading(true);

      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ songId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Payment failed");
        return;
      }

      // 🔥 REDIRECT TO PAYSTACK
      window.location.href = data.url;

    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link href={safeHref} className="block">
      <div
        className={`group relative cursor-pointer transition duration-300 ${
          isActive ? "scale-[1.04]" : "hover:scale-[1.04]"
        }`}
      >

        <div
          className={`absolute inset-0 rounded-2xl transition duration-500 ${
            isActive
              ? "bg-white/10 blur-xl opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }`}
        />

        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={song.cover_signed_url || "/placeholder.png"}
            alt={song.title}
            className="w-full aspect-square object-cover transition duration-500 group-hover:scale-110"
          />

          {owned && (
            <button
              onClick={handlePlayToggle}
              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition"
            >
              <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-xl">
                {playerLoading && isCurrent
                  ? "..."
                  : isCurrent && isPlaying
                  ? "❚❚"
                  : "▶"}
              </div>
            </button>
          )}

          {isActive && (
            <div className="absolute top-3 left-3 player-eq">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        <div className="mt-4 px-1 space-y-1">
          <p className="text-[15px] font-semibold leading-snug">
            {song.title}
          </p>

          {song.artist_id && (
            <Link
              href={`/artist/${song.artist_id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-white/60 hover:text-white transition block"
            >
              {song.artist_name || "Unknown artist"}
            </Link>
          )}

          {song.genre && (
            <p className="text-xs text-white/50">
              {song.genre}
            </p>
          )}

          {!owned && (
            <button
              onClick={handleBuy}
              disabled={loading || !songId}
              className="mt-3 w-full text-sm py-2.5 rounded-full bg-white text-black font-medium hover:opacity-90 transition"
            >
              {loading ? "Processing..." : `Buy $${song.price}`}
            </button>
          )}
        </div>

      </div>
    </Link>
  );
}