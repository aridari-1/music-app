"use client";

import { useState } from "react";
import { getAudioUrl } from "@/services/songs";

export default function Player({ songId }: { songId: string }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handlePlay = async () => {
    try {
      const url = await getAudioUrl(songId);
      setAudioUrl(url);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <button
        onClick={handlePlay}
        className="bg-white text-black px-4 py-2 rounded"
      >
        ▶ Play
      </button>

      {audioUrl && (
        <audio controls autoPlay className="mt-4 w-full">
          <source src={audioUrl} />
        </audio>
      )}
    </div>
  );
}