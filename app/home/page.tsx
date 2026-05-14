export const revalidate = 60;

import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import HomeClient from "@/components/HomeClient";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let ownedSongIds: string[] = [];

  if (user) {
    const { data: library } = await supabase
      .from("library")
      .select("song_id")
      .eq("user_id", user.id);

    ownedSongIds =
      library?.map(
        (x) => x.song_id
      ) || [];
  }

  // 🔥 SONGS ONLY
  const [trendingRes, newRes] =
    await Promise.all([

      supabase
        .from("songs")
        .select(`
          id,
          title,
          price,
          genre,
          cover_url,
          created_at,
          artist_id
        `)
        .eq(
          "is_published",
          true
        )
        .order(
          "created_at",
          {
            ascending:false
          }
        )
        .limit(12),

      supabase
        .from("songs")
        .select(`
          id,
          title,
          price,
          genre,
          cover_url,
          created_at,
          artist_id
        `)
        .eq(
          "is_published",
          true
        )
        .order(
          "created_at",
          {
            ascending:false
          }
        )
        .limit(12),

    ]);

    const allSongs=[
      ...(trendingRes.data||[]),
      ...(newRes.data||[])
    ];

    // unique artist ids
    const artistIds=[
      ...new Set(
      allSongs.map(
      s=>s.artist_id
      ))
    ];

    // fetch artists separately
    const {
      data:artists
    }=
    await supabase
    .from("artists")
    .select(
      "id,name"
    )
    .in(
      "id",
      artistIds
    );

    const artistMap=
      new Map(
        (artists||[])
        .map(
          a=>[
            a.id,
            a
          ]
        )
      );

    async function formatSongs(
      songs:any[]
    ){

      return Promise.all(

        songs.map(
        async(song)=>{

        let cover_signed_url=null;

        if(
          song.cover_url
        ){

        try{

        const {
        data
        }=
        await adminClient
        .storage
        .from(
          "covers"
        )
        .createSignedUrl(
          song.cover_url,
          3600
        );

        cover_signed_url=
        data?.signedUrl
        ||null;

        }catch{}

        }

        const artist=
        artistMap.get(
          song.artist_id
        );

        return{

        ...song,

        artist_name:
        artist?.name
        ||"Unknown artist",

        artist_id:
        artist?.id
        ||song.artist_id,

        cover_signed_url

        };

        })
      );
    }

    const [
      trending,
      newReleases
    ]=
    await Promise.all([

      formatSongs(
      trendingRes.data
      ||[]
      ),

      formatSongs(
      newRes.data
      ||[]
      )

    ]);

  return (
    <div className="relative">

      <div className="pointer-events-none absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-purple-900/40 to-transparent"/>

      <HomeClient
        trending={trending}
        newReleases={newReleases}
        ownedSongIds={ownedSongIds}
      />

    </div>
  );
}