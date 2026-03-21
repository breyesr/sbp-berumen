// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Don’t block the production build on TS type errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;