import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  if (!query) {
    return NextResponse.json({ songs: [] });
  }

  // 🔥 FETCH WITH ARTIST JOIN
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

  // 🔥 FORMAT + SIGNED URL
  const songsWithData = await Promise.all(
    (data || []).map(async (song: any) => {
      let cover_signed_url: string | null = null;

      if (song.cover_url) {
        const { data: signed } = await adminClient.storage
          .from("covers")
          .createSignedUrl(song.cover_url, 3600);

        cover_signed_url = signed?.signedUrl || null;
      }

      // ✅ FIX: artists is an array
      const artist = song.artists?.[0] || null;

      return {
        ...song,
        cover_signed_url,
        artist_name: artist?.name || "Unknown artist",
        artist_avatar: artist?.avatar_url || null,
      };
    })
  );

  return NextResponse.json({ songs: songsWithData });
}