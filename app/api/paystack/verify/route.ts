import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

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

    console.log("PAYSTACK VERIFY:", data);

    if (data?.data?.status !== "success") {
      console.error("❌ Payment not successful");
      return NextResponse.redirect(
        "https://music-app-pi-six.vercel.app"
      );
    }

    const metadata = data.data.metadata;

    if (!metadata?.userId || !metadata?.songId) {
      console.error("❌ Missing metadata", metadata);
      return NextResponse.redirect(
        "https://music-app-pi-six.vercel.app"
      );
    }

    const userId = metadata.userId;
    const songId = metadata.songId;

    // ✅ Prevent duplicate purchases
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
          amount: data.data.amount / 100,
          reference,
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
    }

    // 🔁 Redirect to dashboard
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