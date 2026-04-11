"use client";

import { useState } from "react";

export default function SongCard({ song, owned }: any) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);

    const res = await fetch("/api/paystack/init", {
      method: "POST",
      body: JSON.stringify({ songId: song.id }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    }

    setLoading(false);
  };

  return (
    <div className="bg-white/5 rounded-2xl overflow-hidden hover:bg-white/10 transition">
      <img
        src={`https://YOUR_PROJECT.supabase.co/storage/v1/object/public/covers/${song.cover_url}`}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <p className="font-semibold text-lg">{song.title}</p>

        <p className="text-sm text-white/50 mb-3">
          ${song.price}
        </p>

        {owned ? (
          <a
            href={`/song/${song.id}`}
            className="block text-center bg-white text-black py-2 rounded-lg"
          >
            ▶ Listen
          </a>
        ) : (
          <button
            onClick={handleBuy}
            disabled={loading}
            className="w-full bg-white text-black py-2 rounded-lg"
          >
            {loading ? "Loading..." : "Buy"}
          </button>
        )}
      </div>
    </div>
  );
}