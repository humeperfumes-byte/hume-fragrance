import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RakshaBandhanGiftPage from "@/components/RakshaBandhanGiftPage";
import { JsonLd } from "@/components/JsonLd";
import { getRequestSiteUrl } from "@/lib/request-site";
import { siteUrlForBase } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = await getRequestSiteUrl();
  const canonical = siteUrlForBase(baseUrl, "/raksha-bandhan-gifts");
  return {
    title: "Raksha Bandhan Gift Hampers with Perfume & Rakhi | HUME",
    description: "Shop HUME Raksha Bandhan gift boxes for him and her with curated perfumes, Pure Gulab Jal and a Rakhi of your choice. Four boxes from INR 1,299.",
    keywords: ["raksha bandhan gift hamper", "rakhi gift for brother", "rakhi gift for sister", "perfume gift box rakhi", "rakhi hamper with perfume", "raksha bandhan gifts online India"],
    alternates: { canonical },
    openGraph: { title: "HUME Raksha Bandhan Gift Boxes", description: "Perfume, Pure Gulab Jal and a Rakhi chosen by you—gift boxes for him and her from INR 1,299.", url: canonical, images: [siteUrlForBase(baseUrl, "/images/occasions/rakhi.png")] },
  };
}

export default async function RakshaBandhanGiftsPage() {
  const baseUrl = await getRequestSiteUrl();
  const canonical = siteUrlForBase(baseUrl, "/raksha-bandhan-gifts");
  const faq = [
    ["What is included in a HUME Raksha Bandhan gift box?", "Every box includes one or two HUME-curated perfumes, HUME Pure Gulab Jal, a customer-selected Rakhi and Raksha Bandhan gift presentation."],
    ["How much do the Raksha Bandhan boxes cost?", "The one-perfume Essential boxes for Him and Her cost INR 1,299. The two-perfume Grand boxes for Him and Her cost INR 1,999."],
    ["Can I choose the Rakhi?", "Yes. Customers choose an available Rakhi style before adding the selected gift box to the cart."],
  ];
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "CollectionPage", name: "HUME Raksha Bandhan Gift Boxes", url: canonical, description: "Raksha Bandhan perfume gift boxes for him and her with Pure Gulab Jal and a chosen Rakhi.", isPartOf: { "@type": "WebSite", name: "HUME Fragrance", url: baseUrl } },
    { "@context": "https://schema.org", "@type": "ItemList", name: "Raksha Bandhan gift box options", numberOfItems: 4, itemListElement: [
      ["Gift Box for Him — 1 Perfume",1299],["Gift Box for Her — 1 Perfume",1299],["Gift Box for Him — 2 Perfumes",1999],["Gift Box for Her — 2 Perfumes",1999],
    ].map(([name,price], index) => ({ "@type": "ListItem", position: index + 1, item: { "@type": "Product", name, brand: { "@type": "Brand", name: "HUME Fragrance" }, offers: { "@type": "Offer", price, priceCurrency: "INR", availability: "https://schema.org/PreOrder", url: canonical } } })) },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([question,answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
  ];
  return <main className="min-h-screen bg-background"><JsonLd data={jsonLd}/><Header/><RakshaBandhanGiftPage/><Footer/></main>;
}
