"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";

import SongCard from "@/components/ui/SongCard";
import PlayButton from "@/components/ui/PlayButton";
import usePlayer, { Song } from "@/hooks/usePlayer";
import { useLanguage } from "@/context/LanguageProvider";

type HomeClientProps = {
  trending: Song[];
  newReleases: Song[];
  ownedSongIds: string[];
};

export default function HomeClient({
  trending = [],
  newReleases = [],
  ownedSongIds = [],
}: HomeClientProps) {
  const { t } = useLanguage();
  const { currentSongId, isPlaying } = usePlayer();

  const ownedSet = useMemo(() => new Set(ownedSongIds), [ownedSongIds]);

  const featuredSong: Song | null = trending[0] || newReleases[0] || null;
  const featuredOwned = featuredSong ? ownedSet.has(featuredSong.id) : false;

  const featuredActive =
    featuredSong && currentSongId === featuredSong.id && isPlaying;

  return (
    <main className="relative min-h-screen bg-black text-white">
      {/* 🌌 BACKGROUND */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-140px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-fuchsia-500/14 blur-3xl" />
        <div className="absolute right-[-120px] top-[120px] h-[320px] w-[320px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute left-[-120px] top-[540px] h-[280px] w-[280px] rounded-full bg-cyan-500/8 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-40 pt-8 sm:px-6 lg:px-8">

        {/* 🔝 HEADER */}
        <section className="flex items-center justify-between gap-4">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
              Musique
            </p>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.discover}
            </h1>

            <p className="mt-3 max-w-xl text-sm text-white/60 sm:text-base">
              {t.support}
            </p>
          </div>

          <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 sm:block">
            {trending.length + newReleases.length} titres
          </div>
        </section>

        {/* 🎧 HERO */}
        <section className="mt-10 relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-xl">

          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/18 via-violet-500/6 to-cyan-500/6" />

          <div className="relative grid grid-cols-1 gap-10 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">

            {/* LEFT */}
            <div>
              <div className="mb-4 text-xs text-white/60">
                {t.trending}
              </div>

              <h2 className="text-3xl font-semibold sm:text-4xl">
                {featuredSong?.title || t.discover}
              </h2>

              <p className="mt-3 text-sm text-white/60">
                {featuredSong?.genre || t.support}
              </p>

              <div className="mt-6 flex gap-3">
                {featuredSong ? (
                  featuredOwned ? (
                    <PlayButton
                      song={featuredSong}
                      className={featuredActive ? "ring-1 ring-white/50" : ""}
                    />
                  ) : (
                    <Link
                      href={`/song/${featuredSong.id}`}
                      className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black"
                    >
                      Ouvrir
                    </Link>
                  )
                ) : (
                  <Link
                    href="/search"
                    className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black"
                  >
                    Explorer
                  </Link>
                )}

                <Link
                  href="/search"
                  className="rounded-full border border-white/10 px-5 py-2 text-sm text-white/70"
                >
                  Recherche <ChevronRight className="inline w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[300px] aspect-square rounded-2xl overflow-hidden">
                {featuredSong?.cover_signed_url && (
                  <Image
                    src={featuredSong.cover_signed_url}
                    alt={featuredSong.title}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 🎯 CHIPS */}
        <section className="mt-10 flex gap-3 overflow-x-auto pb-2">
          <Pill label={t.trending} />
          <Pill label={t.new} />
          <Pill label="Afro" />
          <Pill label="Drill" />
          <Pill label="Zouglou" />
          <Pill label="Rap Ivoire" />
        </section>

        {/* 🎵 SECTIONS */}
        <div className="mt-14 space-y-16">

          {trending.length > 0 && (
            <Section title={t.trending} subtitle={t.trendingSub}>
              {trending.map((song) => (
                <CardSlot key={song.id}>
                  <SongCard
                    song={song}
                    owned={ownedSet.has(song.id)}
                  />
                </CardSlot>
              ))}
            </Section>
          )}

          {newReleases.length > 0 && (
            <Section title={t.new} subtitle={t.newSub}>
              {newReleases.map((song) => (
                <CardSlot key={song.id}>
                  <SongCard
                    song={song}
                    owned={ownedSet.has(song.id)}
                  />
                </CardSlot>
              ))}
            </Section>
          )}

        </div>
      </div>
    </main>
  );
}

/* 🔥 SECTION */
function Section({ title, subtitle, children }: any) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-sm text-white/50">{subtitle}</p>
        )}
      </div>

      <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth">
        {children}
      </div>
    </section>
  );
}

/* 🔥 CARD SLOT */
function CardSlot({ children }: any) {
  return (
    <div className="snap-start w-[190px] min-w-[190px] sm:w-[220px] sm:min-w-[220px]">
      {children}
    </div>
  );
}

/* 🔥 PILL */
function Pill({ label }: any) {
  return (
    <div className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/70">
      {label}
    </div>
  );
}