"use client";

import Link from "next/link";
import { useMemo } from "react";
import SongCard from "@/components/ui/SongCard";
import PlayButton from "@/components/ui/PlayButton";
import usePlayer from "@/hooks/usePlayer";
import { useLanguage } from "@/context/LanguageProvider";

type Song = any;

export default function HomeClient({
  trending = [],
  newReleases = [],
  ownedSongIds = [],
}: {
  trending: Song[];
  newReleases: Song[];
  ownedSongIds: string[];
}) {
  const { t } = useLanguage();
  const { currentSongId, isPlaying } = usePlayer();

  const ownedSet = useMemo(() => new Set(ownedSongIds), [ownedSongIds]);

  const featuredSong: Song | null = trending[0] || newReleases[0] || null;
  const featuredOwned = featuredSong
    ? ownedSet.has(featuredSong.id)
    : false;

  const featuredActive =
    featuredSong &&
    currentSongId === featuredSong.id &&
    isPlaying;

  return (
    <main className="min-h-screen text-white">

      <div className="mx-auto w-full max-w-7xl px-0 sm:px-6 pb-40 pt-10">

        {/* 🔝 HEADER */}
        <section>
          <p className="text-xs uppercase tracking-widest text-white/40 mb-2">
            Musique
          </p>

          <h1 className="text-3xl sm:text-4xl font-semibold">
            {t.discover}
          </h1>

          <p className="text-white/60 mt-2 max-w-md">
            {t.support}
          </p>
        </section>

        {/* 🎧 HERO */}
        <section className="mt-14 flex flex-col lg:grid lg:grid-cols-2 gap-10 items-center">

          {/* TEXT */}
          <div className="space-y-5 text-center lg:text-left px-4 sm:px-0">

            <p className="text-sm text-white/50">
              {t.trending}
            </p>

            <h2 className="text-3xl sm:text-4xl font-semibold leading-tight">
              {featuredSong?.title || t.discover}
            </h2>

            <p className="text-white/60 max-w-md mx-auto lg:mx-0">
              {featuredSong?.genre || t.support}
            </p>

            <div className="flex gap-3 justify-center lg:justify-start flex-wrap">
              {featuredSong ? (
                featuredOwned ? (
                  <PlayButton
                    song={featuredSong}
                    className={featuredActive ? "ring-1 ring-white/40" : ""}
                  />
                ) : (
                  <Link
                    href={`/song/${featuredSong.id}`}
                    className="bg-white text-black px-6 py-3 rounded-full font-medium"
                  >
                    Open
                  </Link>
                )
              ) : (
                <Link
                  href="/search"
                  className="bg-white text-black px-6 py-3 rounded-full font-medium"
                >
                  Explore
                </Link>
              )}

              <Link
                href="/search"
                className="border border-white/10 px-6 py-3 rounded-full text-white/70"
              >
                Browse
              </Link>
            </div>
          </div>

          {/* IMAGE */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-[240px] h-[240px] sm:w-[300px] sm:h-[300px]">
              {featuredSong?.cover_signed_url && (
                <img
                  src={featuredSong.cover_signed_url}
                  alt={featuredSong.title}
                  className="object-cover rounded-2xl shadow-xl w-full h-full"
                />
              )}
            </div>
          </div>

        </section>

        {/* 🎯 GENRES */}
        <section className="mt-12 flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory px-4 sm:px-0">
          <Pill label={t.trending} />
          <Pill label={t.new} />
          <Pill label="Afro" />
          <Pill label="Drill" />
          <Pill label="Zouglou" />
          <Pill label="Rap Ivoire" />
        </section>

        {/* 🎵 SECTIONS */}
        <div className="mt-16 space-y-24 px-4 sm:px-0">

          {/* 🔥 TRENDING */}
          {trending.length > 0 && (
            <Section title={t.trending}>
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

          {/* 🆕 NEW */}
          {newReleases.length > 0 && (
            <Section title={t.new}>
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
function Section({ title, children }: any) {
  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-semibold px-4 sm:px-0">{title}</h2>

      <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth px-4 sm:px-0">
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
    <div className="shrink-0 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70">
      {label}
    </div>
  );
}