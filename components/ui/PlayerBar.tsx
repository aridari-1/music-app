"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  const s = Math.floor(t % 60)
    .toString()
    .padStart(2, "0");

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
      if (!dragging) {
        setProgress(audio.currentTime || 0);
      }
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

  const progressPercent = duration
    ? (progress / duration) * 100
    : 0;

  return (
    <>
      <div
        className="
          fixed bottom-0 left-0 right-0 z-50
          border-t border-white/10
          bg-gradient-to-b from-white/[0.05] to-black/90
          backdrop-blur-2xl
          shadow-[0_-10px_30px_rgba(0,0,0,0.45)]
        "
      >
        {/* 🔥 TOP GLOW */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* 🎵 PROGRESS */}
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
            aria-label="Playback position"
            className="player-range w-full h-1.5"
            style={{
              background: `
                linear-gradient(
                  to right,
                  white ${progressPercent}%,
                  rgba(255,255,255,0.12) ${progressPercent}%
                )
              `,
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-4 px-4 py-3">

          {/* 🎵 LEFT */}
          <button
            type="button"
            className="flex min-w-0 items-center gap-3 text-left"
            onClick={() => setExpanded(true)}
          >
            {/* COVER */}
            <div
              className={`
                relative h-12 w-12 overflow-hidden rounded-xl
                transition duration-700
                ${isPlaying
                  ? "scale-105 shadow-[0_0_25px_rgba(255,255,255,0.18)]"
                  : ""}
              `}
            >
              <Image
                src={coverSrc}
                alt={currentSong.title}
                fill
                sizes="48px"
                className={`
                  object-cover transition duration-700
                  ${isPlaying ? "scale-110" : ""}
                `}
              />

              {/* 🔥 PLAYING OVERLAY */}
              {isPlaying && (
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
              )}
            </div>

            {/* INFO */}
            <div className="min-w-0">

              {/* TITLE */}
              <p
                className="
                  truncate text-sm font-semibold text-white/95
                "
              >
                {currentSong.title}
              </p>

              {/* ARTIST */}
              {currentSong.artist_id ? (
                <Link
                  href={`/artist/${currentSong.artist_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="
                    truncate text-xs text-white/60
                    hover:text-white transition
                    block
                  "
                >
                  {currentSong.artist_name || "Unknown artist"}
                </Link>
              ) : (
                <p className="truncate text-xs text-white/60">
                  {currentSong.genre || "—"}
                </p>
              )}

              {/* ERROR */}
              {error ? (
                <p className="truncate text-[11px] text-red-300/90">
                  {error}
                </p>
              ) : null}
            </div>
          </button>

          {/* 🎛 CENTER CONTROLS */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* SHUFFLE */}
            <button
              type="button"
              onClick={toggleShuffle}
              aria-pressed={shuffle}
              className={`
                hidden sm:inline-flex
                h-10 w-10 items-center justify-center rounded-full
                transition
                ${shuffle
                  ? "text-emerald-300"
                  : "text-white/75 hover:text-white"}
              `}
            >
              <Shuffle className="h-5 w-5" />
            </button>

            {/* PREV */}
            <button
              type="button"
              onClick={prev}
              className="
                h-10 w-10 inline-flex items-center justify-center
                rounded-full text-white/85 hover:text-white transition
              "
            >
              <SkipBack className="h-5 w-5" />
            </button>

            {/* PLAY / PAUSE */}
            {isPlaying ? (
              <button
                type="button"
                onClick={pause}
                className="
                  h-12 w-12 inline-flex items-center justify-center
                  rounded-full bg-white text-black
                  shadow-[0_0_30px_rgba(255,255,255,0.3)]
                  transition hover:scale-105
                "
              >
                <Pause className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  audio
                    ? resume()
                    : toggle({ song: currentSong })
                }
                disabled={loading}
                className="
                  h-12 w-12 inline-flex items-center justify-center
                  rounded-full bg-white text-black
                  shadow-[0_0_30px_rgba(255,255,255,0.3)]
                  transition hover:scale-105
                "
              >
                <Play className="h-5 w-5 ml-0.5" />
              </button>
            )}

            {/* NEXT */}
            <button
              type="button"
              onClick={next}
              className="
                h-10 w-10 inline-flex items-center justify-center
                rounded-full text-white/85 hover:text-white transition
              "
            >
              <SkipForward className="h-5 w-5" />
            </button>

            {/* REPEAT */}
            <button
              type="button"
              onClick={cycleRepeat}
              className={`
                hidden sm:inline-flex
                h-10 w-10 items-center justify-center rounded-full
                transition
                ${repeat !== "off"
                  ? "text-emerald-300"
                  : "text-white/75 hover:text-white"}
              `}
            >
              <RepeatIcon className="h-5 w-5" />
            </button>
          </div>

          {/* 🔊 RIGHT */}
          <div className="hidden md:flex items-center gap-3 text-xs text-white/60">

            <span className="tabular-nums">
              {formatTime(progress)}
            </span>

            <span>/</span>

            <span className="tabular-nums">
              {formatTime(duration)}
            </span>

            {/* VOLUME */}
            <div className="ml-3 flex items-center gap-2">

              <button
                type="button"
                onClick={toggleMute}
                className="
                  h-9 w-9 inline-flex items-center justify-center
                  rounded-full text-white/75 hover:text-white transition
                "
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) =>
                  setVolume(Number(e.target.value))
                }
                className="player-range w-28"
                style={{
                  background: `
                    linear-gradient(
                      to right,
                      white ${(muted ? 0 : volume) * 100}%,
                      rgba(255,255,255,0.12) ${(muted ? 0 : volume) * 100}%
                    )
                  `,
                }}
              />
            </div>
          </div>

          {/* 📱 MOBILE EXPAND */}
          <button
            type="button"
            className="
              md:hidden inline-flex h-10 w-10
              items-center justify-center rounded-full
              text-white/80 hover:text-white transition
            "
            onClick={() => setExpanded(true)}
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 🔥 FULL PLAYER */}
      {expanded ? (
        <Player onClose={() => setExpanded(false)} />
      ) : null}
    </>
  );
}