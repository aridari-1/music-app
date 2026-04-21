import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { name, bio, avatar_url } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // 🔥 FIND ARTIST
    const { data: artist, error: artistError } = await supabase
      .from("artists")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (artistError) {
      console.error(artistError.message);
      return NextResponse.json({ error: "Artist fetch failed" }, { status: 500 });
    }

    if (!artist) {
      return NextResponse.json(
        { error: "Artist profile not found" },
        { status: 404 }
      );
    }

    // 🔥 UPDATE
    const { error: updateError } = await supabase
      .from("artists")
      .update({
        name,
        bio,
        avatar_url,
      })
      .eq("id", artist.id);

    if (updateError) {
      console.error(updateError.message);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("ARTIST UPDATE ERROR:", err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}