"use client";

import { useRef, useState } from "react";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
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

      const formData = new FormData();
      formData.append("title", title);
      formData.append("price", price);
      formData.append("genre", genre);
      if (audio) formData.append("audio", audio);
      if (cover) formData.append("cover", cover);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Upload failed");
        return;
      }

      setMessage("Song uploaded successfully");
      setTitle("");
      setPrice("");
      setGenre("");
      setAudio(null);
      setCover(null);

      if (audioRef.current) audioRef.current.value = "";
      if (coverRef.current) coverRef.current.value = "";

    } catch (err) {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="px-6 py-10 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Upload Song</h1>

      <input
        value={title}
        placeholder="Title"
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-3"
      />

      <input
        value={price}
        type="number"
        placeholder="Price"
        onChange={(e) => setPrice(e.target.value)}
        className="w-full mb-3"
      />

      {/* 🎯 GENRE */}
      <select
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        className="w-full mb-3"
      >
        <option value="">Select genre</option>
        <option>Coupe Decale</option>
        <option>Rap Ivoire</option>
        <option>Zouglou</option>
        <option>DMV</option>
        <option>Afro</option>
        <option>Biama</option>
        <option>Rumba</option>
        <option>Drill</option>
        <option>Maimouna</option>
      </select>

      <input
        ref={audioRef}
        type="file"
        accept="audio/*"
        onChange={(e) => setAudio(e.target.files?.[0] || null)}
        className="mb-3"
      />

      <input
        ref={coverRef}
        type="file"
        accept="image/*"
        onChange={(e) => setCover(e.target.files?.[0] || null)}
        className="mb-3"
      />

      <button onClick={handleUpload} className="btn btn-primary w-full">
        {loading ? "Uploading..." : "Upload"}
      </button>

      {message && <p className="mt-3 text-sm text-muted">{message}</p>}
    </main>
  );
}