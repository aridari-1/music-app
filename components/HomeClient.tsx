"use client";

import SongCard from "@/components/ui/SongCard";
import { useLanguage } from "@/context/LanguageProvider";

export default function HomeClient({
  trending,
  newReleases,
  ownedSongIds,
}: any) {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10 space-y-10">

      {/* HERO */}
      <section className="relative h-64 rounded-3xl overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-700 flex items-end p-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {t.discover}
          </h1>
          <p className="text-white/70">
            {t.support}
          </p>
        </div>
      </section>

      {/* TRENDING */}
      {trending.length > 0 && (
        <Section
          title={`🔥 ${t.trending}`}
          subtitle={t.trendingSub}
        >
          {trending.map((song: any) => (
            <div key={song.id} className="min-w-[200px]">
              <SongCard
                song={song}
                owned={ownedSongIds.includes(song.id)}
              />
            </div>
          ))}
        </Section>
      )}

      {/* NEW */}
      <Section
        title={`🆕 ${t.new}`}
        subtitle={t.newSub}
      >
        {newReleases.map((song: any) => (
          <div key={song.id} className="min-w-[200px]">
            <SongCard
              song={song}
              owned={ownedSongIds.includes(song.id)}
            />
          </div>
        ))}
      </Section>

    </main>
  );
}

/* SECTION */
function Section({ title, subtitle, children }: any) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-white/50 text-sm">{subtitle}</p>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {children}
      </div>
    </section>
  );
}