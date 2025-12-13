import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "openweathermap.org" },
    ],
  },
};

export default nextConfig;
