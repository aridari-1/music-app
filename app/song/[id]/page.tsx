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

  const { id } = await params;

  if (!id || id === "undefined") {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        Invalid song
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: song } = await supabase
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

  if (!song) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        Song not found
      </main>
    );
  }

  const artist = song.artists?.[0] || null;
  const artistName = artist?.name || "Unknown artist";
  const artistId = artist?.id;

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
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/20 blur-3xl rounded-full" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">

        {/* 🖼️ COVER */}
        <div className="flex justify-center">
          <img
            src={coverUrl}
            alt={song.title}
            className="w-[260px] sm:w-[320px] md:w-[360px] aspect-square object-cover rounded-3xl shadow-2xl"
          />
        </div>

        {/* 🎵 INFO */}
        <div className="space-y-5 text-center md:text-left">

          <p className="text-sm text-white/50">
            Naluma
          </p>

          <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
            {song.title}
          </h1>

          {artistId && (
            <Link
              href={`/artist/${artistId}`}
              className="text-white/70 hover:text-white transition text-lg"
            >
              {artistName}
            </Link>
          )}

          {song.genre && (
            <p className="text-white/50">
              {song.genre}
            </p>
          )}

          {/* 💰 PRICE BLOCK */}
          {!owned && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-4">
              <p className="text-sm text-white/60 mb-2">
                Unlock full access
              </p>

              <p className="text-2xl font-semibold mb-4">
                {song.price} CFA
              </p>

              <BuyButton songId={song.id} price={song.price} />
            </div>
          )}

          {/* 🎧 PLAYER */}
          {owned && (
            <PlayButton
              song={{
                ...song,
                cover_signed_url: coverUrl,
                artist_name: artistName,
              }}
            />
          )}

          {/* 🔒 GUEST MESSAGE */}
          {!owned && (
            <p className="text-sm text-white/50">
              Sign in to purchase and unlock playback
            </p>
          )}

          {/* ✅ SUCCESS */}
          {searchParams?.success === "true" && (
            <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-xl mt-4 text-sm">
              You now own this song 🎉
            </div>
          )}

        </div>

      </div>
    </main>
  );
}