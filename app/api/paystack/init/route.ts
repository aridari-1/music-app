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
        amount: song.price * 100, // convert to kobo
        reference,

        // 🔥 CRITICAL FIX
        callback_url:
          "https://music-app-pi-six.vercel.app/api/paystack/verify",

        // 🔥 IMPORTANT: MATCH VERIFY FILE
        metadata: {
          userId: user.id,
          songId: songId,
        },
      }),
    }
  );

  const data = await res.json();

  if (!data.status) {
    return NextResponse.json(
      { error: "Paystack init failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    url: data.data.authorization_url,
  });
}