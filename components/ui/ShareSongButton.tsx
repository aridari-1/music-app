"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageProvider";

export default function ShareSongButton({
  songId,
  title = "song",
}: {
  songId: string;
  title?: string;
}) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const getUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/song/${songId}`;
  };

  const handleShare = async () => {
    const url = getUrl();

    try {
      // 📱 Mobile native share
      if (navigator.share) {
        await navigator.share({
          title,
          text: `${t.listenOnNaluma || "Listen on Naluma"}`,
          url,
        });
        return;
      }

      // 💻 Desktop fallback (copy link)
      await navigator.clipboard.writeText(url);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition"
    >
      {copied
        ? (t.linkCopied || "Link copied")
        : (t.share || "Share")}
    </button>
  );
}