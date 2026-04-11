import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const supabase = await createClient();

  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest("hex");

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
    const data = event.data;

    const userId = data.metadata.user_id;
    const songId = data.metadata.song_id;

    // Insert purchase
    await supabase.from("purchases").insert({
      buyer_id: userId,
      song_id: songId,
      stripe_payment_id: data.reference,
    });

    // Add to library
    await supabase.from("library").insert({
      user_id: userId,
      song_id: songId,
    });
  }

  return NextResponse.json({ received: true });
}