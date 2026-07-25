export interface CityFlyerConfig {
  slug: string;
  cityName: string;
  greeting: string;
  tagline: string;
  bannerBg: string;
  couponCode: string;
  discountText: string;
}

const CITY_CONFIGS: Record<string, CityFlyerConfig> = {
  ahmedabad: {
    slug: "ahmedabad",
    cityName: "Ahmedabad",
    greeting: "Kem Cho Ahmedabad! 🌾✨",
    tagline: "Exclusive Blinkit & Zepto Partner Offer — Handcrafted Luxury Perfumes from Kannauj",
    bannerBg: "from-amber-950/80 via-stone-900 to-amber-950/90",
    couponCode: "AHMEDABAD100",
    discountText: "Get Flat ₹100 OFF on your first order",
  },
  mumbai: {
    slug: "mumbai",
    cityName: "Mumbai",
    greeting: "Kasa Kay Mumbai! 🌊✨",
    tagline: "Exclusive Blinkit & Zepto Partner Offer — Premium Long-Lasting EDP Perfumes",
    bannerBg: "from-blue-950/80 via-stone-900 to-indigo-950/90",
    couponCode: "MUMBAI100",
    discountText: "Get Flat ₹100 OFF on your first order",
  },
  delhi: {
    slug: "delhi",
    cityName: "Delhi NCR",
    greeting: "Dilli Dilwalon Ki! 🏛️✨",
    tagline: "Exclusive Blinkit & Zepto Partner Offer — Luxury Inspired Fragrances from Kannauj",
    bannerBg: "from-red-950/80 via-stone-900 to-amber-950/90",
    couponCode: "DELHI100",
    discountText: "Get Flat ₹100 OFF on your first order",
  },
  bengaluru: {
    slug: "bengaluru",
    cityName: "Bengaluru",
    greeting: "Namma Bengaluru! 🌿✨",
    tagline: "Exclusive Blinkit & Zepto Partner Offer — Fresh & Long-Lasting EDP Perfumes",
    bannerBg: "from-emerald-950/80 via-stone-900 to-teal-950/90",
    couponCode: "BLR100",
    discountText: "Get Flat ₹100 OFF on your first order",
  },
  surat: {
    slug: "surat",
    cityName: "Surat",
    greeting: "Kem Cho Surat! 💎✨",
    tagline: "Exclusive Blinkit & Zepto Partner Offer — Handcrafted Luxury Perfumes from Kannauj",
    bannerBg: "from-amber-950/80 via-stone-900 to-yellow-950/90",
    couponCode: "SURAT100",
    discountText: "Get Flat ₹100 OFF on your first order",
  },
  vadodara: {
    slug: "vadodara",
    cityName: "Vadodara",
    greeting: "Kem Cho Vadodara! 🎨✨",
    tagline: "Exclusive Blinkit & Zepto Partner Offer — Handcrafted Luxury Perfumes from Kannauj",
    bannerBg: "from-amber-950/80 via-stone-900 to-orange-950/90",
    couponCode: "VADODARA100",
    discountText: "Get Flat ₹100 OFF on your first order",
  },
  jaipur: {
    slug: "jaipur",
    cityName: "Jaipur",
    greeting: "Khamma Ghani Jaipur! 🏰✨",
    tagline: "Exclusive Blinkit & Zepto Partner Offer — Royal Inspired Fragrances from Kannauj",
    bannerBg: "from-rose-950/80 via-stone-900 to-pink-950/90",
    couponCode: "JAIPUR100",
    discountText: "Get Flat ₹100 OFF on your first order",
  },
};

export function getCityFlyerConfig(citySlug: string): CityFlyerConfig {
  const normalized = citySlug.toLowerCase().trim();
  if (CITY_CONFIGS[normalized]) {
    return CITY_CONFIGS[normalized];
  }

  // Graceful fallback for any unlisted city
  const formattedName = citySlug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    slug: normalized,
    cityName: formattedName,
    greeting: `Welcome ${formattedName}! ✨`,
    tagline: "Exclusive Blinkit & Zepto Partner Offer — Handcrafted Luxury Perfumes from Kannauj",
    bannerBg: "from-stone-900 via-zinc-900 to-stone-900",
    couponCode: "FLYER100",
    discountText: "Get Flat ₹100 OFF on your first order",
  };
}
