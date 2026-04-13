import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin"; // 🔥 IMPORTANT

export async function GET(req: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  if (!query) {
    return NextResponse.json({ songs: [] });
  }

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .or(`title.ilike.%${query}%,genre.ilike.%${query}%`)
    .eq("is_published", true)
    .limit(20);

  if (error) {
    console.error(error.message);
    return NextResponse.json({ songs: [] });
  }

  // 🔥 ADD SIGNED URL HERE
  const songsWithCovers = await Promise.all(
    (data || []).map(async (song) => {
      let cover_signed_url = null;

      if (song.cover_url) {
        const { data: signed } = await adminClient.storage
          .from("covers")
          .createSignedUrl(song.cover_url, 3600);

        cover_signed_url = signed?.signedUrl || null;
      }

      return {
        ...song,
        cover_signed_url,
      };
    })
  );

  return NextResponse.json({ songs: songsWithCovers });
}