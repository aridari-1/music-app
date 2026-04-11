import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const { songId } = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" });

  const { data: song } = await supabase
    .from("songs")
    .select("*")
    .eq("id", songId)
    .single();

  if (!song) return NextResponse.json({ error: "Song not found" });

  const reference = `ref_${Date.now()}_${user.id}`;

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.email,
      amount: song.price * 100, // Paystack uses cents
      reference,
      metadata: {
        user_id: user.id,
        song_id: songId,
      },
    }),
  });

  const data = await res.json();

  return NextResponse.json({
    url: data.data.authorization_url,
  });
}