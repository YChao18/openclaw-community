import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "60mb",
    },
  },
  output: "standalone",
  reactStrictMode: true,
};

export default nextConfig;
