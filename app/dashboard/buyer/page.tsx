import { requireRole } from "@/lib/auth";
import { getUserLibrary } from "@/services/purchases";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function BuyerDashboard() {
  const supabase = await createClient();

  // 🔐 Require buyer
  const user = await requireRole("buyer");

  // 📚 Get library via service
  const library = await getUserLibrary(user.id);

  // 🖼️ Generate signed cover URLs
  const libraryWithCovers = await Promise.all(
    (library || []).map(async (item: any) => {
      let cover_signed_url: string | null = null;

      if (item.songs?.cover_url) {
        const { data } = await supabase.storage
          .from("covers")
          .createSignedUrl(item.songs.cover_url, 60 * 60);

        cover_signed_url = data?.signedUrl || null;
      }

      return {
        ...item,
        songs: {
          ...item.songs,
          cover_signed_url,
        },
      };
    })
  );

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-4xl font-semibold mb-8">Your Library</h1>

      {libraryWithCovers.length === 0 && (
        <p className="text-white/50">No songs purchased yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {libraryWithCovers.map((item: any) => (
          <div
            key={item.id}
            className="bg-white/5 rounded-2xl overflow-hidden hover:bg-white/10 transition shadow-lg"
          >
            {/* 🖼️ COVER */}
            <img
              src={item.songs.cover_signed_url || "/placeholder.png"}
              alt={item.songs.title}
              className="w-full h-48 object-cover"
            />

            {/* 🎵 CONTENT */}
            <div className="p-4">
              <p className="font-semibold text-lg">
                {item.songs.title}
              </p>

              <p className="text-sm text-white/50 mb-3">
                Purchased
              </p>

              {/* 🎧 LISTEN BUTTON */}
              <Link
                href={`/song/${item.songs.id}`}
                className="block text-center bg-white text-black py-2 rounded-lg hover:opacity-90"
              >
                ▶ Listen
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}