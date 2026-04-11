"use client";

import { useState } from "react";

export default function Player({ songId }: { songId: string }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handlePlay = async () => {
    const res = await fetch("/api/stream", {
      method: "POST",
      body: JSON.stringify({ songId }),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    setAudioUrl(data.url);
  };

  return (
    <div className="bg-white/5 p-4 rounded-xl">
      <button
        onClick={handlePlay}
        className="bg-white text-black px-4 py-2 rounded"
      >
        ▶ Play
      </button>

      {audioUrl && (
        <audio controls autoPlay className="mt-4 w-full">
          <source src={audioUrl} type="audio/mpeg" />
        </audio>
      )}
    </div>
  );
}