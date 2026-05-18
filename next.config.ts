import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Required for GitHub Pages static export
  images: {
    unoptimized: true, // Next.js image optimization API isn't supported on static export
  },
  basePath: "/snake-game", // Base path matching the GitHub Pages repository subpath
};

export default nextConfig;
