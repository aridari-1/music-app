"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  ChevronUp,
} from "lucide-react";

import usePlayer from "@/hooks/usePlayer";
import Player from "@/components/ui/Player";

function formatTime(t: number) {
  if (!Number.isFinite(t) || t <= 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function PlayerBar() {
  const {
    currentSong,
    currentSongId,
    audio,
    isPlaying,
    loading,
    volume,
    muted,
    shuffle,
    repeat,
    toggle,
    pause,
    resume,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    error,
  } = usePlayer();

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const coverSrc = useMemo(
    () => currentSong?.cover_signed_url || "/placeholder.png",
    [currentSong?.cover_signed_url]
  );

  useEffect(() => {
    if (!audio) return;

    const onTime = () => {
      if (!dragging) setProgress(audio.currentTime || 0);
    };
    const onMeta = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
    };
  }, [audio, dragging]);

  if (!currentSong || !currentSongId) return null;

  const onSeekCommit = (v: number) => {
    if (!duration) return;
    seek(v);
  };

  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/85 backdrop-blur-xl">
        {/* Progress bar */}
        <div className="px-3 pt-2">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.25}
            value={Math.min(progress, duration || progress)}
            onChange={(e) => {
              const v = Number(e.target.value);
              setProgress(v);
            }}
            onPointerDown={() => setDragging(true)}
            onPointerUp={() => {
              setDragging(false);
              onSeekCommit(progress);
            }}
            onKeyUp={() => onSeekCommit(progress)}
            aria-label="Position de lecture"
            className="player-range w-full"
          />
        </div>

        <div className="flex items-center justify-between gap-4 px-4 py-3">
          {/* Left: track info */}
          <button
            type="button"
            className="flex min-w-0 items-center gap-3 text-left"
            onClick={() => setExpanded(true)}
            aria-label="Ouvrir le lecteur"
          >
            <div className="relative h-12 w-12 overflow-hidden rounded-lg">
              <Image
                src={coverSrc}
                alt={currentSong.title}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white/95">
                {currentSong.title}
              </p>
              <p className="truncate text-xs text-white/60">
                {currentSong.artist_name || currentSong.genre || "—"}
              </p>
              {error ? (
                <p className="truncate text-[11px] text-red-300/90">{error}</p>
              ) : null}
            </div>
          </button>

          {/* Center controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleShuffle}
              aria-label="Activer/désactiver le mode aléatoire"
              aria-pressed={shuffle}
              className={[
                "hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full",
                "text-white/75 hover:text-white transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                shuffle ? "text-emerald-300" : "",
              ].join(" ")}
            >
              <Shuffle className="h-5 w-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={prev}
              aria-label="Titre précédent"
              className="h-10 w-10 inline-flex items-center justify-center rounded-full text-white/85 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <SkipBack className="h-5 w-5" aria-hidden="true" />
            </button>

            {isPlaying ? (
              <button
                type="button"
                onClick={pause}
                aria-label="Pause"
                className="h-11 w-11 inline-flex items-center justify-center rounded-full bg-white text-black shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <Pause className="h-5 w-5" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => (audio ? resume() : toggle({ song: currentSong }))}
                aria-label="Lecture"
                className="h-11 w-11 inline-flex items-center justify-center rounded-full bg-white text-black shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                disabled={loading}
              >
                <Play className="h-5 w-5" aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              onClick={next}
              aria-label="Titre suivant"
              className="h-10 w-10 inline-flex items-center justify-center rounded-full text-white/85 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <SkipForward className="h-5 w-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={cycleRepeat}
              aria-label="Changer le mode de répétition"
              className={[
                "hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full",
                "text-white/75 hover:text-white transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                repeat !== "off" ? "text-emerald-300" : "",
              ].join(" ")}
            >
              <RepeatIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Right: time + volume (desktop) */}
          <div className="hidden md:flex items-center gap-3 text-xs text-white/60">
            <span className="tabular-nums">{formatTime(progress)}</span>
            <span>/</span>
            <span className="tabular-nums">{formatTime(duration)}</span>

            <div className="ml-3 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Réactiver le son" : "Couper le son"}
                className="h-9 w-9 inline-flex items-center justify-center rounded-full text-white/75 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-5 w-5" aria-hidden="true" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume"
                className="player-range w-28"
              />
            </div>
          </div>

          {/* Expand (mobile) */}
          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full text-white/80 hover:text-white transition"
            onClick={() => setExpanded(true)}
            aria-label="Développer le lecteur"
          >
            <ChevronUp className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {expanded ? <Player onClose={() => setExpanded(false)} /> : null}
    </>
  );
}
