import type { NextConfig } from "next";

// GitHub Pages project sites live under /<repo>/ — set BASE_PATH in CI.
const basePath = process.env.BASE_PATH;

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  basePath,
  assetPrefix: basePath,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
