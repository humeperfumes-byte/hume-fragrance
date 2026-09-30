import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    // Supabase is quota-limited. Keep static generation serial so parallel
    // workers do not exhaust the connection pool and fall back to stale data.
    cpus: 1,
    staticGenerationMaxConcurrency: 1,
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
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    qualities: [55, 60, 75, 92],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
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
    const hotelSeoSlugs = [
      "commercial-fragrance-for-hotels",
      "hotel-scenting-solutions",
      "hotel-lobby-fragrance",
      "hotel-fragrance-diffuser",
      "best-fragrance-for-hotel-lobby",
      "hotel-scent-marketing",
      "resort-scenting-solutions",
      "resort-lobby-fragrance",
      "signature-scent-for-hotels",
      "how-to-make-a-hotel-smell-luxurious",
    ];
    const hotelRewrites = hotelSeoSlugs.map((slug) => ({
      source: `/${slug}`,
      destination: `/spaces/${slug}`,
    }));
    const gymSeoSlugs = [
      "gym-fragrance-diffuser",
      "best-fragrance-for-gym",
      "gym-scenting-machine",
      "commercial-diffuser-for-gym",
      "how-to-make-a-gym-smell-good",
      "fragrance-machine-for-2000-sq-ft-gym",
      "gym-air-freshener-commercial",
      "best-scent-for-fitness-center",
    ];
    const gymRewrites = gymSeoSlugs.map((slug) => ({
      source: `/${slug}`,
      destination: `/spaces/${slug}`,
    }));
    const officeSeoSlugs = [
      "office-fragrance-machine",
      "commercial-scenting-for-offices",
      "office-scenting-solutions",
      "best-fragrance-for-office-reception",
      "office-lobby-fragrance",
      "commercial-air-freshener-for-office",
      "signature-scent-for-office",
      "i-want-to-make-my-office-smell-good",
      "how-to-make-my-whole-office-smell-good",
      "luxury-fragrance-for-office",
    ];
    const officeRewrites = officeSeoSlugs.map((slug) => ({
      source: `/${slug}`,
      destination: `/spaces/${slug}`,
    }));
    const aeoSlugs = [
      "what-is-commercial-scenting",
      "how-does-a-commercial-fragrance-diffuser-work",
      "how-do-hotels-make-their-lobbies-smell-good",
      "what-fragrance-diffuser-is-best-for-a-hotel",
      "what-is-hvac-scenting",
      "how-much-does-commercial-scenting-cost",
      "how-often-does-a-commercial-diffuser-need-fragrance-oil",
      "what-is-the-best-diffuser-for-a-2000-sq-ft-space",
      "what-fragrance-is-best-for-a-gym",
      "what-is-the-difference-between-a-water-diffuser-and-an-oil-diffuser",
      "how-do-businesses-create-a-signature-scent",
      "is-scent-marketing-effective-for-businesses",
    ];
    const aeoRewrites = aeoSlugs.map((slug) => ({
      source: `/${slug}`,
      destination: `/spaces/${slug}`,
    }));
    return [
      ...seoRewrites,
      ...hotelRewrites,
      ...gymRewrites,
      ...officeRewrites,
      ...aeoRewrites,
      {
        source: "/bill",
        destination: "/invoice",
      },
    ];
  },
};

export default nextConfig;
