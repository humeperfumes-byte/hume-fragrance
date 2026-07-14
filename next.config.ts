import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "recharts",
      "framer-motion",
    ],
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    qualities: [55, 60, 75, 92],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "belvish.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn1.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "*.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "fimgs.net",
      },
      {
        protocol: "https",
        hostname: "images-static.nykaa.com",
      },
      {
        protocol: "https",
        hostname: "img.tatacliq.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "cdn.britannica.com",
      },
      {
        protocol: "https",
        hostname: "i.herbalreality.com",
      },
      {
        protocol: "https",
        hostname: "floralife.com",
      },
      {
        protocol: "https",
        hostname: "lattafa.com",
      },
      {
        protocol: "https",
        hostname: "images-cdn.ubuy.co.in",
      },
      {
        protocol: "https",
        hostname: "banasuraspices.com",
      },
      {
        protocol: "https",
        hostname: "cdn.wikifarmer.com",
      },
    ],
  },
  webpack: (config) => {
    config.externals.push({
      'drizzle-orm': 'commonjs drizzle-orm',
      '@neondatabase/serverless': 'commonjs @neondatabase/serverless',
    });
    return config;
  },
  async redirects() {
    return [
      {
        source: "/discovery-set/build-your-own-perfume-trial-kit-choose-10-3ml-samples",
        destination: "/discovery-set/build-your-own-perfume-trial-kit-choose-15-3ml-samples",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const slugs = [
      "best-perfume-trial-kit-india",
      "all-perfumes-discovery-set",
      "best-trial-kit",
      "discovery-set-under-1000",
      "discovery-set-under-500",
      "perfume-tester-pack-india",
      "buy-perfume-testers-online",
      "mens-perfume-trial-set",
      "womens-perfume-tester-kit",
      "try-before-buy-perfume",
      "unisex-fragrance-discovery-set",
      "affordable-luxury-perfume-samples",
      "build-your-own-perfume-kit",
      "fragrance-tester-gift-box",
      "premium-perfume-testers-3ml",
      "best-perfume-decants-india",
      "long-lasting-perfume-trial-pack",
      "daily-wear-perfume-tester-set",
      "niche-perfume-samples-india",
      "best-fragrance-sample-box",
      "miniature-perfume-set-for-travel",
      "top-rated-perfume-discovery-box",
      "luxury-fragrance-starter-kit",
      "byo-fragrance-discovery-set",
    ];
    const seoRewrites = slugs.map((slug) => ({
      source: `/${slug}`,
      destination: `/discovery-set/${slug}`,
    }));
    return [
      ...seoRewrites,
      {
        source: "/bill",
        destination: "/invoice",
      },
    ];
  },
};

export default nextConfig;
