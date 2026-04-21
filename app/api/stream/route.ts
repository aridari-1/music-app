import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const body = await req.json();
    const songId = body?.songId;

    // 🔐 0. Input check
    if (!songId || typeof songId !== "string" || songId === "undefined") {
      return NextResponse.json({ error: "Invalid songId" }, { status: 400 });
    }

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
      .maybeSingle();

    if (libError || !libraryItem) {
      return NextResponse.json(
        { error: "You must purchase this song" },
        { status: 403 }
      );
    }

    // 🎵 3. Get song safely
    const { data: song, error: songError } = await supabase
      .from("songs")
      .select("audio_url, is_published")
      .eq("id", songId)
      .maybeSingle();

    if (songError || !song) {
      return NextResponse.json(
        { error: "Song not found" },
        { status: 404 }
      );
    }

    if (!song.audio_url) {
      return NextResponse.json(
        { error: "Audio not available" },
        { status: 400 }
      );
    }

    if (!song.is_published) {
      return NextResponse.json(
        { error: "Song not available" },
        { status: 403 }
      );
    }

    // 🔐 4. Generate signed URL
    const { data, error } = await adminClient.storage
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
  } catch (error) {
    console.error("STREAM ERROR:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}