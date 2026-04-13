import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// 💰 Start Paystack payment
export async function initiatePurchase(songId: string) {
  const res = await fetch("/api/paystack/init", {
    method: "POST",
    body: JSON.stringify({ songId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Payment failed");
  }

  return data.url;
}

// 📚 Get user's purchased songs
export async function getUserLibrary(userId: string) {
  const { data, error } = await supabase
    .from("library")
    .select(`
      song_id,
      songs (*)
    `)
    .eq("user_id", userId);

  if (error) throw error;

  return data;
}

// ✅ Check if user owns a song
export async function ownsSong(userId: string, songId: string) {
  const { data, error } = await supabase
    .from("library")
    .select("id")
    .eq("user_id", userId)
    .eq("song_id", songId)
    .maybeSingle();

  if (error) throw error;

  return !!data;
}