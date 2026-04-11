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

      // 🔥 THIS IS THE FIX
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/login`,
    },
  });

  if (error) {
    redirect(`/auth-error?message=${error.message}`);
  }

  redirect("/auth/login?message=Check your email");
}