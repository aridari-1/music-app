"use client";

import { Play, Pause, Loader2 } from "lucide-react";
import usePlayer, { Song } from "@/hooks/usePlayer";

type Props = {
  song: Song;
  queue?: Song[];
  contextId?: string;
  variant?: "primary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export default function PlayButton({
  song,
  queue,
  contextId,
  variant = "primary",
  size = "md",
  className = "",
}: Props) {
  const { toggle, currentSongId, isPlaying, loading } = usePlayer();

  const isCurrent = currentSongId === song.id;
  const active = isCurrent && isPlaying;

  const sizeCls =
    size === "lg"
      ? "h-12 px-6 text-base"
      : size === "sm"
      ? "h-9 px-4 text-sm"
      : "h-11 px-5 text-sm";

  const variantCls =
    variant === "ghost"
      ? "bg-white/8 text-white hover:bg-white/12 border border-white/12"
      : "bg-white text-black hover:opacity-95";

  return (
    <button
      type="button"
      onClick={() => toggle({ song, queue, contextId })}
      disabled={loading && isCurrent}
      aria-label={active ? "Mettre en pause" : "Lire le titre"}
      aria-pressed={active}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        sizeCls,
        variantCls,
        className,
      ].join(" ")}
    >
      {loading && isCurrent ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : active ? (
        <Pause className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Play className="h-4 w-4" aria-hidden="true" />
      )}

      {loading && isCurrent ? "Chargement…" : active ? "Pause" : "Lecture"}
    </button>
  );
}
