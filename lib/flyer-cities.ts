export interface CityFlyerConfig {
  slug: string;
  cityName: string;
  greeting: string;
  tagline?: string;
  couponCode: string;
  discountText: string;
}

const CITY_CONFIGS: Record<string, CityFlyerConfig> = {
  ahmedabad: {
    slug: "ahmedabad",
    cityName: "Ahmedabad",
    greeting: "Kem Cho Ahmedabad! 🌾✨",
    tagline: "",
    couponCode: "AHMEDABAD100",
    discountText: "Get Flat ₹100 OFF on your first order",
  },
  mumbai: {
    slug: "mumbai",
    cityName: "Mumbai",
    greeting: "Kasa Kay Mumbai! 🌊✨",
    tagline: "",
    couponCode: "MUMBAI100",
    discountText: "Get Flat ₹100 OFF on your first order",
  },
  delhi: {
    slug: "delhi",
    cityName: "Delhi NCR",
    greeting: "Dilli Dilwalon Ki! 🏛️✨",
    tagline: "",
    couponCode: "DELHI100",
    discountText: "Get Flat ₹100 OFF on your first order",
  },
  bengaluru: {
    slug: "bengaluru",
    cityName: "Bengaluru",
    greeting: "Namma Bengaluru! 🌿✨",
    tagline: "",
    couponCode: "BLR100",
    discountText: "Get Flat ₹100 OFF on your first order",
  },
  surat: {
    slug: "surat",
    cityName: "Surat",
    greeting: "Kem Cho Surat! 💎✨",
    tagline: "",
    couponCode: "SURAT100",
    discountText: "Get Flat ₹100 OFF on your first order",
  },
  vadodara: {
    slug: "vadodara",
    cityName: "Vadodara",
    greeting: "Kem Cho Vadodara! 🎨✨",
    tagline: "",
    couponCode: "VADODARA100",
    discountText: "Get Flat ₹100 OFF on your first order",
  },
  jaipur: {
    slug: "jaipur",
    cityName: "Jaipur",
    greeting: "Khamma Ghani Jaipur! 🏰✨",
    tagline: "",
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
    tagline: "",
    couponCode: "FLYER100",
    discountText: "Get Flat ₹100 OFF on your first order",
  };
}
