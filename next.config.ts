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
};

export default nextConfig;
