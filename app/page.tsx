import { createClient } from "@/lib/supabase/server";
import SongCard from "@/components/ui/SongCard";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get all songs
  const { data: songs } = await supabase
    .from("songs")
    .select("*")
    .eq("is_published", true);

  // Get user library
  let ownedSongIds: string[] = [];

  if (user) {
    const { data: library } = await supabase
      .from("library")
      .select("song_id")
      .eq("user_id", user.id);

    ownedSongIds = library?.map((item) => item.song_id) || [];
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-4xl font-semibold mb-8">
        Discover Music
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {songs?.map((song) => (
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