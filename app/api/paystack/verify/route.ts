import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.redirect(process.env.NEXT_PUBLIC_SITE_URL!);
    }

    // 🔍 Verify with Paystack
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const response = await res.json();
    const data = response?.data;

    console.log("✅ VERIFY:", data);

    // ❌ STRICT VALIDATION
    if (
      !data ||
      data.status !== "success" ||
      !data.paid_at ||            // 🔥 MUST exist
      !data.reference ||
      !data.amount
    ) {
      console.error("❌ Payment not valid");
      return NextResponse.redirect(process.env.NEXT_PUBLIC_SITE_URL!);
    }

    const metadata = data.metadata;
    const userId = metadata?.userId;
    const songId = metadata?.songId;

    if (!userId || !songId) {
      console.error("❌ Missing metadata");
      return NextResponse.redirect(process.env.NEXT_PUBLIC_SITE_URL!);
    }

    const amount = data.amount / 100;

    // 🎵 Get song
    const { data: song, error: songError } = await adminClient
      .from("songs")
      .select("artist_id, price")
      .eq("id", songId)
      .single();

    if (songError || !song) {
      console.error("❌ Song fetch failed");
      return NextResponse.redirect(process.env.NEXT_PUBLIC_SITE_URL!);
    }

    // ❌ VERY IMPORTANT: VERIFY AMOUNT
    if (amount !== song.price) {
      console.error("❌ Amount mismatch", { amount, expected: song.price });
      return NextResponse.redirect(process.env.NEXT_PUBLIC_SITE_URL!);
    }

    // 💰 SPLIT
    const platformFee = amount * 0.15;
    const artistAmount = amount * 0.85;

    // ✅ Prevent duplicate
    const { data: existing } = await adminClient
      .from("purchases")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();

    if (!existing) {
      // 💾 Insert purchase
      await adminClient.from("purchases").insert({
        buyer_id: userId,
        song_id: songId,
        artist_id: song.artist_id,
        amount,
        artist_amount: artistAmount,
        platform_fee: platformFee,
        reference,
        payout_status: "pending",
      });

      // 🎧 Add to library
      await adminClient.from("library").insert({
        user_id: userId,
        song_id: songId,
      });
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/buyer`
    );

  } catch (error) {
    console.error("❌ VERIFY ERROR:", error);

    return NextResponse.redirect(process.env.NEXT_PUBLIC_SITE_URL!);
  }
}