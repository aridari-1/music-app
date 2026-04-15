import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import PlayButton from "@/components/ui/PlayButton";

export default async function SongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  // 🔐 USER
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🎵 SONG
  const { data: song } = await supabase
    .from("songs")
    .select("*")
    .eq("id", id)
    .single();

  if (!song) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        Song not found
      </main>
    );
  }

  // 🎧 OWNERSHIP
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

  // 🖼️ COVER
  let coverUrl = "/placeholder.png";

  if (song.cover_url) {
    const { data } = await adminClient.storage
      .from("covers")
      .createSignedUrl(song.cover_url, 3600);

    coverUrl = data?.signedUrl || coverUrl;
  }

  return (
    <main className="relative min-h-screen text-white overflow-hidden">

      {/* 🌌 BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-black to-black" />

      {/* 🌫️ GLOW */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-500/20 blur-3xl rounded-full" />

      {/* 🎧 CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-20">

        {/* 🖼️ COVER */}
        <div className="w-full max-w-sm">
          <img
            src={coverUrl}
            alt={song.title}
            className="w-full aspect-square object-cover rounded-3xl shadow-2xl"
          />
        </div>

        {/* 🎵 INFO */}
        <div className="mt-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold">
            {song.title}
          </h1>

          {song.genre && (
            <p className="text-white/60 mt-2">
              {song.genre}
            </p>
          )}
        </div>

        {/* 🎧 ACTION */}
        <div className="mt-8 w-full max-w-sm">

          {owned ? (
            <PlayButton
              song={{
                ...song,
                cover_signed_url: coverUrl, // 🔥 IMPORTANT FIX
              }}
            />
          ) : (
            <button className="w-full bg-white text-black py-3 rounded-xl font-medium">
              Buy for ${song.price}
            </button>
          )}

        </div>

      </div>
    </main>
  );
}