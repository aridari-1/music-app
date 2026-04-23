"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageProvider";

export default function BuyButton({
  songId,
  price,
}: {
  songId: string;
  price: number;
}) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const res = await fetch("/api/paystack/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ songId }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.error);
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 💰 FORMAT PRICE
  const formattedPrice = new Intl.NumberFormat("fr-FR").format(price);

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className={`w-full py-3 rounded-xl font-medium transition ${
        loading
          ? "bg-white/50 text-black cursor-not-allowed"
          : "bg-white text-black hover:opacity-90 active:scale-[0.98]"
      }`}
    >
      {loading
        ? t.processing || "Processing..."
        : `${t.buy} ${formattedPrice} XOF`}
    </button>
  );
}