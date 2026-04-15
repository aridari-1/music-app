import { createClient } from "@/lib/supabase/client";

// 🎵 Get all published songs
export async function getSongs() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("is_published", true);

  if (error) throw error;

  return data;
}

// 🖼️ Get signed cover
export async function getCoverUrl(path: string) {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from("covers")
    .createSignedUrl(path, 60 * 60);

  if (error) throw error;

  return data.signedUrl;
}

// 🔍 Search
export async function searchSongs(query: string) {
  if (!query) return [];

  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  const data = await res.json();

  return data.songs || [];
}

// 🔥 Trending
export async function getTrendingSongs() {
  const res = await fetch("/api/trending");
  const data = await res.json();
  return data.songs || [];
}

// 🆕 New releases
export async function getNewSongs() {
  const res = await fetch("/api/new");
  const data = await res.json();
  return data.songs || [];
}