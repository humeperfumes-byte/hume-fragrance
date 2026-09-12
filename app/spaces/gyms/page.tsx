import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SpacesShell } from "@/components/spaces/SpacesShell";
import GymPageDesign from "@/components/spaces/GymPageDesign";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gym Fragrance Solutions | HUME Spaces",
  description: "Specially designed aroma diffusers for gyms and fitness centres. Keep your space fresh, motivating and inviting — every day, at every hour.",
  alternates: { canonical: `${SITE_URL}/spaces/gyms` },
};

export default function GymsSpacePage() {
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "HUME Gym Fragrance Solutions",
      description: "Specially designed aroma diffusers for gyms and fitness centres in India.",
      provider: { "@type": "Organization", name: "HUME Fragrance", url: SITE_URL },
      areaServed: "India",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "HUME Spaces", item: `${SITE_URL}/spaces` },
        { "@type": "ListItem", position: 3, name: "Gym Fragrance Solutions", item: `${SITE_URL}/spaces/gyms` },
      ],
    },
  ];

  return (
    <SpacesShell>
      <JsonLd data={schema} />
      <GymPageDesign />
    </SpacesShell>
  );
}
