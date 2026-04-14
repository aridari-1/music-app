"use client";

import { useLanguage } from "@/context/LanguageProvider";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setLang("en")}
        className={lang === "en" ? "text-white" : "text-white/50"}
      >
        EN
      </button>

      <button
        onClick={() => setLang("fr")}
        className={lang === "fr" ? "text-white" : "text-white/50"}
      >
        FR
      </button>
    </div>
  );
}