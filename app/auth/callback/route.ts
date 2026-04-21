import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");

  const supabase = await createClient();

  // 🔐 Exchange code for session
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 👤 Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  // 🎭 Get role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // 🎤 ARTIST FLOW (FIXED 🔥)
  if (profile?.role === "artist") {
    // 🔥 CHECK IF ARTIST PROFILE EXISTS
    const { data: artist } = await supabase
      .from("artists")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!artist) {
      return NextResponse.redirect(`${origin}/artist/setup`);
    }

    return NextResponse.redirect(`${origin}/dashboard/artist`);
  }

  // 🧑‍💼 BUYER FLOW
  return NextResponse.redirect(`${origin}/dashboard/buyer`);
}