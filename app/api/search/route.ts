import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    // 🔥 SAFETY: empty query → return empty
    if (!query.trim()) {
      return NextResponse.json({ songs: [] });
    }

    const { data, error } = await supabase
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
      .or(`title.ilike.%${query}%,genre.ilike.%${query}%`)
      .eq("is_published", true)
      .limit(20);

    if (error) {
      console.error("❌ Search error:", error.message);
      return NextResponse.json({ songs: [] });
    }

    const songsWithCovers = await Promise.all(
      (data || [])
        // 🔥 SAFETY: remove broken rows
        .filter((song) => song && song.id)
        .map(async (song) => {
          let cover_signed_url = null;

          if (song.cover_url) {
            try {
              const { data: signed } = await adminClient.storage
                .from("covers")
                .createSignedUrl(song.cover_url, 3600);

              cover_signed_url = signed?.signedUrl || null;
            } catch (err) {
              console.error("❌ Cover signing error:", err);
            }
          }

          // 🔥 SAFETY: artist is array
          const artist = song.artists?.[0] || null;

          return {
            ...song,
            cover_signed_url,
            artist_name: artist?.name || "Unknown artist",
            artist_avatar: artist?.avatar_url || null,
          };
        })
    );

    return NextResponse.json({ songs: songsWithCovers });

  } catch (err) {
    console.error("❌ Unexpected search error:", err);
    return NextResponse.json({ songs: [] });
  }
}