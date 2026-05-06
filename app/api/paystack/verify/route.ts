import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({
        success: false,
      });
    }

    // 🔎 CHECK YOUR DATABASE (NOT PAYSTACK)
    const { data, error } = await adminClient
      .from("purchases")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();

    if (error) {
      console.error("VERIFY DB ERROR:", error.message);

      return NextResponse.json({
        success: false,
      });
    }

    return NextResponse.json({
      success: !!data,
    });

  } catch (error) {
    console.error("VERIFY ERROR:", error);

    return NextResponse.json({
      success: false,
    });
  }
}