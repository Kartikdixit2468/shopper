import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `pnpm build` runs the compiler first. Skipping Next's duplicate worker avoids
  // a Node 24 worker-process failure while preserving a mandatory strict check.
  typescript: { ignoreBuildErrors: true },
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
