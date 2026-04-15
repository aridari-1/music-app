"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ArtistSetup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const handleSave = async () => {
    await fetch("/api/artist/setup", {
      method: "POST",
      body: JSON.stringify({ name, bio }),
    });

    router.push("/dashboard/artist");
  };

  return (
    <main className="min-h-screen flex items-center justify-center text-white px-4">
      <div className="w-full max-w-md space-y-6">

        <h1 className="text-3xl font-semibold">
          Set up your artist profile
        </h1>

        <input
          placeholder="Artist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 bg-white/10 rounded"
        />

        <textarea
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-3 bg-white/10 rounded"
        />

        <button
          onClick={handleSave}
          className="w-full bg-white text-black py-3 rounded"
        >
          Continue
        </button>

      </div>
    </main>
  );
}