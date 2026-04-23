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
      console.error("❌ Invalid Paystack signature");
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body);

    // 🎯 ONLY HANDLE SUCCESS EVENTS
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
      console.error("❌ Invalid payload", {
        reference,
        status,
        paidAt,
        userId,
        songId,
      });
      return new NextResponse("Invalid payload", { status: 400 });
    }

    // 🎵 FETCH SONG
    const { data: song, error: songError } = await adminClient
      .from("songs")
      .select("id, price, is_published")
      .eq("id", songId)
      .maybeSingle();

    if (songError) {
      console.error("❌ Song fetch error:", songError.message);
      return new NextResponse("Song lookup failed", { status: 500 });
    }

    if (!song || !song.is_published) {
      console.error("❌ Invalid or unpublished song");
      return new NextResponse("Invalid song", { status: 400 });
    }

    // 💰 PAYSTACK RETURNS SMALLEST UNIT
    const paidAmount = Number(payment.amount); // e.g. 10000
    const expectedAmount = Math.round(Number(song.price) * 100); // e.g. 100 * 100 = 10000

    if (
      Number.isNaN(paidAmount) ||
      Number.isNaN(expectedAmount) ||
      paidAmount !== expectedAmount
    ) {
      console.error("❌ Amount mismatch", {
        paidAmount,
        expectedAmount,
        songPrice: song.price,
      });
      return new NextResponse("Amount mismatch", { status: 400 });
    }

    // 🚀 PROCESS PURCHASE (STORE REAL XOF VALUE)
    const { error: rpcError } = await adminClient.rpc("process_purchase", {
      p_user_id: userId,
      p_song_id: songId,
      p_reference: reference,
      p_amount: Number(song.price), // ✅ store human-readable XOF
    });

    if (rpcError) {
      console.error("❌ RPC error:", rpcError.message);
      return new NextResponse("Processing failed", { status: 500 });
    }

    console.log("✅ Purchase processed successfully", {
      userId,
      songId,
      reference,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ WEBHOOK ERROR:", error);
    return new NextResponse("Webhook error", { status: 500 });
  }
}