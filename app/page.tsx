import SongCard from "@/components/ui/SongCard";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin"; // 🔥 IMPORTANT

export default async function HomePage() {
  const supabase = await createClient();

  // 🔐 Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🎧 Owned songs
  let ownedSongIds: string[] = [];

  if (user) {
    const { data: library } = await supabase
      .from("library")
      .select("song_id")
      .eq("user_id", user.id);

    ownedSongIds = library?.map((item) => item.song_id) || [];
  }

  // 🔥 GET TRENDING (REAL DATA)
  const { data: trendingRaw } = await supabase.rpc("get_trending_songs");

  // 🆕 GET NEW RELEASES (REAL DATA)
  const { data: newRaw } = await supabase.rpc("get_new_songs");

  // 🖼️ ADD SIGNED URL FUNCTION
  const addSignedUrls = async (songs: any[]) => {
    return Promise.all(
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
  };

  const trending = await addSignedUrls(trendingRaw || []);
  const newReleases = await addSignedUrls(newRaw || []);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10 space-y-10">

      {/* 🎨 HERO */}
      <section className="relative h-64 rounded-3xl overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-700 flex items-end p-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Discover New Music
          </h1>
          <p className="text-white/70">
            Support artists. Own your sound.
          </p>
        </div>
      </section>

      {/* 🔥 TRENDING */}
      <Section
        title="🔥 Trending"
        subtitle="Most purchased this week"
      >
        {trending.map((song: any) => (
          <SongCard
            key={song.id}
            song={song}
            owned={ownedSongIds.includes(song.id)}
          />
        ))}
      </Section>

      {/* 🆕 NEW RELEASES */}
      <Section
        title="🆕 New Releases"
        subtitle="Recently added by artists"
      >
        {newReleases.map((song: any) => (
          <SongCard
            key={song.id}
            song={song}
            owned={ownedSongIds.includes(song.id)}
          />
        ))}
      </Section>

    </main>
  );
}

/* 🔥 Reusable Section */
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-white/50 text-sm">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {children}
      </div>
    </section>
  );
}