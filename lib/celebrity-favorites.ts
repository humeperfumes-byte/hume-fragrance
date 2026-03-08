export interface CelebrityFavorite {
  label: string;
  description: string;
  image: string;
  perfumeIds: string[];
}

export const celebrityFavorites: CelebrityFavorite[] = [
  {
    label: "SRK",
    description: "SRK Special combo profile",
    image: "/images/celebrities/srk.png",
    perfumeIds: ["srk-special"],
  },
  {
    label: "Virat Kohli",
    description: "Creed Viking style profile",
    image: "/images/celebrities/vk.png",
    perfumeIds: ["creed-viking"],
  },
  {
    label: "Taylor Swift",
    description: "Byredo Gypsy Water style profile",
    image: "/images/celebrities/taylor-s.png",
    perfumeIds: ["gypsy-water"],
  },
  {
    label: "David Beckham",
    description: "Bleu de Chanel style profile",
    image: "/images/celebrities/david-b.png",
    perfumeIds: ["bleu-de-chanel"],
  },
  {
    label: "Johnny Depp",
    description: "Dior Sauvage style profile",
    image: "/images/celebrities/srk.png",
    perfumeIds: ["sauvage-noir"],
  },
];
