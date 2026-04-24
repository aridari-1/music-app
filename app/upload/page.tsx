"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageProvider";

type PriceLabel = "basic" | "popular" | "pro" | "exclusive";

const PRICES: { value: number; label: PriceLabel; highlight?: boolean }[] = [
  { value: 50, label: "basic" },
  { value: 100, label: "popular", highlight: true },
  { value: 150, label: "pro" },
  { value: 200, label: "exclusive" },
];

export default function UploadPage() {
  const { t } = useLanguage();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [genre, setGenre] = useState("");
  const [audio, setAudio] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const audioRef = useRef<HTMLInputElement | null>(null);
  const coverRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async () => {
    try {
      setLoading(true);
      setMessage("");

      if (!price) {
        setMessage(t.selectPrice || "Select a price");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("price", String(price));
      formData.append("genre", genre);
      if (audio) formData.append("audio", audio);
      if (cover) formData.append("cover", cover);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || t.uploadFailed || "Upload failed");
        return;
      }

      setMessage(t.uploadSuccess || "Song uploaded successfully");
      setTitle("");
      setPrice(null);
      setGenre("");
      setAudio(null);
      setCover(null);

      if (audioRef.current) audioRef.current.value = "";
      if (coverRef.current) coverRef.current.value = "";
    } catch {
      setMessage(t.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-10 max-w-md mx-auto text-white">

      {/* TITLE */}
      <h1 className="text-3xl font-semibold mb-2">
        {t.uploadSong}
      </h1>

      <p className="text-white/50 mb-8">
        {t.uploadSubtitle || "Share your music with the world"}
      </p>

      {/* SONG TITLE */}
      <input
        value={title}
        placeholder={t.songTitle || "Song title"}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 outline-none transition"
      />

      {/* 💰 PRICE */}
      <div className="mb-8">
        <p className="text-sm text-white/50 mb-3">
          {t.choosePrice || "Choose price"}
        </p>

        <div className="grid grid-cols-2 gap-4">
          {PRICES.map((p) => {
            const active = price === p.value;

            return (
              <motion.div
                key={p.value}
                onClick={() => setPrice(p.value)}
                whileTap={{ scale: 0.96 }}
                className={`relative cursor-pointer rounded-2xl p-4 border transition ${
                  active
                    ? "bg-white text-black border-white"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                {/* GLOW */}
                {active && (
                  <div className="absolute inset-0 rounded-2xl bg-white/20 blur-xl opacity-40" />
                )}

                {/* LABEL */}
                <p className="text-xs opacity-70">
                  {t[p.label] || p.label}
                </p>

                {/* PRICE */}
                <p className="text-xl font-semibold mt-1">
                  {p.value} XOF
                </p>

                {/* BADGE */}
                {p.highlight && (
                  <span className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full bg-purple-500 text-white">
                    {t.mostPopular || "Most Popular"}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* GENRE */}
      <select
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        className="w-full mb-6 p-4 rounded-2xl bg-white/5 border border-white/10"
      >
        <option value="">
          {t.selectGenre || "Select genre"}
        </option>
        <option>Coupe Decale</option>
        <option>Rap Ivoire</option>
        <option>Zouglou</option>
        <option>DMV</option>
        <option>Afro</option>
        <option>Biama</option>
        <option>Rumba</option>
        <option>Drill</option>
        <option>Maimouna</option>
          <option>Trap</option>
      </select>

      {/* AUDIO */}
      <label className="block mb-4 cursor-pointer">
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center hover:bg-white/10 transition">
          {audio ? audio.name : (t.selectAudio || "Select audio file")}
        </div>
        <input
          ref={audioRef}
          type="file"
          accept="audio/*"
          onChange={(e) => setAudio(e.target.files?.[0] || null)}
          className="hidden"
        />
      </label>

      {/* COVER */}
      <label className="block mb-6 cursor-pointer">
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center hover:bg-white/10 transition">
          {cover ? cover.name : (t.selectCover || "Select cover image")}
        </div>
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          onChange={(e) => setCover(e.target.files?.[0] || null)}
          className="hidden"
        />
      </label>

      {/* BUTTON */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={handleUpload}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-600 font-medium text-lg"
      >
        {loading
          ? (t.uploading || "Uploading...")
          : t.upload}
      </motion.button>

      {/* MESSAGE */}
      {message && (
        <p className="mt-4 text-sm text-white/60 text-center">
          {message}
        </p>
      )}
    </main>
  );
}