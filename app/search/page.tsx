"use client";

import { useEffect, useState } from "react";
import { searchSongs } from "@/services/songs";
import SongCard from "@/components/ui/SongCard";

const GENRES = [
  "Coupe Decale",
  "Rap Ivoire",
  "Zouglou",
  "DMV",
  "Afro",
  "Biama",
  "Rumba",
  "Drill",
  "Maimouna",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query) {
        setSongs([]);
        return;
      }

      setLoading(true);

      const results = await searchSongs(query);
      setSongs(results);

      setLoading(false);
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-3xl font-semibold mb-6">Search</h1>

      {/* 🔍 INPUT */}
      <input
        placeholder="Search songs or genres..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-4 rounded-xl bg-white/10 border border-white/10 outline-none mb-8"
      />

      {/* 🎨 GENRES (Apple Music style) */}
      {!query && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {GENRES.map((genre, i) => (
            <div
              key={genre}
              onClick={() => setQuery(genre)}
              className="relative h-28 rounded-2xl overflow-hidden cursor-pointer group"
            >
              {/* 🎨 Background gradient */}
              <div className={`absolute inset-0 ${getGradient(i)} opacity-90`} />

              {/* ✨ Glow */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />

              {/* 🎵 Text */}
              <div className="relative z-10 p-4 flex items-end h-full">
                <p className="text-lg font-semibold">
                  {genre}
                </p>
              </div>

              {/* 🔥 Hover animation */}
              <div className="absolute inset-0 scale-100 group-hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      )}

      {/* ⏳ LOADING */}
      {loading && (
        <p className="text-white/50 mt-4">Searching...</p>
      )}

      {/* ❌ NO RESULTS */}
      {!loading && query && songs.length === 0 && (
        <p className="text-white/50 mt-4">No results found.</p>
      )}

      {/* 🎵 RESULTS */}
      {query && songs.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} owned={false} />
          ))}
        </div>
      )}
    </main>
  );
}

/* 🎨 Gradient generator */
function getGradient(i: number) {
  const gradients = [
    "bg-gradient-to-br from-pink-500 to-purple-600",
    "bg-gradient-to-br from-blue-500 to-indigo-600",
    "bg-gradient-to-br from-green-500 to-emerald-600",
    "bg-gradient-to-br from-yellow-500 to-orange-500",
    "bg-gradient-to-br from-red-500 to-pink-600",
    "bg-gradient-to-br from-purple-500 to-indigo-500",
    "bg-gradient-to-br from-teal-500 to-cyan-600",
    "bg-gradient-to-br from-orange-500 to-red-600",
    "bg-gradient-to-br from-indigo-500 to-purple-700",
  ];

  return gradients[i % gradients.length];
}