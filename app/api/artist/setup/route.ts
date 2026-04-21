import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const { name, bio } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Artist name is required" },
        { status: 400 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔥 CHECK IF ARTIST ALREADY EXISTS
    const { data: existingArtist } = await supabase
      .from("artists")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingArtist) {
      return NextResponse.json({ success: true });
    }

    // 🔥 CREATE ARTIST PROFILE (CRITICAL FIX)
    const { error } = await supabase.from("artists").insert({
      user_id: user.id,
      name,
      bio,
    });

    if (error) {
      console.error("Artist insert error:", error.message);
      return NextResponse.json(
        { error: "Failed to create artist profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("SETUP ERROR:", err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}