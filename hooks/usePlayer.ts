"use client";

import { useState } from "react";

export default function usePlayer() {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const play = async (songId: string) => {
    try {
      setLoading(true);

      const res = await fetch("/api/stream", {
        method: "POST",
        body: JSON.stringify({ songId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Cannot play this song");
        return;
      }

      // Stop previous audio
      if (audio) {
        audio.pause();
      }

      const newAudio = new Audio(data.url);

      newAudio.play();

      setAudio(newAudio);
      setCurrentSongId(songId);

    } catch (err) {
      alert("Playback error");
    } finally {
      setLoading(false);
    }
  };

  const pause = () => {
    if (audio) {
      audio.pause();
    }
  };

  return {
    play,
    pause,
    currentSongId,
    loading,
  };
}