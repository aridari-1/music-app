import SongCard from "@/components/ui/SongCard";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin"; // ✅ NEW
import { getSongs } from "@/services/songs";

export default async function HomePage() {
  const supabase = await createClient();

  // 🔐 Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🎵 Get songs
  const songs = await getSongs();

  // 🎧 Get owned songs
  let ownedSongIds: string[] = [];

  if (user) {
    const { data: library } = await supabase
      .from("library")
      .select("song_id")
      .eq("user_id", user.id);

    ownedSongIds = library?.map((item) => item.song_id) || [];
  }

  // 🖼️ FIXED: Use adminClient for signed URLs
  const songsWithCovers = await Promise.all(
    (songs || []).map(async (song: any) => {
      let cover_signed_url = null;

      if (song.cover_url) {
        const { data, error } = await adminClient.storage
          .from("covers")
          .createSignedUrl(song.cover_url, 3600);

        if (error) {
          console.error("SIGNED URL ERROR:", error.message);
        }

        cover_signed_url = data?.signedUrl || null;
      }

      return {
        ...song,
        cover_signed_url,
      };
    })
  );

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-4xl font-semibold mb-8">
        Discover Music
      </h1>

      {songsWithCovers.length === 0 && (
        <p className="text-white/50">No songs available.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {songsWithCovers.map((song: any) => (
          <SongCard
            key={song.id}
            song={song}
            owned={ownedSongIds.includes(song.id)}
          />
        ))}
      </div>
    </main>
  );
}