import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import SongCard from "@/components/ui/SongCard";

export default async function ArtistPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // 🎤 ARTIST (FIXED 🔥)
  const { data: artist } = await supabase
    .from("artists")
    .select("*")
    .eq("id", params.id)
    .single();

  // 🎵 SONGS
  const { data: songsRaw } = await supabase
    .from("songs")
    .select("*")
    .eq("artist_id", params.id)
    .eq("is_published", true);

  if (!artist) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        Artist not found
      </main>
    );
  }

  // 🖼️ ADD SIGNED COVER URLs
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
        artist_name: artist.name, // 🔥 IMPORTANT
      };
    })
  );

  return (
    <main className="min-h-screen text-white">

      {/* 🎧 HERO */}
      <section className="relative h-[360px] flex items-end px-6 pb-8">

        {/* 🔥 BACKGROUND */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-700/40 to-black" />

        {/* 🌫️ GLOW */}
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/20 blur-3xl rounded-full" />

        <div className="relative z-10">

          <p className="text-sm text-white/60">
            Artist
          </p>

          <h1 className="text-4xl sm:text-6xl font-bold mt-2">
            {artist.name || "Unknown Artist"}
          </h1>

          <p className="text-white/60 mt-2">
            {songs.length} songs
          </p>

          {/* 🎧 ACTIONS */}
          <div className="mt-6 flex gap-3">

            <button className="bg-white text-black px-6 py-3 rounded-full font-medium">
              ▶ Play All
            </button>

            <button className="border border-white/20 px-6 py-3 rounded-full">
              Follow
            </button>

          </div>
        </div>
      </section>

      {/* 🎵 CONTENT */}
      <div className="px-6 mt-10 space-y-20">

        {/* 🔥 TOP TRACKS */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">
            Top Tracks
          </h2>

          <div className="space-y-3">
            {songs.slice(0, 5).map((song, index) => (
              <div
                key={song.id}
                className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition"
              >
                <div className="flex items-center gap-4">

                  <span className="text-white/50 w-6">
                    {index + 1}
                  </span>

                  <img
                    src={song.cover_signed_url || "/placeholder.png"}
                    className="w-12 h-12 object-cover rounded-md"
                  />

                  <p>{song.title}</p>
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
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
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            About
          </h2>

          <p className="text-white/60 max-w-2xl">
            {artist.bio || "No bio yet."}
          </p>
        </section>

      </div>
    </main>
  );
}