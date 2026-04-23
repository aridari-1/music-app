"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const role = String(formData.get("role") || "buyer");

  const supabase = await createClient();

  // 🔥 NEXT 16 SAFE HEADERS
  const headersList = await headers();
  const origin =
    headersList.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // ❌ BASIC VALIDATION
  if (!email || !password) {
    redirect(`/auth-error?message=${encodeURIComponent("Missing email or password")}`);
  }

  // 🔐 SIGN UP
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role },
      emailRedirectTo: `${origin}/auth/callback`, // ✅ ALWAYS CORRECT DOMAIN
    },
  });

  if (error) {
    console.error("Signup error:", error.message);

    redirect(
      `/auth-error?message=${encodeURIComponent(error.message)}`
    );
  }

  // ✅ SUCCESS
  redirect("/auth/login?message=Check your email");
}