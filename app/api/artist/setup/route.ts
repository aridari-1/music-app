import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const { name, bio } = await req.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" });
  }

  await supabase
    .from("profiles")
    .update({
      username: name,
      bio,
      is_artist_setup: true,
    })
    .eq("id", user.id);

  return NextResponse.json({ success: true });
}