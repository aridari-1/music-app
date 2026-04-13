import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// 🎵 Get all published songs
export async function getSongs() {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("is_published", true);

  if (error) throw error;

  return data;
}

// 🎧 Get signed cover URL
export async function getCoverUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("covers")
    .createSignedUrl(path, 60 * 60);

  if (error) throw error;

  return data.signedUrl;
}

// 🎧 Get signed audio URL (secure)
export async function getAudioUrl(songId: string) {
  const res = await fetch("/api/stream", {
    method: "POST",
    body: JSON.stringify({ songId }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error);

  return data.url;
}