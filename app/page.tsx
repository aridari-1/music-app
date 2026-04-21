import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import HomeClient from "@/components/HomeClient";

export default async function HomePage() {
  const supabase = await createClient();

  // 🔐 Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🎧 Owned songs
  let ownedSongIds: string[] = [];

  if (user) {
    const { data: library } = await supabase
      .from("library")
      .select("song_id")
      .eq("user_id", user.id);

    ownedSongIds = library?.map((item) => item.song_id) || [];
  }

  // 🎵 Fetch data
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

  // 🔥 SAFETY FIX: REMOVE BROKEN SONGS (NO ID)
  const sanitizeSongs = (songs: any[]) =>
    (songs || []).filter((song) => song && song.id);

  // 🖼️ Add signed cover URLs (SAFE)
  const addSignedUrls = async (songs: any[]) => {
    return Promise.all(
      (songs || []).map(async (song) => {
        if (!song?.cover_url) {
          return { ...song, cover_signed_url: null };
        }

        try {
          const { data } = await adminClient.storage
            .from("covers")
            .createSignedUrl(song.cover_url, 3600);

          return {
            ...song,
            cover_signed_url: data?.signedUrl || null,
          };
        } catch (err) {
          console.error("❌ Cover signing error:", err);
          return { ...song, cover_signed_url: null };
        }
      })
    );
  };

  const [trending, newReleases] = await Promise.all([
    addSignedUrls(sanitizeSongs(trendingRaw)),
    addSignedUrls(sanitizeSongs(newRaw)),
  ]);

  return (
    <div className="relative">

      {/* 🔥 GLOBAL BACKGROUND GRADIENT */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-purple-900/40 to-transparent" />

      {/* 🎧 MAIN CONTENT */}
      <HomeClient
        trending={trending}
        newReleases={newReleases}
        ownedSongIds={ownedSongIds}
      />
    </div>
  );
}