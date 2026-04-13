"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const role = String(formData.get("role") || "buyer");

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role },

      // ✅ FIXED: use real deployed URL + callback
      emailRedirectTo:
        "https://music-app-pi-six.vercel.app/auth/callback",
    },
  });

  if (error) {
    redirect(`/auth-error?message=${encodeURIComponent(error.message)}`);
  }

  redirect("/auth/login?message=Check your email");
}