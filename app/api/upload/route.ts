import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 🔥 JSON BODY ONLY
    const body = await req.json();

    const title = String(body.title || "").trim();
    const genre = String(body.genre || "").trim();

    const price = Number(body.price);

    const audio_url = String(body.audio_url || "").trim();
    const cover_url = String(body.cover_url || "").trim();

    // ✅ VALIDATION
    if (
      !title ||
      !genre ||
      !audio_url ||
      !cover_url ||
      Number.isNaN(price) ||
      price <= 0
    ) {
      return NextResponse.json(
        {
          error: "Missing or invalid fields.",
        },
        { status: 400 }
      );
    }

    // 🔐 AUTH
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized user." },
        { status: 401 }
      );
    }

    // 👤 PROFILE
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found." },
        { status: 500 }
      );
    }

    if (profile.role !== "artist") {
      return NextResponse.json(
        { error: "Only artists can upload songs." },
        { status: 403 }
      );
    }

    // 🎤 GET ARTIST
    const { data: artist, error: artistError } = await supabase
      .from("artists")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (artistError || !artist) {
      return NextResponse.json(
        { error: "Artist profile not found." },
        { status: 400 }
      );
    }

    // 💾 INSERT SONG ONLY
    const { data: insertedSong, error: insertError } = await supabase
      .from("songs")
      .insert({
        artist_id: artist.id,
        title,
        genre,
        price,
        audio_url,
        cover_url,
        is_published: true,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        {
          error: `Song insert failed: ${insertError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      song: insertedSong,
    });

  } catch (error) {
    console.error("UPLOAD API ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown server error",
      },
      { status: 500 }
    );
  }
}