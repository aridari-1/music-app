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

  // 🔥 GET DATA
  const { data: trendingRaw, error: trendingError } =
    await supabase.rpc("get_trending_songs");

  const { data: newRaw, error: newError } =
    await supabase.rpc("get_new_songs");

  if (trendingError) {
    console.error("❌ Trending error:", trendingError.message);
  }

  if (newError) {
    console.error("❌ New releases error:", newError.message);
  }

  // 🖼️ SIGNED URL HELPER
  const addSignedUrls = async (songs: any[]) => {
    return Promise.all(
      (songs || []).map(async (song) => {
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
        };
      })
    );
  };

  const trending = await addSignedUrls(trendingRaw || []);
  const newReleases = await addSignedUrls(newRaw || []);

  return (
    <HomeClient
      trending={trending}
      newReleases={newReleases}
      ownedSongIds={ownedSongIds}
    />
  );
}