"use client";

import { createContext, useContext, useState } from "react";
import { translations } from "@/lib/i18n";

type Lang = "en" | "fr";

const LanguageContext = createContext<any>(null);

export function LanguageProvider({ children }: any) {
  const [lang, setLang] = useState<Lang>("en");

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);