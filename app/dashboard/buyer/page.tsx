import { requireRole } from "@/lib/auth";
import { getUserLibrary } from "@/services/purchases";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function BuyerDashboard() {
  const supabase = await createClient();

  // 🔐 Require buyer
  const user = await requireRole("buyer");

  // 📚 Library
  const library = await getUserLibrary(user.id);

  // 🖼️ Signed covers
  const libraryWithCovers = await Promise.all(
    (library || []).map(async (item: any) => {
      let cover_signed_url: string | null = null;

      if (item.songs?.cover_url) {
        const { data, error } = await adminClient.storage
          .from("covers")
          .createSignedUrl(
            item.songs.cover_url,
            3600
          );

        if (error) {
          console.error(
            "SIGNED URL ERROR:",
            error.message
          );
        }

        cover_signed_url =
          data?.signedUrl || null;
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

  // 🎨 HERO BACKGROUND
  const heroImage =
    libraryWithCovers?.[0]?.songs
      ?.cover_signed_url ||
    "/placeholder.png";

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* 🌌 HERO */}
      <section className="relative h-[340px] overflow-hidden">

        {/* BG IMAGE */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-30"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black" />

        {/* GLOW */}
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/20 blur-3xl rounded-full" />

        {/* CONTENT */}
        <div className="relative z-10 h-full flex flex-col justify-end px-6 pb-10">

          <p className="text-white/60 text-sm mb-2">
            Welcome back 👋
          </p>

          <h1 className="text-4xl sm:text-6xl font-bold leading-tight">
            Your Library
          </h1>

          <p className="text-white/60 mt-4 text-lg">
            {libraryWithCovers.length} songs collected
          </p>

          {/* QUICK ACTIONS */}
          <div className="flex gap-3 mt-6 overflow-x-auto scrollbar-hide">

            <button
              className="
                px-5 py-3 rounded-full
                bg-white text-black font-medium
                hover:scale-105 transition
                whitespace-nowrap
              "
            >
              ▶ Continue Listening
            </button>

            <button
              className="
                px-5 py-3 rounded-full
                bg-white/10 border border-white/10
                backdrop-blur-xl
                hover:bg-white/15 transition
                whitespace-nowrap
              "
            >
              ❤️ Favorites
            </button>

            <button
              className="
                px-5 py-3 rounded-full
                bg-white/10 border border-white/10
                backdrop-blur-xl
                hover:bg-white/15 transition
                whitespace-nowrap
              "
            >
              🔥 Trending
            </button>
          </div>
        </div>
      </section>

      {/* 🎵 CONTENT */}
      <div className="px-6 pb-40">

        {/* EMPTY STATE */}
        {libraryWithCovers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">

            <div className="w-28 h-28 rounded-full bg-white/5 flex items-center justify-center text-5xl mb-6">
              🎵
            </div>

            <h2 className="text-2xl font-semibold mb-3">
              Your collection is empty
            </h2>

            <p className="text-white/50 max-w-md">
              Start discovering amazing music
              from talented artists on Naluma.
            </p>

            <Link
              href="/"
              className="
                mt-8 px-6 py-3 rounded-full
                bg-white text-black font-medium
                hover:scale-105 transition
              "
            >
              Explore Music
            </Link>
          </div>
        )}

        {/* RECENT SECTION */}
        {libraryWithCovers.length > 0 && (
          <>
            <section className="mt-12">

              <div className="flex items-center justify-between mb-6">

                <div>
                  <h2 className="text-2xl font-semibold">
                    Recently Purchased
                  </h2>

                  <p className="text-white/50 text-sm mt-1">
                    Your latest music collection
                  </p>
                </div>

              </div>

              {/* 🎵 GRID */}
              <div
                className="
                  grid grid-cols-2
                  sm:grid-cols-2
                  md:grid-cols-3
                  lg:grid-cols-4
                  xl:grid-cols-5
                  gap-6
                "
              >
                {libraryWithCovers.map(
                  (item: any) => (
                    <Link
                      key={item.id}
                      href={`/song/${item.songs.id}`}
                      className="group relative"
                    >

                      {/* GLOW */}
                      <div
                        className="
                          absolute inset-0
                          rounded-3xl
                          bg-white/5
                          opacity-0
                          group-hover:opacity-100
                          blur-2xl
                          transition duration-500
                          pointer-events-none
                        "
                      />

                      {/* CARD */}
                      <div
                        className="
                          relative overflow-hidden
                          rounded-3xl
                          bg-white/[0.04]
                          border border-white/5
                          backdrop-blur-xl
                          transition duration-300
                          hover:bg-white/[0.07]
                          hover:scale-[1.03]
                        "
                      >

                        {/* COVER */}
                        <div className="relative overflow-hidden">

                          <img
                            src={
                              item.songs
                                .cover_signed_url ||
                              "/placeholder.png"
                            }
                            alt={
                              item.songs.title
                            }
                            className="
                              w-full aspect-square object-cover
                              transition duration-700
                              group-hover:scale-110
                            "
                          />

                          {/* OVERLAY */}
                          <div
                            className="
                              absolute inset-0
                              bg-gradient-to-t
                              from-black/70
                              via-black/10
                              to-transparent
                            "
                          />

                          {/* PLAY BUTTON */}
                          <div
                            className="
                              absolute bottom-4 right-4
                              opacity-0 translate-y-4
                              group-hover:opacity-100
                              group-hover:translate-y-0
                              transition duration-300
                            "
                          >
                            <div
                              className="
                                w-12 h-12 rounded-full
                                bg-white text-black
                                flex items-center justify-center
                                shadow-2xl
                              "
                            >
                              ▶
                            </div>
                          </div>

                          {/* PURCHASED BADGE */}
                          <div
                            className="
                              absolute top-4 left-4
                              px-3 py-1 rounded-full
                              bg-black/50 backdrop-blur-xl
                              text-xs text-white/80
                              border border-white/10
                            "
                          >
                            Purchased
                          </div>
                        </div>

                        {/* INFO */}
                        <div className="p-4">

                          {/* TITLE */}
                          <h3
                            className="
                              font-semibold
                              text-[15px]
                              truncate
                            "
                          >
                            {item.songs.title}
                          </h3>

                          {/* ARTIST */}
                          <p
                            className="
                              text-sm text-white/60
                              truncate mt-1
                            "
                          >
                            {item.songs
                              .artist_name ||
                              "Unknown artist"}
                          </p>

                          {/* GENRE */}
                          {item.songs.genre && (
                            <p
                              className="
                                text-xs text-white/40
                                mt-2
                              "
                            >
                              {
                                item.songs.genre
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}