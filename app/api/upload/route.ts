import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const formData = await req.formData();

    // 🎯 Fields
    const title = String(formData.get("title") || "").trim();
    const priceRaw = String(formData.get("price") || "").trim();
    const price = Number(priceRaw);
    const genre = String(formData.get("genre") || "").trim();

    const audio = formData.get("audio") as File | null;
    const cover = formData.get("cover") as File | null;

    // ✅ Validation
    if (
      !title ||
      !priceRaw ||
      Number.isNaN(price) ||
      price <= 0 ||
      !genre ||
      !audio ||
      !cover
    ) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid title, price, genre, audio, or cover.",
        },
        { status: 400 }
      );
    }

    // 🔐 Auth
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

    // 👤 Profile
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

    // 🎤 Get or create artist (SAFE)
    let { data: artist } = await supabase
      .from("artists")
      .select("id, user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!artist) {
      const { data: newArtist, error } = await supabase
        .from("artists")
        .insert({
          user_id: user.id,
          name: user.email?.split("@")[0] || "Artist",
        })
        .select()
        .single();

      if (error || !newArtist) {
        return NextResponse.json(
          { error: "Artist creation failed." },
          { status: 500 }
        );
      }

      artist = newArtist;
    }

    // 🔒 FINAL SAFETY CHECK (fixes TS error)
    if (!artist) {
      return NextResponse.json(
        { error: "Artist still null after creation." },
        { status: 500 }
      );
    }

    // 📁 File paths
    const timestamp = Date.now();

    const audioPath = `${artist.id}/${timestamp}-${audio.name.replace(/\s+/g, "-")}`;
    const coverPath = `${artist.id}/${timestamp}-${cover.name.replace(/\s+/g, "-")}`;

    // 🎵 Upload audio
    const { error: audioError } = await supabase.storage
      .from("songs")
      .upload(audioPath, audio, {
        contentType: audio.type || "audio/mpeg",
      });

    if (audioError) {
      return NextResponse.json(
        { error: `Audio upload failed: ${audioError.message}` },
        { status: 500 }
      );
    }

    // 🖼️ Upload cover
    const { error: coverError } = await supabase.storage
      .from("covers")
      .upload(coverPath, cover, {
        contentType: cover.type || "image/jpeg",
      });

    if (coverError) {
      return NextResponse.json(
        { error: `Cover upload failed: ${coverError.message}` },
        { status: 500 }
      );
    }

    // 💾 Insert song
    const { data: insertedSong, error: insertError } = await supabase
      .from("songs")
      .insert({
        artist_id: artist.id,
        title,
        price,
        genre,
        audio_url: audioPath,
        cover_url: coverPath,
        is_published: true,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: `Song insert failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    // ✅ Success
    return NextResponse.json({
      success: true,
      song: insertedSong,
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);

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