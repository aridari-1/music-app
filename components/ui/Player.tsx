"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
} from "lucide-react";

import usePlayer from "@/hooks/usePlayer";

function formatTime(t: number) {
  if (!Number.isFinite(t) || t <= 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function Player({ onClose }: { onClose: () => void }) {
  const {
    currentSong,
    audio,
    isPlaying,
    loading,
    volume,
    muted,
    shuffle,
    repeat,
    queue,
    currentIndex,
    pause,
    resume,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    toggle,
  } = usePlayer();

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const coverSrc = useMemo(
    () => currentSong?.cover_signed_url || "/placeholder.png",
    [currentSong?.cover_signed_url]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!audio) return;

    const onTime = () => setProgress(audio.currentTime || 0);
    const onMeta = () => setDuration(audio.duration || 0);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
    };
  }, [audio]);

  if (!currentSong) return null;

  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Lecteur"
    >
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-5 pb-10 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white/80">En lecture</p>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/80 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Cover */}
        <div className="mt-6 flex justify-center">
          <div className="relative w-full max-w-[420px]">
            <div className="absolute inset-0 scale-95 rounded-[34px] bg-fuchsia-500/16 blur-2xl" />
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/5 p-3">
              <div className="relative aspect-square w-full overflow-hidden rounded-[26px]">
                <Image
                  src={coverSrc}
                  alt={currentSong.title}
                  fill
                  sizes="(max-width: 768px) 88vw, 420px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Infos */}
        <div className="mt-6 text-center">
          <h2 className="text-xl font-semibold text-white/95">
            {currentSong.title}
          </h2>
          <p className="mt-1 text-sm text-white/60">
            {currentSong.artist_name || currentSong.genre || "—"}
          </p>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.25}
            value={Math.min(progress, duration || progress)}
            onChange={(e) => setProgress(Number(e.target.value))}
            onPointerUp={() => seek(progress)}
            onKeyUp={() => seek(progress)}
            aria-label="Position de lecture"
            className="player-range w-full"
          />

          <div className="mt-2 flex justify-between text-xs text-white/60 tabular-nums">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={toggleShuffle}
            aria-label="Mode aléatoire"
            aria-pressed={shuffle}
            className={[
              "h-11 w-11 inline-flex items-center justify-center rounded-full text-white/80 hover:text-white transition",
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
            className="h-12 w-12 inline-flex items-center justify-center rounded-full text-white/90 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <SkipBack className="h-6 w-6" aria-hidden="true" />
          </button>

          {isPlaying ? (
            <button
              type="button"
              onClick={pause}
              aria-label="Pause"
              className="h-14 w-14 inline-flex items-center justify-center rounded-full bg-white text-black shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <Pause className="h-6 w-6" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => (audio ? resume() : toggle({ song: currentSong }))}
              aria-label="Lecture"
              disabled={loading}
              className="h-14 w-14 inline-flex items-center justify-center rounded-full bg-white text-black shadow-xl disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <Play className="h-6 w-6" aria-hidden="true" />
            </button>
          )}

          <button
            type="button"
            onClick={next}
            aria-label="Titre suivant"
            className="h-12 w-12 inline-flex items-center justify-center rounded-full text-white/90 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <SkipForward className="h-6 w-6" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={cycleRepeat}
            aria-label="Répétition"
            className={[
              "h-11 w-11 inline-flex items-center justify-center rounded-full text-white/80 hover:text-white transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
              repeat !== "off" ? "text-emerald-300" : "",
            ].join(" ")}
          >
            <RepeatIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Volume */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Réactiver le son" : "Couper le son"}
            className="h-11 w-11 inline-flex items-center justify-center rounded-full text-white/80 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
            className="player-range w-64 max-w-[70vw]"
          />
        </div>

        {/* Queue (simple) */}
        {queue.length > 0 ? (
          <div className="mt-8">
            <p className="text-sm font-semibold text-white/80">
              File d’attente
            </p>
            <div className="mt-3 max-h-[22vh] overflow-auto rounded-2xl border border-white/10 bg-white/[0.04] p-2">
              {queue.map((s, idx) => {
                const active = idx === currentIndex;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggle({ song: s })}
                    className={[
                      "w-full rounded-xl px-3 py-2 text-left transition",
                      "hover:bg-white/8",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-offset-black",
                      active ? "bg-white/10" : "",
                    ].join(" ")}
                    aria-label={`Lire ${s.title}`}
                  >
                    <p className="truncate text-sm font-semibold text-white/90">
                      {s.title}
                    </p>
                    <p className="truncate text-xs text-white/55">
                      {s.artist_name || s.genre || "—"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
