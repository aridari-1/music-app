import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import PlayButton from "@/components/ui/PlayButton";
import BuyButton from "@/components/ui/BuyButton";
import Link from "next/link";

export default async function SongPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: { success?: string };
}) {
  const supabase = await createClient();

  // ✅ Next.js 16 params fix
  const { id } = await params;

  // ✅ Guard
  if (!id || id === "undefined") {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        Invalid song
      </main>
    );
  }

  // 🔐 USER
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🎵 SONG
  const { data: song, error } = await supabase
    .from("songs")
    .select(`
      id,
      title,
      price,
      genre,
      cover_url,
      artist_id,
      artists (
        id,
        name,
        avatar_url
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Song fetch error:", error.message);
  }

  if (!song) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        Song not found
      </main>
    );
  }

  // 🎤 ARTIST (array fix)
  const artist = song.artists?.[0] || null;
  const artistName = artist?.name || "Unknown artist";
  const artistId = artist?.id;

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

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-black to-black" />

      {/* GLOW */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-500/20 blur-3xl rounded-full" />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-20">

        {/* COVER */}
        <div className="w-full max-w-sm">
          <img
            src={coverUrl}
            alt={song.title}
            className="w-full aspect-square object-cover rounded-3xl shadow-2xl"
          />
        </div>

        {/* INFO */}
        <div className="mt-8 text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold">
            {song.title}
          </h1>

          {artistId && (
            <Link
              href={`/artist/${artistId}`}
              className="text-white/70 hover:text-white transition"
            >
              {artistName}
            </Link>
          )}

          {song.genre && (
            <p className="text-white/50 text-sm">
              {song.genre}
            </p>
          )}

          {/* 🔥 GUEST / LOCKED MESSAGE */}
          {!owned && (
            <p className="text-sm text-white/50 mt-2">
              Sign in to purchase and unlock full playback
            </p>
          )}
        </div>

        {/* 🔥 SUCCESS MESSAGE AFTER PAYMENT */}
        {searchParams?.success === "true" && (
          <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-xl mt-6 text-sm">
            You now own this song 🎉
          </div>
        )}

        {/* ACTION */}
        <div className="mt-8 w-full max-w-sm">
          {owned ? (
            <PlayButton
              song={{
                ...song,
                cover_signed_url: coverUrl,
                artist_name: artistName,
              }}
            />
          ) : (
            <BuyButton songId={song.id} price={song.price} />
          )}
        </div>

      </div>
    </main>
  );
}