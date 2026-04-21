import crypto from "crypto";
import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: Request) {
  if (!PAYSTACK_SECRET_KEY) {
    console.error("Missing PAYSTACK_SECRET_KEY");
    return new NextResponse("Server misconfigured", { status: 500 });
  }

  try {
    // 🔐 VERIFY SIGNATURE
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(body)
      .digest("hex");

    if (!signature || hash !== signature) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body);

    // 🎯 ONLY HANDLE SUCCESS
    if (event?.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const payment = event.data;

    const reference = payment?.reference;
    const status = payment?.status;
    const paidAt = payment?.paid_at;
    const metadata = payment?.metadata || {};

    const userId = metadata.userId;
    const songId = metadata.songId;

    if (!reference || status !== "success" || !paidAt || !userId || !songId) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    // 🎵 FETCH SONG
    const { data: song, error: songError } = await adminClient
      .from("songs")
      .select("id, price, is_published")
      .eq("id", songId)
      .maybeSingle();

    if (songError) {
      console.error("Song fetch error:", songError.message);
      return new NextResponse("Song lookup failed", { status: 500 });
    }

    if (!song || !song.is_published) {
      return new NextResponse("Invalid song", { status: 400 });
    }

    // 💰 AMOUNT CHECK (XOF SAFE)
    const paidAmount = Number(payment.amount);
    const expectedAmount = Number(song.price);

    if (
      Number.isNaN(paidAmount) ||
      Number.isNaN(expectedAmount) ||
      paidAmount !== expectedAmount
    ) {
      return new NextResponse("Amount mismatch", { status: 400 });
    }

    // 🚀 CALL DATABASE FUNCTION (ATOMIC 🔥)
    const { error: rpcError } = await adminClient.rpc("process_purchase", {
      p_user_id: userId,
      p_song_id: songId,
      p_reference: reference,
      p_amount: paidAmount,
    });

    if (rpcError) {
      console.error("RPC error:", rpcError.message);
      return new NextResponse("Processing failed", { status: 500 });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    return new NextResponse("Webhook error", { status: 500 });
  }
}