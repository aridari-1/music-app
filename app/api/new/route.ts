import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_new_songs");

  if (error) {
    console.error(error.message);
    return NextResponse.json({ songs: [] });
  }

  return NextResponse.json({ songs: data });
}