"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/auth-error?message=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "artist") {
    redirect("/dashboard/artist");
  }

  redirect("/dashboard/buyer");
}
export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/auth/login");
}