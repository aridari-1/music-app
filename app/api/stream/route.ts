import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const { songId } = await req.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔐 1. Auth check
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 🔐 2. Ownership check
  const { data: libraryItem, error: libError } = await supabase
    .from("library")
    .select("id")
    .eq("user_id", user.id)
    .eq("song_id", songId)
    .single();

  if (libError || !libraryItem) {
    return NextResponse.json(
      { error: "You must purchase this song" },
      { status: 403 }
    );
  }

  // 🎵 3. Get song safely
  const { data: song, error: songError } = await supabase
    .from("songs")
    .select("audio_url")
    .eq("id", songId)
    .single();

  if (songError || !song) {
    return NextResponse.json(
      { error: "Song not found" },
      { status: 404 }
    );
  }

  // 🔐 4. Generate signed URL
  const { data, error } = await supabase.storage
    .from("songs")
    .createSignedUrl(song.audio_url, 60);

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to generate audio link" },
      { status: 500 }
    );
  }

  // 🎧 5. Return secure URL
  return NextResponse.json({ url: data.signedUrl });
}