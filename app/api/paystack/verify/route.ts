import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    // ❌ No reference → go home
    if (!reference) {
      console.error("❌ Missing reference");
      return NextResponse.redirect(
        "https://music-app-pi-six.vercel.app"
      );
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

    const data = await res.json();

    console.log("✅ PAYSTACK VERIFY RESPONSE:", data);

    // ❌ Payment failed
    if (data?.data?.status !== "success") {
      console.error("❌ Payment not successful");
      return NextResponse.redirect(
        "https://music-app-pi-six.vercel.app"
      );
    }

    const metadata = data.data.metadata;

    const userId = metadata?.userId;
    const songId = metadata?.songId;

    // ❌ Missing metadata
    if (!userId || !songId) {
      console.error("❌ Missing metadata:", metadata);
      return NextResponse.redirect(
        "https://music-app-pi-six.vercel.app"
      );
    }

    const amount = data.data.amount / 100;

    // 💰 SPLIT (15% platform / 85% artist)
    const platformFee = amount * 0.15;
    const artistAmount = amount * 0.85;

    // 🎵 Get artist_id from song
    const { data: song, error: songError } = await adminClient
      .from("songs")
      .select("artist_id")
      .eq("id", songId)
      .single();

    if (songError || !song) {
      console.error("❌ Song fetch failed:", songError?.message);
      return NextResponse.redirect(
        "https://music-app-pi-six.vercel.app"
      );
    }

    // ✅ Prevent duplicate
    const { data: existing } = await adminClient
      .from("purchases")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();

    if (!existing) {
      // 💾 Insert purchase
      const { error: purchaseError } = await adminClient
        .from("purchases")
        .insert({
          buyer_id: userId,
          song_id: songId,
          artist_id: song.artist_id,
          amount,
          artist_amount: artistAmount,
          platform_fee: platformFee,
          reference,
          payout_status: "pending",
        });

      if (purchaseError) {
        console.error("❌ Purchase insert failed:", purchaseError.message);
      }

      // 🎧 Add to library
      const { error: libraryError } = await adminClient
        .from("library")
        .insert({
          user_id: userId,
          song_id: songId,
        });

      if (libraryError) {
        console.error("❌ Library insert failed:", libraryError.message);
      }
    } else {
      console.log("⚠️ Purchase already exists, skipping insert");
    }

    // 🔁 Redirect to buyer dashboard
    return NextResponse.redirect(
      "https://music-app-pi-six.vercel.app/dashboard/buyer"
    );

  } catch (error) {
    console.error("❌ VERIFY ERROR:", error);

    return NextResponse.redirect(
      "https://music-app-pi-six.vercel.app"
    );
  }
}