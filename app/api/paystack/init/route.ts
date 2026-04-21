import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

export async function POST(req: Request) {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payment configuration error" },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    // 🔥 FIX: READ JSON (NOT formData)
    const body = await req.json();
    const songId = body.songId;

    if (!songId) {
      return NextResponse.json(
        { error: "Missing songId" },
        { status: 400 }
      );
    }

    // 🔐 AUTH
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { error: "User email required" },
        { status: 400 }
      );
    }

    // 🎵 GET SONG
    const { data: song, error: songError } = await supabase
      .from("songs")
      .select("id, price, is_published")
      .eq("id", songId)
      .maybeSingle();

    if (songError) {
      console.error("Song fetch error:", songError.message);
      return NextResponse.json(
        { error: "Failed to fetch song" },
        { status: 500 }
      );
    }

    if (!song || !song.is_published) {
      return NextResponse.json(
        { error: "Song not available" },
        { status: 400 }
      );
    }

    if (!song.price || Number(song.price) <= 0) {
      return NextResponse.json(
        { error: "Invalid price" },
        { status: 400 }
      );
    }

    // 🚫 ALREADY OWNED
    const { data: existing } = await supabase
      .from("library")
      .select("id")
      .eq("user_id", user.id)
      .eq("song_id", song.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Already purchased" },
        { status: 400 }
      );
    }

    // 💰 XOF → NO *100
    const amount = Number(song.price);

    // 🔑 UNIQUE REFERENCE
    const reference = `pay_${song.id}_${user.id}_${Date.now()}_${Math.floor(
      Math.random() * 1000000
    )}`;

    // 🚀 INIT PAYSTACK
    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount,
          currency: "XOF",
          reference,
          callback_url: `${SITE_URL}/api/paystack/verify`,
          metadata: {
            userId: user.id,
            songId: song.id,
          },
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Paystack init failed:", text);

      return NextResponse.json(
        { error: "Payment initialization failed" },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!data?.data?.authorization_url) {
      return NextResponse.json(
        { error: "Invalid Paystack response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: data.data.authorization_url,
    });

  } catch (err) {
    console.error("INIT ERROR:", err);

    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}