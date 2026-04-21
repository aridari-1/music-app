"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ArtistEditPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // 🔥 LOAD CURRENT ARTIST DATA
  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const res = await fetch("/api/artist/me");

        const data = await res.json();

        if (res.ok && data) {
          setName(data.name || "");
          setBio(data.bio || "");
        }
      } catch (err) {
        console.error("Failed to fetch artist");
      } finally {
        setFetching(false);
      }
    };

    fetchArtist();
  }, []);

  // 🔥 SAVE UPDATE
  const handleSave = async () => {
    if (!name.trim()) {
      alert("Artist name is required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/artist/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, bio }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Update failed");
      }

      router.push("/dashboard/artist");

    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center text-white px-4">
      <div className="w-full max-w-md space-y-6">

        <h1 className="text-3xl font-semibold">
          Edit your artist profile
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
          disabled={loading}
          className="w-full bg-white text-black py-3 rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

      </div>
    </main>
  );
}