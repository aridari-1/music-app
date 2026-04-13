import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import Player from "@/components/ui/Player";

export default async function SongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  // 🔐 Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🎵 Get song
  const { data: song } = await supabase
    .from("songs")
    .select("*")
    .eq("id", id)
    .single();

  if (!song) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Song not found</p>
      </main>
    );
  }

  // 🎧 Check ownership
  let owned = false;

  if (user) {
    const { data } = await supabase
      .from("library")
      .select("id")
      .eq("user_id", user.id)
      .eq("song_id", song.id)
      .maybeSingle();

    owned = !!data;
  }

  // 🖼️ Cover
  let coverUrl = "/placeholder.png";

  if (song.cover_url) {
    const { data } = await adminClient.storage
      .from("covers")
      .createSignedUrl(song.cover_url, 3600);

    coverUrl = data?.signedUrl || coverUrl;
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 flex justify-center">
      <div className="w-full max-w-xl">

        {/* COVER */}
        <div className="w-full h-72 rounded-2xl overflow-hidden mb-6">
          <img
            src={coverUrl}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* INFO */}
        <h1 className="text-3xl font-semibold mb-2">
          {song.title}
        </h1>

        {song.genre && (
          <p className="text-white/60 mb-4">
            {song.genre}
          </p>
        )}

        {/* PLAYER */}
        {owned ? (
          <Player songId={song.id} />
        ) : (
          <p className="text-white/50">
            You need to purchase this song to listen.
          </p>
        )}
      </div>
    </main>
  );
}