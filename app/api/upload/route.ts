import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const formData = await req.formData();

  const title = formData.get("title") as string;
  const price = formData.get("price") as string;
  const audio = formData.get("audio") as File;
  const cover = formData.get("cover") as File;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get artist
  const { data: artist } = await supabase
    .from("artists")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Upload audio
  const audioPath = `songs/${Date.now()}-${audio.name}`;

  await supabase.storage
    .from("songs")
    .upload(audioPath, audio);

  // Upload cover
  const coverPath = `covers/${Date.now()}-${cover.name}`;

  await supabase.storage
    .from("covers")
    .upload(coverPath, cover);

  // Save song in DB
  await supabase.from("songs").insert({
    artist_id: artist.id,
    title,
    price: Number(price),
    audio_url: audioPath,
    cover_url: coverPath,
    is_published: true,
  });

  return NextResponse.json({ success: true });
}