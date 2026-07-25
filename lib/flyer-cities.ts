export interface CityFlyerConfig {
  slug: string;
  cityName: string;
  greeting: string;
  tagline: string;
  couponCode: string;
  discountText: string;
}

const CITY_CONFIGS: Record<string, CityFlyerConfig> = {
  ahmedabad: {
    slug: "ahmedabad",
    cityName: "Ahmedabad",
    greeting: "Kem Cho Ahmedabad! 🌾✨",
    tagline: "Handcrafted Luxury Perfumes from Kannauj",
    couponCode: "AHMEDABAD100",
    discountText: "Get Flat ₹100 OFF on your first order",
  },
  mumbai: {
    slug: "mumbai",
    cityName: "Mumbai",
    greeting: "Kasa Kay Mumbai! 🌊✨",
    tagline: "Premium Long-Lasting EDP Perfumes",
    couponCode: "MUMBAI100",
    discountText: "Get Flat ₹100 OFF on your first order",
  },
  delhi: {
    slug: "delhi",
    cityName: "Delhi NCR",
    greeting: "Dilli Dilwalon Ki! 🏛️✨",
    tagline: "Luxury Inspired Fragrances from Kannauj",
    couponCode: "DELHI100",
    discountText: "Get Flat ₹100 OFF on your first order",
  },
  bengaluru: {
    slug: "bengaluru",
    cityName: "Bengaluru",
    greeting: "Namma Bengaluru! 🌿✨",
    tagline: "Fresh & Long-Lasting EDP Perfumes",
    couponCode: "BLR100",
    discountText: "Get Flat ₹100 OFF on your first order",
  },
  surat: {
    slug: "surat",
    cityName: "Surat",
    greeting: "Kem Cho Surat! 💎✨",
    tagline: "Handcrafted Luxury Perfumes from Kannauj",
    couponCode: "SURAT100",
    discountText: "Get Flat ₹100 OFF on your first order",
  },
  vadodara: {
    slug: "vadodara",
    cityName: "Vadodara",
    greeting: "Kem Cho Vadodara! 🎨✨",
    tagline: "Handcrafted Luxury Perfumes from Kannauj",
    couponCode: "VADODARA100",
    discountText: "Get Flat ₹100 OFF on your first order",
  },
  jaipur: {
    slug: "jaipur",
    cityName: "Jaipur",
    greeting: "Khamma Ghani Jaipur! 🏰✨",
    tagline: "Royal Inspired Fragrances from Kannauj",
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
    tagline: "Handcrafted Luxury Perfumes from Kannauj",
    couponCode: "FLYER100",
    discountText: "Get Flat ₹100 OFF on your first order",
  };
}
