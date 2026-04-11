import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ArtistDashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "artist") {
    redirect("/dashboard");
  }

  const { data: artist } = await supabase
    .from("artists")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: songs } = await supabase
    .from("songs")
    .select("*")
    .eq("artist_id", artist?.id);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-semibold mb-6">Artist Dashboard</h1>

      <Link
        href="/upload"
        className="inline-block mb-6 bg-white text-black px-5 py-3 rounded-xl"
      >
        Upload New Song
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {songs?.map((song) => (
          <div key={song.id} className="bg-white/5 p-4 rounded-xl">
            <p className="font-semibold">{song.title}</p>
            <p className="text-sm text-white/60">${song.price}</p>
          </div>
        ))}
      </div>
    </main>
  );
}