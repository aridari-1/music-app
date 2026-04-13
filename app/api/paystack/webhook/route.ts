import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // 🔐 Verify signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("❌ Invalid Paystack signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    console.log("📩 PAYSTACK WEBHOOK:", event);

    if (event.event === "charge.success") {
      const data = event.data;

      const metadata = data.metadata;

      const userId = metadata?.userId;
      const songId = metadata?.songId;
      const reference = data.reference;

      if (!userId || !songId) {
        console.error("❌ Missing metadata", metadata);
        return NextResponse.json({ received: true });
      }

      // ✅ Prevent duplicate
      const { data: existing } = await adminClient
        .from("purchases")
        .select("id")
        .eq("reference", reference)
        .maybeSingle();

      if (!existing) {
        const amount = data.amount / 100;

        // 💰 SPLIT (15% platform / 85% artist)
        const platformFee = amount * 0.15;
        const artistAmount = amount * 0.85;

        // 🎵 Get song to retrieve artist_id
        const { data: song, error: songError } = await adminClient
          .from("songs")
          .select("artist_id")
          .eq("id", songId)
          .single();

        if (songError || !song) {
          console.error("❌ Song fetch failed:", songError?.message);
          return NextResponse.json({ received: true });
        }

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
        console.log("⚠️ Purchase already exists, skipping");
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("❌ WEBHOOK ERROR:", error);

    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}