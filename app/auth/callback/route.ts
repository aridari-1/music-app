import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
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
    return NextResponse.redirect(
      "https://music-app-pi-six.vercel.app/auth/login"
    );
  }

  // 🎭 Get role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // 🎯 Redirect based on role
  if (profile?.role === "artist") {
    return NextResponse.redirect(
      "https://music-app-pi-six.vercel.app/dashboard/artist"
    );
  }

  return NextResponse.redirect(
    "https://music-app-pi-six.vercel.app/dashboard/buyer"
  );
}