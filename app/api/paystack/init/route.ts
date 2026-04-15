import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const { songId } = await req.json();

  // 🔐 Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 🎵 Get song
  const { data: song, error: songError } = await supabase
    .from("songs")
    .select("*")
    .eq("id", songId)
    .single();

  if (songError || !song) {
    return NextResponse.json(
      { error: "Song not found" },
      { status: 404 }
    );
  }

  // ❗ Validate price
  if (!song.price || song.price <= 0) {
    return NextResponse.json(
      { error: "Invalid song price" },
      { status: 400 }
    );
  }

  // ❌ Prevent duplicate purchase
  const { data: existing } = await supabase
    .from("library")
    .select("id")
    .eq("user_id", user.id)
    .eq("song_id", songId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "You already own this song" },
      { status: 400 }
    );
  }

  const reference = `ref_${Date.now()}_${user.id}`;

  // 💰 Initialize Paystack
  const res = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: song.price * 100,
        currency: "XOF",

        reference,

        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/paystack/verify`,

        metadata: {
          userId: user.id,
          songId: songId,
        },
      }),
    }
  );

  const data = await res.json();

  if (!data.status) {
    console.error("❌ Paystack init error:", data);
    return NextResponse.json(
      { error: "Paystack init failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    url: data.data.authorization_url,
  });
}