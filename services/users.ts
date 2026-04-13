import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// 👤 Get current user
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;

  return user;
}

// 🧠 Get user profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return data;
}

// 🎭 Get role
export async function getUserRole(userId: string) {
  const profile = await getUserProfile(userId);
  return profile.role;
}