import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  reactStrictMode: false, // Disable during debugging
  // Add these to help with hydration errors
  compiler: {
    removeConsole: false, // Keep console logs
  },
};

export default nextConfig;