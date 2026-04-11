"use client";

import { useState } from "react";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [audio, setAudio] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price);
    if (audio) formData.append("audio", audio);
    if (cover) formData.append("cover", cover);

    await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    alert("Uploaded!");
  };

  return (
    <main className="min-h-screen bg-black text-white flex justify-center items-center">
      <div className="w-full max-w-md bg-white/5 p-6 rounded-xl space-y-4">
        <h1 className="text-2xl font-semibold">Upload Song</h1>

        <input
          placeholder="Title"
          className="w-full p-3 bg-white/10 rounded"
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price"
          className="w-full p-3 bg-white/10 rounded"
          onChange={(e) => setPrice(e.target.value)}
        />

        <input type="file" onChange={(e) => setAudio(e.target.files?.[0] || null)} />
        <input type="file" onChange={(e) => setCover(e.target.files?.[0] || null)} />

        <button
          onClick={handleUpload}
          className="w-full bg-white text-black py-3 rounded"
        >
          Upload
        </button>
      </div>
    </main>
  );
}