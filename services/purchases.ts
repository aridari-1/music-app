import { createClient } from "@/lib/supabase/server"; // ✅ FIX

// 💰 Start Paystack payment
export async function initiatePurchase(songId: string) {
  const res = await fetch("/api/paystack/init", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // ✅ important
    },
    body: JSON.stringify({ songId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Payment failed");
  }

  return data.url;
}

// 📚 Get user's purchased songs (FIXED 🔥)
export async function getUserLibrary(userId: string) {
  const supabase = await createClient(); // ✅ server client

  const { data, error } = await supabase
    .from("library")
    .select(`
      id,
      song_id,
      songs (
        id,
        title,
        cover_url
      )
    `)
    .eq("user_id", userId)
    .order("id", { ascending: false });

  if (error) {
    console.error("LIBRARY ERROR:", error.message);
    return [];
  }

  return data;
}

// ✅ Check ownership (also fix to server)
export async function ownsSong(userId: string, songId: string) {
  const supabase = await createClient(); // ✅ FIX

  const { data, error } = await supabase
    .from("library")
    .select("id")
    .eq("user_id", userId)
    .eq("song_id", songId)
    .maybeSingle();

  if (error) {
    console.error("OWNERSHIP ERROR:", error.message);
    return false;
  }

  return !!data;
}