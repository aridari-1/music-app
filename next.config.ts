import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vkmgokuwayyvysfemylu.supabase.co",
      },
    ],
  },
};

export default nextConfig;