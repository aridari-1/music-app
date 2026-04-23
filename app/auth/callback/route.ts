import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(req: Request) {
  const supabase = await createClient();

  // 🔥 FIXED HEADERS (Next.js 16)
  const headersList = await headers();
  const origin = headersList.get("origin") || new URL(req.url).origin;

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("Auth exchange error:", exchangeError.message);
    return NextResponse.redirect(
      `${origin}/auth/login?error=auth_failed`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "artist") {
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

  return NextResponse.redirect(`${origin}/dashboard/buyer`);
}