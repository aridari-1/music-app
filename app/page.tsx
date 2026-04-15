import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import HomeClient from "@/components/HomeClient";

export default async function HomePage() {
  const supabase = await createClient();

  // 🔐 USER
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🎧 OWNED SONGS
  let ownedSongIds: string[] = [];

  if (user) {
    const { data: library } = await supabase
      .from("library")
      .select("song_id")
      .eq("user_id", user.id);

    ownedSongIds = library?.map((item) => item.song_id) || [];
  }

  // 🎵 FETCH DATA (RPC)
  const [trendingRes, newRes] = await Promise.all([
    supabase.rpc("get_trending_songs"),
    supabase.rpc("get_new_songs"),
  ]);

  const trendingRaw = trendingRes.data || [];
  const newRaw = newRes.data || [];

  if (trendingRes.error) {
    console.error("❌ Trending error:", trendingRes.error.message);
  }

  if (newRes.error) {
    console.error("❌ New releases error:", newRes.error.message);
  }

  // 🔥 ADD ARTIST DATA (IMPORTANT FIX)
  const enrichWithArtist = async (songs: any[]) => {
    if (!songs.length) return [];

    // get all artist ids
    const artistIds = songs.map((s) => s.artist_id).filter(Boolean);

    const { data: artists } = await supabase
      .from("artists")
      .select("id, name, avatar_url")
      .in("id", artistIds);

    const artistMap = new Map(
      artists?.map((a) => [a.id, a]) || []
    );

    return songs.map((song) => ({
      ...song,
      artist_name: artistMap.get(song.artist_id)?.name || "Unknown artist",
      artist_avatar: artistMap.get(song.artist_id)?.avatar_url || null,
    }));
  };

  // 🖼️ ADD SIGNED URLS
  const addSignedUrls = async (songs: any[]) => {
    return Promise.all(
      songs.map(async (song) => {
        if (!song.cover_url) {
          return { ...song, cover_signed_url: null };
        }

        const { data } = await adminClient.storage
          .from("covers")
          .createSignedUrl(song.cover_url, 3600);

        return {
          ...song,
          cover_signed_url: data?.signedUrl || null,
        };
      })
    );
  };

  // 🔥 PIPELINE (IMPORTANT ORDER)
  const [trendingWithArtist, newWithArtist] = await Promise.all([
    enrichWithArtist(trendingRaw),
    enrichWithArtist(newRaw),
  ]);

  const [trending, newReleases] = await Promise.all([
    addSignedUrls(trendingWithArtist),
    addSignedUrls(newWithArtist),
  ]);

  return (
    <div className="relative">

      {/* 🔥 BACKGROUND */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-purple-900/40 to-transparent" />

      {/* 🎧 CONTENT */}
      <HomeClient
        trending={trending}
        newReleases={newReleases}
        ownedSongIds={ownedSongIds}
      />
    </div>
  );
}