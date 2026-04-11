import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function BuyerDashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "buyer") {
    redirect("/dashboard");
  }

  // Get purchased songs
  const { data: library } = await supabase
    .from("library")
    .select(`
      id,
      songs (
        id,
        title,
        cover_url,
        price
      )
    `)
    .eq("user_id", user.id);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-semibold mb-6">Your Library</h1>

      {library?.length === 0 && (
        <p className="text-white/50">No songs purchased yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {library?.map((item: any) => (
          <div key={item.id} className="bg-white/5 p-4 rounded-xl">
            <div className="h-40 bg-white/10 rounded mb-3" />

            <p className="font-semibold">{item.songs.title}</p>

            <Link
              href={`/song/${item.songs.id}`}
              className="mt-3 inline-block bg-white text-black px-4 py-2 rounded"
            >
              ▶ Listen
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}