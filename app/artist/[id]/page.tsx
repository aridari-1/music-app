import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import SongCard from "@/components/ui/SongCard";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();

  // ✅ Next.js 16 FIX
  const { id } = await params;

  // 🎤 ARTIST
  const { data: artist } = await supabase
    .from("artists")
    .select("*")
    .eq("id", id)
    .single();

  // 🎵 SONGS
  const { data: songsRaw } = await supabase
    .from("songs")
    .select("*")
    .eq("artist_id", id)
    .eq("is_published", true);

  if (!artist) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        Artist not found
      </main>
    );
  }

  // 🖼️ SIGNED COVERS
  const songs = await Promise.all(
    (songsRaw || []).map(async (song) => {
      let cover_signed_url = null;

      if (song.cover_url) {
        const { data } = await adminClient.storage
          .from("covers")
          .createSignedUrl(song.cover_url, 3600);

        cover_signed_url = data?.signedUrl || null;
      }

      return {
        ...song,
        cover_signed_url,
        artist_name: artist.name,
      };
    })
  );

  return (
    <main className="min-h-screen text-white">

      {/* 🎧 HERO */}
      <section className="relative h-[420px] flex items-end px-6 pb-10 overflow-hidden">

        {/* BACKGROUND */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-700/50 via-black/40 to-black" />

        {/* GLOW */}
        <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/20 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-5xl w-full">

          <p className="text-xs uppercase tracking-widest text-white/50">
            Artist
          </p>

          <h1 className="text-5xl sm:text-7xl font-bold mt-3 tracking-tight">
            {artist.name || "Unknown Artist"}
          </h1>

          <p className="text-white/60 mt-3 text-sm">
            {songs.length} songs
          </p>

          {/* ACTIONS */}
          <div className="mt-8 flex gap-4 flex-wrap">

            <button className="bg-white text-black px-7 py-3 rounded-full font-medium hover:scale-105 transition">
              ▶ Play All
            </button>

            <button className="border border-white/20 px-7 py-3 rounded-full hover:bg-white/10 transition">
              Follow
            </button>

          </div>
        </div>
      </section>

      {/* 🎵 CONTENT */}
      <div className="px-6 mt-12 space-y-24">

        {/* 🔥 TOP TRACKS */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">
            Top Tracks
          </h2>

          <div className="space-y-2">
            {songs.slice(0, 5).map((song, index) => (
              <div
                key={song.id}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-4">

                  {/* INDEX / PLAY HOVER */}
                  <div className="w-6 text-white/50 text-sm group-hover:hidden">
                    {index + 1}
                  </div>
                  <div className="w-6 hidden group-hover:block text-white">
                    ▶
                  </div>

                  <img
                    src={song.cover_signed_url || "/placeholder.png"}
                    className="w-12 h-12 object-cover rounded-md"
                  />

                  <div>
                    <p className="font-medium">{song.title}</p>
                    <p className="text-xs text-white/50">
                      {song.genre}
                    </p>
                  </div>
                </div>

                <p className="text-white/50 text-sm">
                  ${song.price}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 💿 ALL SONGS */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">
            Songs
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                owned={false}
              />
            ))}
          </div>
        </section>

        {/* 🧠 ABOUT */}
        <section className="max-w-3xl">
          <h2 className="text-2xl font-semibold mb-4">
            About
          </h2>

          <p className="text-white/70 leading-relaxed">
            {artist.bio || "This artist hasn’t added a bio yet."}
          </p>
        </section>

      </div>
    </main>
  );
}