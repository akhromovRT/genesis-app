import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Включаем оптимизацию изображений
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
