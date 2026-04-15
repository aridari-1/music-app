"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Pause, Loader2 } from "lucide-react";

import usePlayer, { Song } from "@/hooks/usePlayer";
import { initiatePurchase } from "@/services/purchases";

type Props = {
  song: Song;
  owned: boolean;

  // Pour activer une file d’attente type "Trending"
  queue?: Song[];
  contextId?: string; // ex: "trending" | "new"
};

export default function SongCard({ song, owned, queue, contextId }: Props) {
  const [buyLoading, setBuyLoading] = useState(false);

  const {
    toggle,
    currentSongId,
    isPlaying,
    loading: playerLoading,
  } = usePlayer();

  const isCurrent = currentSongId === song.id;
  const active = isCurrent && isPlaying;

  const coverSrc = useMemo(
    () => song.cover_signed_url || "/placeholder.png",
    [song.cover_signed_url]
  );

  const meta = song.artist_name || song.genre || "—";

  const onBuy = async () => {
    try {
      setBuyLoading(true);
      const url = await initiatePurchase(song.id);
      if (url) window.location.href = url;
    } catch (e: any) {
      alert(e?.message || "Paiement impossible.");
    } finally {
      setBuyLoading(false);
    }
  };

  return (
    <article
      className={[
        "group relative h-full",
        "rounded-2xl border border-white/10 bg-white/[0.035] p-3",
        "backdrop-blur-xl shadow-[0_18px_60px_-30px_rgba(0,0,0,0.85)]",
        "transition hover:bg-white/[0.06] hover:border-white/14",
        active ? "ring-1 ring-emerald-400/60" : "",
      ].join(" ")}
      aria-label={`Titre: ${song.title}`}
      data-playing={active ? "true" : "false"}
    >
      {/* Cover */}
      <div className="relative overflow-hidden rounded-xl">
        <Link
          href={`/song/${song.id}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-xl"
          aria-label={`Ouvrir la page du titre ${song.title}`}
        >
          <div className="relative aspect-square w-full">
            <Image
              src={coverSrc}
              alt={song.title}
              fill
              sizes="(max-width: 640px) 176px, (max-width: 1024px) 220px, 260px"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              // Important: si vos covers sont en signed URL courts, préférez bucket public + URL stable (voir section perf).
              priority={false}
            />
          </div>
        </Link>

        {/* Badge "en lecture" */}
        {active && (
          <div
            className="absolute left-2 top-2 inline-flex items-center gap-2 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white/90 backdrop-blur-md"
            aria-label="En cours de lecture"
          >
            <span className="player-eq" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            Lecture
          </div>
        )}

        {/* Bouton Play overlay (owned uniquement) */}
        {owned && (
          <button
            type="button"
            onClick={() => toggle({ song, queue, contextId })}
            aria-label={active ? "Mettre en pause" : "Lancer la lecture"}
            aria-pressed={active}
            className={[
              "absolute bottom-2 right-2",
              "inline-flex h-11 w-11 items-center justify-center rounded-full",
              "bg-white text-black shadow-xl",
              "opacity-0 translate-y-1 transition",
              "group-hover:opacity-100 group-hover:translate-y-0",
              "group-focus-within:opacity-100 group-focus-within:translate-y-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
            ].join(" ")}
          >
            {playerLoading && isCurrent ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : active ? (
              <Pause className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Play className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Zone typographique (séparée de l’image) */}
      <div className="mt-3 px-0.5">
        <h3 className="text-[15px] font-semibold leading-snug text-white/95 line-clamp-2">
          {song.title}
        </h3>

        <p className="mt-1 text-xs leading-snug text-white/60 line-clamp-1">
          {meta}
        </p>

        {/* Actions */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <Link
            href={`/song/${song.id}`}
            className="text-xs text-white/70 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-md px-1 py-1"
          >
            Ouvrir
          </Link>

          {!owned && (
            <button
              type="button"
              onClick={onBuy}
              disabled={buyLoading}
              className={[
                "inline-flex h-9 items-center justify-center rounded-full px-4 text-xs font-semibold",
                "bg-white text-black hover:opacity-95 transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              ].join(" ")}
              aria-label={`Acheter ${song.title}`}
            >
              {buyLoading ? "Traitement…" : `Acheter ${song.price ?? ""}`.trim()}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
