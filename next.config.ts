import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  reactStrictMode: true,
};

export default nextConfig;