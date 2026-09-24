import type { NextConfig } from "next";

const s3PublicUrl = process.env.S3_PUBLIC_URL ? new URL(process.env.S3_PUBLIC_URL) : null;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  // PGlite ships WASM + data files that must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite", "sharp"],
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 828, 1080, 1440, 1920, 2560],
    // Local storage is served from /media on the same origin.
    localPatterns: [{ pathname: "/media/**" }, { pathname: "/images/**" }],
    remotePatterns: s3PublicUrl
      ? [{ protocol: s3PublicUrl.protocol.replace(":", "") as "https" | "http", hostname: s3PublicUrl.hostname }]
      : [],
  },
};

export default nextConfig;
