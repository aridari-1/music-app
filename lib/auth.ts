import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ✅ Get current user (safe)
export async function getUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

// 🔒 Require login
export async function requireUser() {
  const user = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}

// 🧠 Get user role
export async function getUserRole(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return profile?.role || null;
}

// 🔐 Require specific role
export async function requireRole(requiredRole: "artist" | "buyer") {
  const user = await requireUser();

  const role = await getUserRole(user.id);

  if (role !== requiredRole) {
    redirect("/dashboard");
  }

  return user;
}