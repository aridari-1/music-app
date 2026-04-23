export const revalidate = 60; // 🔥 cache for 60 seconds

import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import HomeClient from "@/components/HomeClient";

type Song = {
  id: string;
  title?: string;
  price?: number;
  genre?: string;
  cover_url?: string | null;
  artist_id?: string | null;
  artist_name?: string | null;
};

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

  // 🎵 FETCH DATA (PARALLEL)
  const [trendingRes, newRes] = await Promise.all([
    supabase.rpc("get_trending_songs"),
    supabase.rpc("get_new_songs"),
  ]);

  if (trendingRes.error) {
    console.error("❌ Trending error:", trendingRes.error.message);
  }

  if (newRes.error) {
    console.error("❌ New releases error:", newRes.error.message);
  }

  const trendingRaw: Song[] = trendingRes.data || [];
  const newRaw: Song[] = newRes.data || [];

  // 🔥 CLEAN DATA
  const sanitizeSongs = (songs: Song[]) =>
    songs.filter((song) => song && song.id);

  // 🖼️ OPTIMIZED SIGNED URL (LIMITED)
  const addSignedUrls = async (songs: Song[]) => {
    return Promise.all(
      songs.slice(0, 12).map(async (song) => { // 🔥 limit to 12 max
        if (!song.cover_url) {
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

  // ⚠️ OPTIONAL DEBUG
  if (!trending.length && !newReleases.length) {
    console.warn("⚠️ No songs returned from RPC");
  }

  return (
    <div className="relative">

      {/* 🔥 BACKGROUND */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-purple-900/40 to-transparent" />

      {/* 🎧 UI */}
      <HomeClient
        trending={trending}
        newReleases={newReleases}
        ownedSongIds={ownedSongIds}
      />
    </div>
  );
}