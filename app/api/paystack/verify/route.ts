import { NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(
      `${SITE_URL}/dashboard/buyer?message=${encodeURIComponent(
        "Missing payment reference."
      )}`
    );
  }

  if (!PAYSTACK_SECRET_KEY) {
    return NextResponse.redirect(
      `${SITE_URL}/dashboard/buyer?message=${encodeURIComponent(
        "Payment configuration error."
      )}`
    );
  }

  try {
    // UX route only: verify status with Paystack, but DO NOT write to DB here.
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.redirect(
        `${SITE_URL}/dashboard/buyer?message=${encodeURIComponent(
          "Unable to verify payment right now."
        )}`
      );
    }

    const payload = await res.json();
    const status = payload?.data?.status;

    if (status === "success") {
      return NextResponse.redirect(
        `${SITE_URL}/dashboard/buyer?message=${encodeURIComponent(
          "Payment successful. Your library is updating."
        )}`
      );
    }

    return NextResponse.redirect(
      `${SITE_URL}/dashboard/buyer?message=${encodeURIComponent(
        "Payment was not completed."
      )}`
    );
  } catch (error) {
    console.error("PAYSTACK VERIFY ERROR:", error);

    return NextResponse.redirect(
      `${SITE_URL}/dashboard/buyer?message=${encodeURIComponent(
        "Payment verification failed."
      )}`
    );
  }
}