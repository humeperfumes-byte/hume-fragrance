import discoverySetSeoData from "@/data/discovery-set-seo.json";

export interface DiscoverySetSeoPage {
  slug: string;
  title: string;
  h1: string;
  description: string;
  keywords: string[];
}

type DiscoverySetSeoData = {
  pages: DiscoverySetSeoPage[];
};

const data = discoverySetSeoData as DiscoverySetSeoData;

export function getAllDiscoverySetSeoPages() {
  return data.pages;
}

export function getDiscoverySetSeoPageBySlug(slug: string) {
  return data.pages.find((item) => item.slug === slug);
}

export function getDiscoverySetSeoSlugs() {
  return data.pages.map((item) => item.slug);
}
