"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import usePlayer from "@/hooks/usePlayer";
import BuyButton from "@/components/ui/BuyButton";

export default function SongCard({
  song,
  owned,
}: {
  song: any;
  owned: boolean;
}) {
  const router = useRouter();

  const {
    play,
    pause,
    currentSongId,
    isPlaying,
    loading: playerLoading,
  } = usePlayer();

  const isCurrent = currentSongId === song.id;
  const isActive = isCurrent && isPlaying;

  const goToSong = () => {
    if (!song?.id) return;
    router.push(`/song/${song.id}`);
  };

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!song?.id) return;

    if (!owned) {
      router.push(`/auth/login?redirect=/song/${song.id}`);
      return;
    }

    if (isCurrent && isPlaying) {
      pause();
    } else {
      play(song);
    }
  };

  return (
    <div className="block">
      <div
        className={`group relative transition duration-300 ${
          isActive ? "scale-[1.04]" : "hover:scale-[1.04]"
        }`}
      >
        {/* 🔥 ACTIVE GLOW */}
        <div
          className={`absolute inset-0 rounded-2xl transition duration-500 ${
            isActive
              ? "bg-white/10 blur-xl opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }`}
        />

        {/* 🖼️ COVER */}
        <div
          onClick={goToSong}
          className="relative overflow-hidden rounded-2xl cursor-pointer"
        >
          <img
            src={song.cover_signed_url || "/placeholder.png"}
            alt={song.title}
            className="w-full aspect-square object-cover transition duration-500 group-hover:scale-110"
          />

          {/* ▶ PLAY BUTTON */}
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

          {/* 🔊 EQUALIZER */}
          {isActive && (
            <div className="absolute top-3 left-3 player-eq">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        {/* 🎵 INFO */}
        <div className="mt-3 px-1 space-y-1">
          {/* TITLE */}
          <p
            onClick={goToSong}
            className={`text-[14px] sm:text-[15px] font-semibold leading-snug cursor-pointer ${
              isActive ? "text-white" : "text-white/90"
            }`}
          >
            {song.title}
          </p>

          {/* 🎤 ARTIST */}
          {song.artist_id && (
            <Link
              href={`/artist/${song.artist_id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-white/60 hover:text-white transition block"
            >
              {song.artist_name || "Unknown artist"}
            </Link>
          )}

          {/* 🎼 GENRE */}
          {song.genre && (
            <p className="text-xs text-white/50">{song.genre}</p>
          )}

          {/* 💰 BUY BUTTON (FINAL FIX) */}
          {!owned && (
            <div
              className="mt-3"
              onClick={(e) => e.stopPropagation()} // 🔥 CRITICAL FIX
            >
              <BuyButton songId={song.id} price={song.price} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}