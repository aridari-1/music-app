import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import ShareSongButton from "@/components/ui/ShareSongButton"; // ✅ ADDED
import Link from "next/link";

export default async function ArtistDashboard() {
  const supabase = await createClient();

  // 🔐 Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "artist") {
    redirect("/dashboard/buyer");
  }

  // 🎤 Artist
  const { data: artist } = await supabase
    .from("artists")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!artist) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <p>No artist profile found.</p>
      </main>
    );
  }

  // 🎵 Songs
  const { data: songs } = await supabase
    .from("songs")
    .select("*")
    .eq("artist_id", artist.id);

  const mySongIds = songs?.map((s) => s.id) || [];

  // 💰 Purchases
  const { data: purchases } = await supabase
    .from("purchases")
    .select("artist_amount, payout_status, song_id")
    .in("song_id", mySongIds);

  const mySales = purchases || [];

  // 💰 Calculations
  const totalEarnings = mySales.reduce(
    (sum, p) => sum + (p.artist_amount || 0),
    0
  );

  const pendingEarnings = mySales
    .filter((p) => p.payout_status === "pending")
    .reduce((sum, p) => sum + (p.artist_amount || 0), 0);

  const paidEarnings = mySales
    .filter((p) => p.payout_status === "paid")
    .reduce((sum, p) => sum + (p.artist_amount || 0), 0);

  const totalSales = mySales.length;

  // 🖼️ Signed covers
  const songsWithCovers = await Promise.all(
    (songs || []).map(async (song) => {
      let cover_signed_url = null;

      if (song.cover_url) {
        const { data } = await adminClient.storage
          .from("covers")
          .createSignedUrl(song.cover_url, 3600);

        cover_signed_url = data?.signedUrl || null;
      }

      return {
        ...song,
        cover_signed_url,
      };
    })
  );

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10 space-y-10">

      {/* 🎤 HEADER */}
      <div>
        <h1 className="text-4xl font-semibold mb-2">
          Artist Dashboard
        </h1>
        <p className="text-white/50">
          Track your earnings and manage your music
        </p>
      </div>

      {/* 💰 STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <StatCard title="Total Earnings" value={`${totalEarnings.toFixed(2)} XOF`} />

        <StatCard title="Pending Payout" value={`${pendingEarnings.toFixed(2)} XOF`} />

        <StatCard title="Paid Earnings" value={`${paidEarnings.toFixed(2)} XOF`} />

        <StatCard title="Total Sales" value={totalSales} />

      </div>

      {/* 🔥 ACTION */}
      <Link
        href="/upload"
        className="inline-block bg-white text-black px-5 py-3 rounded-xl font-medium"
      >
        + Upload New Song
      </Link>

      {/* 🎵 SONGS */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Your Songs
        </h2>

        {songsWithCovers.length === 0 ? (
          <p className="text-white/50">
            You haven’t uploaded any songs yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {songsWithCovers.map((song) => (
              <div
                key={song.id}
                className="bg-white/5 rounded-2xl overflow-hidden hover:bg-white/10 transition"
              >
                {/* COVER */}
                <img
                  src={song.cover_signed_url || "/placeholder.png"}
                  alt={song.title}
                  className="w-full h-40 object-cover"
                />

                {/* INFO */}
                <div className="p-4 space-y-3">
                  <p className="font-semibold">
                    {song.title}
                  </p>

                  <p className="text-sm text-white/60">
                    {song.price} XOF
                  </p>

                  {/* 🔥 SHARE BUTTON */}
                  <ShareSongButton
                    songId={song.id}
                    title={song.title}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

/* 💎 STAT CARD */
function StatCard({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  return (
    <div className="bg-white/5 p-6 rounded-2xl">
      <p className="text-white/50 text-sm mb-2">
        {title}
      </p>
      <p className="text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}