import type { NextConfig } from "next";

import withBundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: ["isomorphic-dompurify"],
  transpilePackages: ["@sanity/ui", "@sanity/icons", "next-sanity"],
  trailingSlash: false,
  env: {
      NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  },
  // Suppress Next.js image warnings in development
  ...(process.env.NODE_ENV === 'development' && {
    logging: {
      fetches: {
        fullUrl: false,
      },
    },
  }),
  turbopack: {
    root: projectRoot,
  },
  experimental: {
    optimizeCss: true,
    inlineCss: true,
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/utils/sanityImageLoader.ts",
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }, { protocol: "https", hostname: "images.unsplash.com" }],
    qualities: [75, 90],
    deviceSizes: [640, 750, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },
  poweredByHeader: false,
  compress: true,
  headers: async () => {
    return [
      // 1. GLOBAL: Security & 5-minute CDN Cache
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Cache-Control",
            value:
              "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
          },
        ],
      },
      // 2. DYNAMIC APIs: No-Store Safety (Must come AFTER global)
      {
        source: "/api/(checkout|order|shipping|webhook)(.*)",
        headers: [
          {
            key: "Cache-Control",
            value:
              "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
        ],
      },
      // 3. REVALIDATION: Freshness required
      {
        source: "/api/revalidate",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=0" },
        ],
      },
    ];
  },
};

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withSentryConfig(bundleAnalyzer(nextConfig));
