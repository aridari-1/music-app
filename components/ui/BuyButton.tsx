"use client";

import { useState } from "react";

export default function BuyButton({
  songId,
  price,
}: {
  songId: string;
  price: number;
}) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
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
        alert(data.error || "Payment failed");
        return;
      }

      window.location.href = data.url;

    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBuy}
      className="w-full bg-white text-black py-3 rounded-xl font-medium hover:opacity-90 transition"
    >
      {loading ? "Processing..." : `Buy for ${price} XOF`}
    </button>
  );
}