"use client";

import { useState } from "react";
import { initiatePurchase } from "@/services/purchases";
import usePlayer from "@/hooks/usePlayer";

export default function SongCard({
  song,
  owned,
}: {
  song: any;
  owned: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const { play, pause, currentSongId, loading: playerLoading } =
    usePlayer();

  const isPlaying = currentSongId === song.id;

  const handleBuy = async () => {
    try {
      setLoading(true);

      const url = await initiatePurchase(song.id);

      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      alert(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      pause();
    } else {
      play(song.id);
    }
  };

  return (
    <div className="group card overflow-hidden shadow-lg transition">
      
      {/* 🖼️ COVER */}
      <div className="relative w-full h-48 overflow-hidden rounded-t-2xl">
        <img
          src={song.cover_signed_url || "/placeholder.png"}
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* 🎧 HOVER PLAY BUTTON */}
        {owned && (
          <button
            onClick={handlePlayToggle}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition"
          >
            <div className="bg-white text-black rounded-full px-4 py-2 text-sm font-medium shadow">
              {playerLoading && isPlaying
                ? "Loading..."
                : isPlaying
                ? "Pause"
                : "Play"}
            </div>
          </button>
        )}
      </div>

      {/* 🎵 CONTENT */}
      <div className="p-4 space-y-2">
        {/* Title */}
        <p className="font-semibold text-lg truncate">
          {song.title}
        </p>

        {/* 🎯 GENRE */}
        {song.genre && (
          <p className="text-xs text-muted">
            {song.genre}
          </p>
        )}

        {/* Price */}
        <p className="text-sm text-muted">
          ${song.price}
        </p>

        {/* 🎯 ACTION BUTTON */}
        {owned ? (
          <button
            onClick={handlePlayToggle}
            className="btn btn-primary w-full mt-2"
          >
            {playerLoading && isPlaying
              ? "Loading..."
              : isPlaying
              ? "Pause"
              : "▶ Play"}
          </button>
        ) : (
          <button
            onClick={handleBuy}
            disabled={loading}
            className="btn btn-primary w-full mt-2"
          >
            {loading ? "Processing..." : "Buy"}
          </button>
        )}
      </div>
    </div>
  );
}