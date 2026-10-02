import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { getAllProducts, getProductById } from "@/lib/db/products";
import { getProductPath } from "@/lib/product-route";
import { DISCOVERY_SET_PATH } from "@/lib/discovery-set";
import { getRequestSiteUrl } from "@/lib/request-site";
import { getPerfumeGuide, getGuideCluster, CLUSTER_UPDATED } from "@/lib/perfume-guides";
import { SRK_INTERVIEW_REFERENCE, ICON_REFERENCE } from "@/lib/srk-special-guides";

export async function generateMetadata({ params }: { params: Promise<{slug:string}> }): Promise<Metadata> {
  const guide = getPerfumeGuide((await params).slug);
  if (!guide) return { title: "Guide not found", robots: { index: false } };
  const base = await getRequestSiteUrl();
  return { title: guide.title, description: guide.answer, alternates: { canonical: `${base}/${guide.slug}` }, openGraph: { title: guide.title, description: guide.answer, type: "article", url: `${base}/${guide.slug}` } };
}
export default async function PerfumeGuidePage({ params }: { params: Promise<{slug:string}> }) {
  const guide = getPerfumeGuide((await params).slug);
  if (!guide) notFound();
  const cluster = getGuideCluster(guide);
  const [product, base] = await Promise.all([getProductById(cluster.productId).then(async item => item ?? (await getAllProducts()).find(entry => entry.id === cluster.productId)), getRequestSiteUrl()]);
  if (!product) notFound();
  const relatedIds = guide.slug === "acqua-di-gio-profondo-alternatives-india" ? ["hawas", "lv-imagination", "pacific-chill"] : guide.slug === "creed-aventus-alternatives-india" ? ["sauvage-noir", "acqua-di-gio-profondo", "creed-viking"] : guide.slug === "ysl-black-opium-alternatives-india" ? ["good-girl", "libre-intense", "flora", "paradoxe"] : guide.slug === "carolina-herrera-good-girl-alternatives-india" ? ["black-opium", "libre-intense", "paradoxe", "flora"] : guide.slug === "rasasi-hawas-alternatives-india" ? ["hawas-ice", "acqua-di-gio-profondo", "sauvage-noir", "creed-aventus", "ultra-male"] : guide.slug === "louis-vuitton-imagination-alternatives-india" ? ["acqua-di-gio-profondo", "creed-aventus", "sauvage-noir", "pacific-chill", "myself"] : guide.slug === "lattafa-khamrah-qahwa-alternatives-india" ? ["black-opium", "stronger-with-you-intensely", "most-wanted", "ultra-male"] : guide.slug === "jean-paul-gaultier-le-male-elixir-alternatives-india" ? ["stronger-with-you-intensely", "most-wanted", "lattafa-khamrah-qahwa-100ml", "ultra-male", "sauvage-elixir"] : guide.slug === "jo-malone-myrrh-tonka-alternatives-india" ? ["lattafa-khamrah-qahwa-100ml", "oud-wood", "stronger-with-you-intensely", "black-opium", "le-male-elixir"] : guide.slug === "chanel-no-5-alternatives-india" ? ["flora", "libre-intense", "good-girl", "black-opium", "paradoxe"] : guide.slug === "tom-ford-ombre-leather-alternatives-india" ? ["oud-wood", "ombre-nomade", "creed-aventus", "sauvage-elixir", "myrrh-tonka"] : guide.slug === "louis-vuitton-ombre-nomade-alternatives-india" ? ["ombre-leather", "oud-wood", "myrrh-tonka", "sauvage-elixir"] : guide.slug === "tom-ford-oud-wood-alternatives-india" ? ["ombre-leather", "ombre-nomade", "myrrh-tonka", "creed-aventus"] : guide.slug === "mancera-red-tobacco-alternatives-india" ? ["lattafa-khamrah-qahwa-100ml", "le-male-elixir", "stronger-with-you-intensely", "ombre-nomade", "sauvage-elixir"] : guide.slug === "dior-sauvage-alternatives-india" ? ["acqua-di-gio-profondo", "creed-aventus", "hawas", "lv-imagination", "myself", "sauvage-elixir"] : guide.slug === "srk-perfume-alternative-india" ? ["oud-wood", "creed-aventus", "lv-imagination", "sauvage-noir", "myrrh-tonka"] : guide.slug === "hermes-terre-d-hermes-alternatives-india" ? ["creed-aventus", "sauvage-noir", "acqua-di-gio-profondo", "lv-imagination", "oud-wood"] : guide.slug === "bleu-de-chanel-alternatives-india" ? ["sauvage-noir", "acqua-di-gio-profondo", "creed-aventus", "hawas", "lv-imagination", "srk-special"] : guide.slug === "creed-viking-alternatives-india" ? ["creed-aventus", "sauvage-noir", "terre-de-hermes", "srk-special", "oud-wood"] : guide.slug === "ysl-y-edp-alternatives-india" ? ["sauvage-noir", "bleu-de-chanel", "hawas", "lv-imagination", "acqua-di-gio-profondo", "creed-aventus"] : guide.slug === "rabanne-1-million-alternatives-india" ? ["stronger-with-you-intensely", "le-male-elixir", "lattafa-khamrah-qahwa-100ml", "most-wanted", "eros"] : guide.slug === "parfums-de-marly-althair-alternatives-india" ? ["stronger-with-you-intensely", "le-male-elixir", "myrrh-tonka", "lattafa-khamrah-qahwa-100ml"] : guide.slug === "kilian-angels-share-alternatives-india" ? ["althair", "stronger-with-you-intensely", "myrrh-tonka", "lattafa-khamrah-qahwa-100ml"] : guide.slug === "versace-bright-crystal-alternatives-india" ? ["flora", "jadore", "her", "no-5"] : guide.slug === "versace-eros-edp-alternatives-india" ? ["1-million", "le-male-elixir", "stronger-with-you-intensely", "ysl-y-edp"] : guide.slug === "burberry-goddess-edp-alternatives-india" ? ["althair", "black-opium", "good-girl", "libre-intense"] : guide.slug === "burberry-her-edp-alternatives-india" ? ["bright-crystal", "flora", "jadore", "good-girl"] : guide.slug === "hugo-man-alternatives-india" ? ["ysl-y-edp", "sauvage-noir", "acqua-di-gio-profondo", "bleu-de-chanel"] : guide.slug === "rabanne-invictus-edt-alternatives-india" ? ["hawas", "acqua-di-gio-profondo", "lv-imagination", "sauvage-noir"] : guide.slug === "dior-jadore-edp-alternatives-india" ? ["flora", "bright-crystal", "no-5", "good-girl"] : guide.slug === "ysl-la-nuit-de-l-homme-edt-alternatives-india" ? ["ysl-y-edp", "bleu-de-chanel", "stronger-with-you-intensely", "eros"] : guide.slug === "azzaro-the-most-wanted-parfum-alternatives-india" ? ["stronger-with-you-intensely", "le-male-elixir", "althair", "angels-share"] : guide.slug === "afnan-9pm-night-out-alternatives-india" ? ["most-wanted", "stronger-with-you-intensely", "le-male-elixir", "angels-share"] : guide.slug === "tom-ford-noir-extreme-edp-alternatives-india" ? ["althair", "most-wanted", "myrrh-tonka", "angels-share"] : guide.slug === "louis-vuitton-pacific-chill-alternatives-india" ? ["lv-imagination", "acqua-di-gio-profondo", "hawas", "invictus"] : guide.slug === "tom-ford-tobacco-vanille-alternatives-india" ? ["red-tobacco", "noir-extreme", "myrrh-tonka", "angels-share"] : guide.slug === "chanel-allure-homme-sport-alternatives-india" ? ["bleu-de-chanel", "acqua-di-gio-profondo", "ysl-y-edp", "sauvage-noir"] : guide.slug === "mfk-baccarat-rouge-540-alternatives-india" ? ["her", "myrrh-tonka", "oud-wood", "black-opium"] : guide.slug === "gucci-guilty-pour-homme-alternatives-india" ? ["bleu-de-chanel", "ysl-y-edp", "hugo-boss", "la-nuit"] : guide.slug === "rasasi-hawas-ice-alternatives-india" ? ["hawas", "acqua-di-gio-profondo", "lv-imagination", "invictus"] : guide.slug === "dior-homme-intense-alternatives-india" ? ["noir-extreme", "la-nuit", "myrrh-tonka", "ombre-leather"] : guide.slug === "maison-margiela-replica-jazz-club-alternatives-india" ? ["tobacco-vanille", "angels-share", "red-tobacco", "myrrh-tonka"] : guide.slug === "ysl-libre-intense-alternatives-india" ? ["goddess", "black-opium", "good-girl", "jadore"] : guide.slug === "ysl-myslf-alternatives-india" ? ["guilty-homme", "bleu-de-chanel", "ysl-y-edp", "acqua-di-gio-profondo"] : guide.slug === "maison-crivelli-oud-maracuja-alternatives-india" ? ["ombre-nomade", "ombre-leather", "oud-wood", "red-tobacco"] : guide.slug === "prada-paradoxe-alternatives-india" ? ["libre-intense", "jadore", "good-girl", "her"] : guide.slug === "valentino-born-in-roma-intense-alternatives-india" ? ["stronger-with-you-intensely", "althair", "le-male-elixir", "most-wanted"] : guide.slug === "dior-sauvage-elixir-alternatives-india" ? ["sauvage-noir", "creed-viking", "terre-de-hermes", "red-tobacco"] : guide.slug === "viktor-rolf-spicebomb-alternatives-india" ? ["red-tobacco", "tobacco-vanille", "replica-jazz-club-100ml", "sauvage-elixir"] : guide.slug === "gucci-flora-alternatives-india" ? ["jadore", "bright-crystal", "no-5", "her"] : [];
  const catalog = relatedIds.length > 0 ? await getAllProducts() : [];
  const relatedProducts = relatedIds.flatMap(id => catalog.filter(item => item.id === id));
  const url = `${base}/${guide.slug}`;
  const faqs = [...guide.sections, guide.cluster === "srk-special" ? {question:"Is HUME SRK Special endorsed by Shah Rukh Khan, Diptyque or Dunhill?",answer:"No. HUME SRK Special is an independent inspired interpretation with no endorsement, sponsorship, collaboration or affiliation with Shah Rukh Khan, Diptyque or Dunhill. His original statement names the fragrance houses, not Tam Dao and Icon as the exact variants."} : {question:`Is HUME affiliated with ${cluster.brand}?`,answer:`No. ${cluster.name} is an independent inspired fragrance. It is not manufactured, endorsed or sponsored by ${cluster.brand}.`}];
  return <main className="bg-background min-h-screen"><Header /><JsonLd data={[
    {"@context":"https://schema.org","@type":"Article",headline:guide.title,description:guide.answer,url,datePublished:CLUSTER_UPDATED,dateModified:CLUSTER_UPDATED,author:{"@type":"Organization",name:"HUME Fragrance"},publisher:{"@type":"Organization",name:"HUME Fragrance",url:base},mainEntityOfPage:url},
    {"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map(faq=>({"@type":"Question",name:faq.question,acceptedAnswer:{"@type":"Answer",text:faq.answer}}))},
    {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{name:"Home",item:base},{name:"Perfume Guides",item:`${base}/guides`},{name:guide.title,item:url}].map((item,index)=>({"@type":"ListItem",position:index+1,...item}))}
  ]} /><article className="mx-auto max-w-3xl px-6 pb-20 pt-32"><nav className="mb-8 text-sm"><Link href="/guides" className="underline">Perfume guides</Link></nav><h1 className="text-3xl md:text-4xl mb-6">{guide.title}</h1><p className="leading-relaxed text-lg">{guide.answer}</p><p className="mt-4 text-sm text-muted-foreground">By HUME Fragrance · Updated 2 October 2026 · Brand buying guide</p>
  <section aria-label={`Shop ${cluster.name}`} className="my-8 overflow-hidden rounded-2xl border border-border bg-card">
    <div className="grid sm:grid-cols-[200px_1fr]">
      <Link href={getProductPath(product)} className="relative block aspect-square bg-muted" aria-label={`View ${cluster.name} product`}>
        <Image src={product.images[0] || "/images/logo.png"} alt={`${cluster.name} perfume bottle`} fill sizes="(max-width: 640px) 100vw, 200px" className="object-contain p-4" />
      </Link>
      <div className="flex flex-col items-start justify-center p-6">
        <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Explore the perfume</p>
        <h2 className="text-2xl"><Link href={getProductPath(product)}>{cluster.name}</Link></h2>
        <p className="mt-2 text-sm text-muted-foreground">Inspired by {cluster.inspiration}</p>
        <p className="mt-4 text-lg font-medium">₹{product.price.toLocaleString("en-IN")} <span className="text-sm font-normal text-muted-foreground">/ {product.size}</span></p>
        <p className="mt-2 text-sm">{product.badges?.soldOut ? "Out of stock" : product.badges?.comingSoon ? "Coming soon" : "Available to order"}</p>
        <Link href={getProductPath(product)} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-80">
          {product.badges?.soldOut || product.badges?.comingSoon ? "View product and availability" : `Shop ${cluster.name.replace("HUME ", "")}`}
        </Link>
      </div>
    </div>
  </section>
  <section className="my-10"><h2 className="text-2xl mb-4">What are the current HUME specifications?</h2><table className="w-full text-left text-sm"><tbody>{[
    ["Product", cluster.name],["Inspiration", cluster.inspiration],["Bottle size",product.size],["Listed price",`₹${product.price}`],["Availability",product.badges?.soldOut?"Out of stock":product.badges?.comingSoon?"Coming soon":"Check the product page before ordering"],["Fragrance oil","Approximately 40%, as specified by HUME"],["Performance evidence","Controlled wear-test results not published in this guide"]
  ].map(([label,value])=><tr key={label} className="border-b"><th className="py-3 pr-4 font-medium">{label}</th><td className="py-3">{value}</td></tr>)}</tbody></table><p className="mt-4 leading-relaxed">HUME developed this fragrance with the goal of approaching the inspiration profile closely. Oil concentration is a formulation specification, not a guarantee of superior longevity, projection or similarity.</p></section>
  {guide.sections.map(section=><section key={section.question} className="my-8"><h2 className="text-2xl mb-3">{section.question}</h2><p className="leading-relaxed">{section.answer}</p></section>)}
  {guide.slug === "hume-acqua-di-gio-vs-armani-acqua-di-gio-profondo" && <section className="my-10"><h2 className="text-2xl mb-4">How do the verified specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Acqua di Gio</th><th className="py-3">Armani Acqua di Giò Profondo</th></tr></thead><tbody>{[
    ["Position", "Independent inspired alternative", "Original designer fragrance"],
    ["Scent direction", "Designed around Profondo-style marine freshness", "Marine and aromatic Eau de Parfum reference"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified"],
    ["Listed price", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer price for your chosen size"],
    ["Buyer priority", "Accessible pricing and inspired scent direction", "The original composition and designer presentation"],
    ["Relative performance", "No controlled comparison published in this guide", "No relative result asserted"]
  ].map(([factor,hume,armani])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{armani}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-aventus-vs-creed-aventus" && <section className="my-10"><h2 className="text-2xl mb-4">How do the verified specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Aventus</th><th className="py-3">Creed Aventus</th></tr></thead><tbody>{[
    ["Position", "Independent inspired alternative", "Original niche fragrance"],
    ["Scent direction", "Designed around fruity, smoky and woody Aventus-style character", "Original Aventus composition"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Listed price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer price for your chosen size"],
    ["Buying focus", "Accessible pricing, stated concentration and performance-focused formulation", "The original scent and luxury niche presentation"],
    ["Similarity and performance", "No controlled side-by-side result published in this guide", "No relative result or batch comparison asserted"]
  ].map(([factor,hume,creed])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{creed}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-black-opium-vs-ysl-black-opium" && <section className="my-10"><h2 className="text-2xl mb-4">How do the verified specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Black Opium</th><th className="py-3">YSL Black Opium Eau de Parfum</th></tr></thead><tbody>{[
    ["Position", "Independent inspired alternative", "Original designer fragrance"],
    ["Scent direction", "Designed around Black Opium-style coffee, vanilla and white florals", "Original coffee-floral Eau de Parfum reference"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Character", "Intended warm, sweet gourmand-floral profile", "Coffee, white flowers and vanilla highlighted by YSL"],
    ["Listed price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer price for your chosen size"],
    ["Buying focus", "Accessible pricing, stated concentration and performance-focused formulation", "The original composition and designer presentation"],
    ["Similarity and performance", "No controlled side-by-side result published in this guide", "No relative result asserted"]
  ].map(([factor,hume,ysl])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{ysl}</td></tr>)}</tbody></table></div></section>}
  {relatedProducts.length > 0 && <section className="my-8"><h2 className="text-2xl mb-3">Which other HUME perfumes can you compare?</h2><p className="mb-4">Explore these contrasting scent directions alongside {cluster.name}. Check each product page for current availability.</p><ul className="space-y-3">{relatedProducts.map(item=><li key={item.id}><Link className="underline" href={getProductPath(item)}>HUME {item.name}</Link> — inspired by {item.inspirationBrand} {item.inspiration}{item.badges?.soldOut ? " (out of stock)" : item.badges?.comingSoon ? " (coming soon)" : ""}</li>)}</ul>{guide.cluster === "sauvage" && <p className="mt-4"><Link className="underline" href="/how-is-hume-acqua-di-gio">Explore Acqua di Gio’s marine direction</Link> or <Link className="underline" href="/how-is-hume-hawas">compare Hawas’s fresh style</Link>.</p>}{guide.cluster === "red-tobacco" && <p className="mt-4"><Link className="underline" href="/how-is-hume-khamrah-qahwa">Explore Khamrah Qahwa’s coffee-gourmand direction</Link> or <Link className="underline" href="/how-is-hume-le-male-elixir">compare Le Male Elixir’s sweet aromatic style</Link>.</p>}{guide.cluster === "oud-wood" && <p className="mt-4"><Link className="underline" href="/how-is-hume-ombre-nomade">Explore Ombre Nomade’s smoky oud direction</Link> or <Link className="underline" href="/how-is-hume-myrrh-tonka">compare Myrrh &amp; Tonka’s warm style</Link>.</p>}{guide.cluster === "ombre-nomade" && <p className="mt-4"><Link className="underline" href="/how-is-hume-omb-leather">Explore Omb Leather’s leather-led style</Link> or <Link className="underline" href="/how-is-hume-myrrh-tonka">compare Myrrh &amp; Tonka’s warm direction</Link>.</p>}{guide.cluster === "omb-leather" && <p className="mt-4"><Link className="underline" href="/how-is-hume-aventus">Explore Aventus’s contrasting style</Link> or <Link className="underline" href="/how-is-hume-myrrh-tonka">compare Myrrh &amp; Tonka’s warm direction</Link>.</p>}{guide.cluster === "no-5" && <p className="mt-4"><Link className="underline" href="/how-is-hume-good-girl">Explore Good Girl’s floral gourmand direction</Link> or <Link className="underline" href="/how-is-hume-black-opium">compare Black Opium’s coffee-floral style</Link>.</p>}{guide.cluster === "myrrh-tonka" && <p className="mt-4"><Link className="underline" href="/how-is-hume-khamrah-qahwa">Explore Khamrah Qahwa’s coffee-gourmand direction</Link> or <Link className="underline" href="/how-is-hume-le-male-elixir">compare Le Male Elixir’s sweet aromatic style</Link>.</p>}{guide.cluster === "le-male-elixir" && <p className="mt-4"><Link className="underline" href="/how-is-hume-strong-with-you">Explore Strong With You’s warm sweet direction</Link> or <Link className="underline" href="/how-is-hume-khamrah-qahwa">compare Khamrah Qahwa’s coffee-gourmand style</Link>.</p>}{guide.cluster === "khamrah-qahwa" && <p className="mt-4"><Link className="underline" href="/how-is-hume-black-opium">Explore Black Opium’s coffee-floral direction</Link> or <Link className="underline" href="/how-is-hume-strong-with-you">compare Strong With You’s warm sweet style</Link>.</p>}{guide.cluster === "imagine" && <p className="mt-4"><Link className="underline" href="/how-is-hume-acqua-di-gio">Explore Acqua di Gio’s marine direction</Link> or <Link className="underline" href="/how-is-hume-aventus">compare Aventus’s fruity-woody style</Link>.</p>}{guide.cluster === "hawas" && <p className="mt-4"><Link className="underline" href="/how-is-hume-acqua-di-gio">Explore Acqua di Gio’s marine direction</Link> or <Link className="underline" href="/how-is-hume-aventus">compare Aventus’s fruity-woody style</Link>.</p>}{guide.cluster === "good-girl" && <p className="mt-4"><Link className="underline" href="/how-is-hume-black-opium">Explore Black Opium’s coffee-vanilla direction</Link> or <Link className="underline" href="/hume-black-opium-review">read its buying guide</Link>.</p>}{guide.cluster === "aventus" && <p className="mt-4"><Link className="underline" href="/how-is-hume-acqua-di-gio">Compare Acqua di Gio’s marine direction</Link> or <Link className="underline" href="/how-is-hume-strong-with-you">explore Strong With You’s warmer, sweet style</Link>.</p>}</section>}
  {guide.slug === "hume-good-girl-vs-carolina-herrera-good-girl" && <section className="my-10"><h2 className="text-2xl mb-4">How do the verified specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Good Girl</th><th className="py-3">Carolina Herrera Good Girl Eau de Parfum</th></tr></thead><tbody>{[
    ["Position", "Independent inspired alternative", "Original designer fragrance"],
    ["Scent direction", "Designed around Good Girl-style sweet white florals and warm gourmand depth", "Original ambery floral Eau de Parfum"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Character", "Intended sweet, floral and warm profile", "Jasmine, tuberose, tonka and cocoa highlighted by Carolina Herrera"],
    ["Listed price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer price for your chosen size"],
    ["Buying focus", "Accessible pricing, stated concentration and performance-focused formulation", "The original composition and designer presentation"],
    ["Similarity and performance", "No controlled side-by-side result published in this guide", "No relative result asserted"]
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-hawas-vs-rasasi-hawas" && <section className="my-10"><h2 className="text-2xl mb-4">How do the verified specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Hawas</th><th className="py-3">Rasasi Hawas for Him</th></tr></thead><tbody>{[
    ["Position", "Independent inspired alternative", "Original Rasasi fragrance"],
    ["Scent direction", "Designed around Hawas-style aquatic freshness and fruity sweetness", "Original aquatic fragrance reference"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Numerical oil percentage not verified in this guide"],
    ["Character", "Intended fresh, aquatic, fruity and sweet profile", "Aquatic character with citrus, spice and warm woody aspects described by Rasasi"],
    ["Listed price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer price for your chosen size"],
    ["Buying focus", "Accessible pricing, stated concentration and performance-focused formulation", "The original Rasasi composition and presentation"],
    ["Similarity and performance", "No controlled side-by-side result published in this guide", "No relative result asserted"]
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-imagine-vs-louis-vuitton-imagination" && <section className="my-10"><h2 className="text-2xl mb-4">How do the verified specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Imagine</th><th className="py-3">Louis Vuitton Imagination</th></tr></thead><tbody>{[
    ["Position", "Independent inspired alternative", "Original luxury fragrance"],
    ["Scent direction", "Designed around Imagination-style citrus, tea and clean amber warmth", "Original Imagination composition"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Numerical oil percentage not verified in this guide"],
    ["Character", "Intended fresh citrus-tea and amber/Ambrox-style profile", "Citrus, black tea and an Ambrox-based amber accord highlighted by Louis Vuitton"],
    ["Listed price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current official local price for your chosen size"],
    ["Buying focus", "Accessible pricing, stated concentration and performance-focused formulation", "The original composition and Louis Vuitton presentation"],
    ["Similarity and performance", "No controlled side-by-side result published in this guide", "No relative result asserted"]
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-khamrah-qahwa-vs-lattafa-khamrah-qahwa" && <section className="my-10"><h2 className="text-2xl mb-4">How do the verified specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Khamrah Qahwa</th><th className="py-3">Lattafa Khamrah Qahwa</th></tr></thead><tbody>{[
    ["Position", "Independent inspired alternative", "Original Lattafa fragrance"],
    ["Scent direction", "Designed around Qahwa-style coffee, sweet spice and gourmand warmth", "Original Khamrah Qahwa composition"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Numerical oil percentage not verified in this guide"],
    ["Character", "Intended rich coffee-spice and vanilla-tonka-style sweetness", "Spice, praline, candied fruits, coffee and warm sweet base notes listed by Lattafa"],
    ["Listed price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer price for your chosen size"],
    ["Buying focus", "Accessible pricing, stated concentration and performance-focused formulation", "The original Lattafa composition and presentation"],
    ["Similarity and performance", "No controlled side-by-side result published in this guide", "No relative result asserted"]
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-le-male-elixir-vs-jean-paul-gaultier-le-male-elixir" && <section className="my-10"><h2 className="text-2xl mb-4">How do the verified specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Le Male Elixir</th><th className="py-3">Jean Paul Gaultier Le Male Elixir Parfum</th></tr></thead><tbody>{[
    ["Position", "Independent inspired alternative", "Original designer fragrance"],
    ["Scent direction", "Designed around Le Male Elixir-style sweet aromatic warmth", "Original Le Male Elixir Parfum composition"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Marketed as Parfum; numerical oil percentage not verified here"],
    ["Character", "Intended aromatic, sweet and warm tonka-vanilla-style profile", "Lavender, benzoin and tonka highlighted by Jean Paul Gaultier"],
    ["Listed price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer price for your chosen size"],
    ["Buying focus", "Accessible pricing, stated concentration and performance-focused formulation", "The original composition and designer presentation"],
    ["Similarity and performance", "No controlled side-by-side result published in this guide", "No relative result asserted"]
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-myrrh-tonka-vs-jo-malone-myrrh-tonka" && <section className="my-10"><h2 className="text-2xl mb-4">How do the verified specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Myrrh & Tonka</th><th className="py-3">Jo Malone Myrrh & Tonka Cologne Intense</th></tr></thead><tbody>{[
    ["Position", "Independent inspired alternative", "Original luxury fragrance"],
    ["Scent direction", "Designed around Myrrh & Tonka-style resinous warmth and creamy sweetness", "Original Myrrh & Tonka composition"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Called Cologne Intense; numerical oil percentage not verified here"],
    ["Character", "Intended warm, resinous and tonka-rich profile", "Lavender, Omumbiri myrrh and tonka highlighted by Jo Malone"],
    ["Listed price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer price for your chosen size"],
    ["Buying focus", "Accessible pricing, stated concentration and performance-focused formulation", "The original composition and Jo Malone presentation"],
    ["Similarity and performance", "No controlled side-by-side result published in this guide", "No relative result asserted"]
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-sauvage-vs-dior-sauvage" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Sauvage</th><th className="py-3">Dior Sauvage Eau de Toilette</th></tr></thead><tbody>{[
    ["Position", "Independent inspired alternative", "Original Dior fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Toilette; numerical oil percentage not verified here"],
    ["Character", "Intended fresh citrus, peppery spice and woody-ambery depth", "Original Sauvage EDT composition"],
    ["Listed price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer price for your chosen size"],
    ["Buying focus", "Accessible price, stated concentration and inspiration direction", "Original composition and Dior presentation"],
    ["Similarity and performance", "No controlled side-by-side result published in this guide", "No relative result asserted"]
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-red-tobacco-vs-mancera-red-tobacco" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Red Tobacco</th><th className="py-3">Mancera Red Tobacco</th></tr></thead><tbody>{[
    ["Position", "Independent inspired alternative", "Original Mancera fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Character", "Intended dark, spicy, smoky tobacco with warm sweetness", "Original Red Tobacco composition"],
    ["Listed price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer price for your chosen size"],
    ["Buying focus", "Accessible price, stated concentration and inspiration direction", "Original composition and Mancera presentation"],
    ["Similarity and performance", "No controlled side-by-side result published in this guide", "No relative result asserted"]
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-oud-wood-vs-tom-ford-oud-wood" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Oud Wood</th><th className="py-3">Tom Ford Oud Wood Eau de Parfum</th></tr></thead><tbody>{[
    ["Position", "Independent inspired alternative", "Original luxury fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Character", "Intended refined woody spice, smooth oud and warm depth", "Original Oud Wood Eau de Parfum composition"],
    ["Listed price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer price for your chosen size"],
    ["Buying focus", "Accessible price, stated concentration and inspiration direction", "Original composition and Tom Ford presentation"],
    ["Similarity and performance", "No controlled side-by-side result published in this guide", "No relative result asserted"]
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-ombre-nomade-vs-louis-vuitton-ombre-nomade" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Ombre Nomade</th><th className="py-3">Louis Vuitton Ombre Nomade</th></tr></thead><tbody>{[
    ["Position", "Independent inspired alternative", "Original Louis Vuitton fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Numerical oil percentage not verified in this guide"],
    ["Character", "Intended smoky, woody and resinous oud with fruity contrast", "Original oud-focused composition"],
    ["Listed price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current Louis Vuitton price for your chosen size"],
    ["Buying focus", "Accessible price, stated concentration and inspiration direction", "Original composition and Louis Vuitton presentation"],
    ["Similarity and performance", "No controlled side-by-side result published in this guide", "No relative result asserted"]
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-omb-leather-vs-tom-ford-ombre-leather" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Omb Leather</th><th className="py-3">Tom Ford Ombré Leather Eau de Parfum</th></tr></thead><tbody>{[
    ["Position", "Independent inspired alternative", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Character", "Intended dark leather, spicy freshness, floral contrast and earthy warmth", "Original floral-leather composition"],
    ["Listed price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer price for your chosen size"],
    ["Buying focus", "Accessible price, stated concentration and inspiration direction", "Original composition and Tom Ford presentation"],
    ["Similarity and performance", "No controlled side-by-side result published in this guide", "No relative result asserted"]
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-no-5-vs-chanel-no-5" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME No 5</th><th className="py-3">Chanel N°5 Eau de Parfum</th></tr></thead><tbody>{[
    ["Position", "Independent inspired alternative", "Original luxury fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Character", "Intended classic aldehydic-floral richness and vanilla-like warmth", "May rose, jasmine, citrus, aldehydes and vanilla described by Chanel"],
    ["Listed price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer price for your chosen size"],
    ["Similarity and performance", "No controlled side-by-side result published in this guide", "No relative result asserted"]
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-terre-de-hermes-vs-hermes-terre-d-hermes" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Terre de Hermes</th><th className="py-3">Hermès Terre d’Hermès Eau de Toilette</th></tr></thead><tbody>{[
    ["Position", "Independent inspired alternative", "Original Hermès fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Toilette; numerical oil percentage not verified here"],
    ["Character", "Intended citrus, mineral and dry woody direction", "Grapefruit, cedar and flint highlighted by Hermès"],
    ["Listed price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised price for your chosen size"],
    ["Similarity and performance", "No controlled side-by-side result published here", "No relative performance asserted"]
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "terre-de-hermes" && <p className="my-6">Explore contrasting fresh and woody directions: <Link className="underline" href="/how-is-hume-aventus">Aventus</Link>, <Link className="underline" href="/how-is-hume-sauvage">Sauvage</Link>, <Link className="underline" href="/how-is-hume-acqua-di-gio">Acqua di Gio</Link>, <Link className="underline" href="/how-is-hume-imagine">Imagine</Link> and <Link className="underline" href="/how-is-hume-oud-wood">Oud Wood</Link>.</p>}
  {guide.slug === "hume-jadore-vs-dior-jadore-edp" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME J’adore</th><th className="py-3">Dior J’adore Eau de Parfum</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Intended character", "Ylang-ylang, rose and jasmine bouquet direction", "Ylang-ylang, Damascus rose, jasmine grandiflorum and sambac"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Dior endorsement", "Dior product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "jadore" && <p className="my-6">Explore contrasting florals: <Link className="underline" href="/how-is-hume-bright-crystal">Bright Crystal</Link> and <Link className="underline" href="/how-is-hume-no-5">No 5</Link>.</p>}
  {guide.slug === "hume-her-vs-burberry-her-edp" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Her</th><th className="py-3">Burberry Her Eau de Parfum</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Intended character", "Berries, florals, woods and creamy amber", "Berry character, violet, jasmine, woods and creamy amber"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Burberry endorsement", "Burberry product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "her" && <p className="my-6">Explore contrasting directions: <Link className="underline" href="/how-is-hume-bright-crystal">Bright Crystal</Link> and <Link className="underline" href="/how-is-hume-goddess">Goddess</Link>.</p>}
  {guide.slug === "hume-invictus-vs-rabanne-invictus-edt" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Invictus</th><th className="py-3">Rabanne Invictus Eau de Toilette</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Toilette; numerical oil percentage not verified here"],
    ["Intended character", "Grapefruit, marine freshness and woody depth", "Grapefruit, marine accord and guaiac wood"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Rabanne endorsement", "Rabanne product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "invictus" && <p className="my-6">Explore fresh directions: <Link className="underline" href="/how-is-hume-hawas">Hawas</Link> and <Link className="underline" href="/how-is-hume-acqua-di-gio">Acqua di Gio</Link>.</p>}
  {guide.slug === "hume-la-nuit-vs-ysl-la-nuit-de-l-homme-edt" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME La Nuit</th><th className="py-3">YSL La Nuit de L’Homme Eau de Toilette</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Toilette; numerical oil percentage not verified here"],
    ["Intended character", "Cardamom, aromatic texture and woody depth", "Cardamom, cedar and coumarin highlighted by YSL"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Yves Saint Laurent endorsement", "Yves Saint Laurent product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "la-nuit" && <p className="my-6">Explore contrasting directions: <Link className="underline" href="/how-is-hume-y-edp">Y EDP</Link> and <Link className="underline" href="/how-is-hume-eros">Eros</Link>.</p>}
  {guide.slug === "hume-pacific-chill-vs-louis-vuitton-pacific-chill" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Pacific Chill</th><th className="py-3">Louis Vuitton Pacific Chill</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Numerical oil percentage not verified here"],
    ["Intended character", "Citrus, blackcurrant and aromatic freshness", "Blackcurrant, citron and carrot seeds highlighted by Louis Vuitton"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Louis Vuitton endorsement", "Louis Vuitton product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "pacific-chill" && <p className="my-6">Explore fresh directions: <Link className="underline" href="/how-is-hume-imagine">Imagine</Link> and <Link className="underline" href="/how-is-hume-acqua-di-gio">Acqua di Gio</Link>.</p>}
  {guide.slug === "hume-br-540-vs-mfk-baccarat-rouge-540" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME BR 540</th><th className="py-3">MFK Baccarat Rouge 540 EDP reference</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Intended character", "Ambery woody, saffron and floral direction", "Jasmine, saffron, ambergris-style accord and dry woods"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Maison Francis Kurkdjian endorsement", "Maison Francis Kurkdjian product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-guilty-pour-homme-vs-gucci-guilty-pour-homme" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Guilty Pour Homme</th><th className="py-3">Gucci Guilty Pour Homme EDT reference</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Toilette; numerical oil percentage not verified here"],
    ["Intended character", "Lavender, citrus, floral and woody direction", "Orange blossom, neroli, lavender, patchouli and cedar"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Gucci endorsement", "Gucci product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-hawas-ice-vs-rasasi-hawas-ice" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Hawas Ice</th><th className="py-3">Rasasi Hawas Ice reference</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Numerical fragrance-oil percentage not verified here"],
    ["Intended character", "Fresh fruity, woody and musky direction", "Apple, citrus, marine accord, plum, moss and driftwood"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Rasasi endorsement", "Rasasi product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "hawas-ice" && <p className="my-6">Compare the separate classic inspiration: <Link className="underline" href="/how-is-hume-hawas">HUME Hawas guide</Link>.</p>}
  {guide.slug === "hume-homme-intense-vs-dior-homme-intense" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Homme Intense</th><th className="py-3">Dior Homme Intense EDP reference</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Intended character", "Powdery iris, floral and woody direction", "Iris, ambery facet and cedarwood"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Dior endorsement", "Dior product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-jazz-club-vs-maison-margiela-replica-jazz-club" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Jazz Club</th><th className="py-3">Maison Margiela REPLICA Jazz Club EDT</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Toilette; numerical oil percentage not verified here"],
    ["Intended character", "Rum-style tobacco and vanilla direction", "Rum, tobacco leaf, vanilla and pink pepper"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Maison Margiela endorsement", "Maison Margiela product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-libre-intense-vs-ysl-libre-intense" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Libre Intense</th><th className="py-3">YSL Libre Intense EDP reference</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Intended character", "Lavender, floral and vanilla direction", "Lavender, orange blossom, orchid and vanilla"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Yves Saint Laurent endorsement", "Yves Saint Laurent product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-myself-vs-ysl-myslf" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Myself</th><th className="py-3">YSL MYSLF EDP reference</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Intended character", "Citrus, orange blossom and woody direction", "Bergamot, orange blossom, patchouli and warm woods"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Yves Saint Laurent endorsement", "Yves Saint Laurent product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-oud-maracuja-vs-maison-crivelli-oud-maracuja" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Oud Maracuja</th><th className="py-3">Maison Crivelli Oud Maracujá Extrait</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Extrait de Parfum; numerical oil percentage not verified here"],
    ["Intended character", "Passion fruit, oud and leather direction", "Passion fruit, oud, leather and warm resins"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Maison Crivelli endorsement", "Maison Crivelli product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-paradoxe-vs-prada-paradoxe" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Paradoxe</th><th className="py-3">Prada Paradoxe EDP reference</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Intended character", "Fruity brightness, white florals and amber musk", "Neroli bud, amber accord and musk"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Prada endorsement", "Prada product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-roma-intense-vs-valentino-born-in-roma-intense" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Roma Intense</th><th className="py-3">Valentino Uomo Born in Roma Intense EDP reference</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Intended character", "Vanilla, lavender and warm woody direction", "Vanilla, lavandin and vetiver"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Valentino endorsement", "Valentino product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-sauvage-elixir-vs-dior-sauvage-elixir" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Sauvage Elixir</th><th className="py-3">Dior Sauvage Elixir</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Elixir; numerical oil percentage not verified here"],
    ["Intended character", "Warm spices, lavender and woody depth", "Grapefruit, spices, lavender and rich woods"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Dior endorsement", "Dior product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-spice-inferno-vs-viktor-rolf-spicebomb" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Spice Inferno</th><th className="py-3">Viktor &amp; Rolf Spicebomb EDT</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Toilette; numerical oil percentage not verified here"],
    ["Intended character", "Warm spices, tobacco and leather", "Citrus, cinnamon, tobacco, leather and vetiver"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Viktor & Rolf endorsement", "Viktor & Rolf product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-flora-vs-gucci-flora" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Flora</th><th className="py-3">Gucci Flora — edition to confirm</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Depends on original edition; numerical oil percentage not verified here"],
    ["Intended character", "Peony, rose, osmanthus and woody warmth", "Identify the exact Flora edition before comparing notes"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Gucci endorsement", "Gucci product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.slug === "hume-allure-sport-vs-chanel-allure-homme-sport" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Allure Sport</th><th className="py-3">Chanel Allure Homme Sport EDT reference</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Toilette; numerical oil percentage not verified here"],
    ["Intended character", "Fresh citrus, woody and musky direction", "Mandarin, cedar, white musk and tonka"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Chanel endorsement", "Chanel product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "allure-sport" && <p className="my-6">Explore fresh directions: <Link className="underline" href="/how-is-hume-the-blue">The Blue</Link> and <Link className="underline" href="/how-is-hume-acqua-di-gio">Acqua di Gio</Link>.</p>}
  {guide.slug === "hume-hugo-boss-man-vs-hugo-man" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Hugo Boss Man</th><th className="py-3">HUGO Man Eau de Toilette</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Toilette; numerical oil percentage not verified here"],
    ["Intended character", "Green apple, fresh aromatics and woody depth", "Crisp green apple, aromatic notes and smoky fir balsam"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Hugo Boss endorsement", "Hugo Boss product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "hugo-boss-man" && <p className="my-6">Explore fresh directions: <Link className="underline" href="/how-is-hume-y-edp">Y EDP</Link> and <Link className="underline" href="/how-is-hume-acqua-di-gio">Acqua di Gio</Link>.</p>}
  {guide.slug === "hume-bright-crystal-vs-versace-bright-crystal" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Bright Crystal</th><th className="py-3">Versace Bright Crystal Eau de Toilette</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Toilette; numerical oil percentage not verified here"],
    ["Intended character", "Fresh floral, fruity and musky direction", "Yuzu, iced accord, pomegranate, peony, magnolia and lotus"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Versace endorsement", "Versace product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "bright-crystal" && <p className="my-6">Explore contrasting floral directions: <Link className="underline" href="/how-is-hume-no-5">No 5</Link> and <Link className="underline" href="/how-is-hume-good-girl">Good Girl</Link>.</p>}
  {guide.slug === "hume-angels-share-vs-kilian-angels-share" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Angels Share</th><th className="py-3">Kilian Angels’ Share</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Intended character", "Cognac, cinnamon, oak, tonka and sweet woods", "Cognac, oak, cinnamon, tonka, sandalwood, praline and vanilla"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Kilian endorsement", "Kilian product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "angels-share" && <p className="my-6">Explore other warm directions: <Link className="underline" href="/how-is-hume-althair">Althair</Link> and <Link className="underline" href="/how-is-hume-khamrah-qahwa">Khamrah Qahwa</Link>.</p>}
  {guide.slug === "hume-goddess-vs-burberry-goddess-edp" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Goddess</th><th className="py-3">Burberry Goddess Eau de Parfum</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Intended character", "Vanilla and aromatic lavender direction", "Trio of vanillas enriched with lavender"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Burberry endorsement", "Burberry product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "goddess" && <p className="my-6">Explore contrasting warm directions: <Link className="underline" href="/how-is-hume-althair">Althair</Link> and <Link className="underline" href="/how-is-hume-black-opium">Black Opium</Link>.</p>}
  {guide.slug === "hume-night-out-vs-afnan-9pm-night-out" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Night Out</th><th className="py-3">Afnan 9 PM Night Out</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Extrait de Parfum; numerical oil percentage not verified here"],
    ["Intended character", "Fruit, spice, amber and woody depth", "Fruit, cardamom, suede, toffee and woody base descriptors"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Afnan endorsement", "Afnan product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "night-out" && <p className="my-6">Explore contrasting evening styles: <Link className="underline" href="/how-is-hume-most-wanted">Most Wanted</Link> and <Link className="underline" href="/how-is-hume-le-male-elixir">Le Male Elixir</Link>.</p>}
  {guide.slug === "hume-most-wanted-vs-azzaro-the-most-wanted-parfum" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Most Wanted</th><th className="py-3">Azzaro The Most Wanted Parfum</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Parfum; numerical oil percentage not verified here"],
    ["Intended character", "Red ginger, woods and Bourbon vanilla direction", "Spicy character; consult the official Parfum reference"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Azzaro endorsement", "Azzaro product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "most-wanted" && <p className="my-6">Explore contrasting warm styles: <Link className="underline" href="/how-is-hume-althair">Althair</Link> and <Link className="underline" href="/how-is-hume-le-male-elixir">Le Male Elixir</Link>.</p>}
  {guide.slug === "hume-tobacco-vanille-vs-tom-ford-tobacco-vanille" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Tobacco Vanille</th><th className="py-3">Tom Ford Tobacco Vanille Eau de Parfum</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Intended character", "Tobacco, vanilla, spice and woody direction", "Tobacco, tonka, vanilla, cocoa, dry fruit and sweet wood sap"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Tom Ford endorsement", "Tom Ford product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "tobacco-vanille" && <p className="my-6">Explore contrasting warm styles: <Link className="underline" href="/how-is-hume-red-tobacco">Red Tobacco</Link> and <Link className="underline" href="/how-is-hume-noir-extreme">Noir Extreme</Link>.</p>}
  {guide.slug === "hume-noir-extreme-vs-tom-ford-noir-extreme-edp" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Noir Extreme</th><th className="py-3">Tom Ford Noir Extreme Eau de Parfum</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Intended character", "Warm spice, kulfi-style sweetness, amber and woods", "Neroli, saffron, kulfi, rose, sandalwood and vanilla"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Tom Ford endorsement", "Tom Ford product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "noir-extreme" && <p className="my-6">Explore warm directions: <Link className="underline" href="/how-is-hume-althair">Althair</Link> and <Link className="underline" href="/how-is-hume-most-wanted">Most Wanted</Link>.</p>}
  {guide.slug === "hume-althair-vs-parfums-de-marly-althair" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Althair</th><th className="py-3">Parfums de Marly Althaïr Eau de Parfum</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Intended character", "Vanilla, praline, orange blossom, spice and woods", "Vanilla, praline and orange blossom highlighted by Parfums de Marly"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Parfums de Marly endorsement", "Parfums de Marly product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "althair" && <p className="my-6">Explore other warm directions: <Link className="underline" href="/how-is-hume-strong-with-you">Strong With You</Link>, <Link className="underline" href="/how-is-hume-myrrh-tonka">Myrrh &amp; Tonka</Link> and <Link className="underline" href="/how-is-hume-khamrah-qahwa">Khamrah Qahwa</Link>.</p>}
  {guide.slug === "hume-eros-vs-versace-eros-edp" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Eros</th><th className="py-3">Versace Eros Eau de Parfum</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Intended character", "Citrus, mint, sweet apple and woody vanilla", "Lemon, mandarin, mint, candied apple and aromatic character"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Versace endorsement", "Versace product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "eros" && <p className="my-6">Explore contrasting directions: <Link className="underline" href="/how-is-hume-1-million">1 Million</Link> and <Link className="underline" href="/how-is-hume-y-edp">Y EDP</Link>.</p>}
  {guide.slug === "hume-1-million-vs-rabanne-1-million" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME 1 Million</th><th className="py-3">Rabanne 1 Million Eau de Toilette</th></tr></thead><tbody>{[
    ["Positioning", "Independent inspired fragrance", "Original designer fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Toilette; numerical oil percentage not verified here"],
    ["Intended character", "Citrus, warm spice and leathery amber", "Blood mandarin, woody cinnamon and leathery amber"],
    ["Price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised-retailer pricing for the chosen size"],
    ["Performance evidence", "No documented comparative wear test supplied", "Original-brand claims cannot establish HUME performance"],
    ["Affiliation", "HUME product; no Rabanne endorsement", "Rabanne product"],
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "1-million" && <p className="my-6">Explore other warm styles: <Link className="underline" href="/how-is-hume-strong-with-you">Strong With You</Link> and <Link className="underline" href="/how-is-hume-le-male-elixir">Le Male Elixir</Link>.</p>}
  {guide.slug === "hume-y-edp-vs-ysl-y-edp" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Y EDP</th><th className="py-3">YSL Y Eau de Parfum</th></tr></thead><tbody>{[
    ["Position", "Independent inspired alternative", "Original Yves Saint Laurent fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Eau de Parfum; numerical oil percentage not verified here"],
    ["Character", "HUME describes fresh aromatic character", "Sage, geranium and woods highlighted by YSL Beauty"],
    ["Edition", "Inspired by Y Eau de Parfum", "Other Y editions have distinct compositions"],
    ["Listed price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised price for your chosen size"],
    ["Similarity and performance", "No controlled side-by-side result published here", "No relative performance asserted"]
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "y-edp" && <p className="my-6">Explore contrasting fresh directions: <Link className="underline" href="/how-is-hume-sauvage">Sauvage</Link>, <Link className="underline" href="/how-is-hume-the-blue">The Blue</Link>, <Link className="underline" href="/how-is-hume-hawas">Hawas</Link> and <Link className="underline" href="/how-is-hume-imagine">Imagine</Link>.</p>}
  {guide.slug === "hume-viking-spirit-vs-creed-viking" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME Viking Spirit</th><th className="py-3">Creed Viking</th></tr></thead><tbody>{[
    ["Position", "Independent inspired alternative", "Original Creed fragrance"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Numerical oil percentage not verified here"],
    ["Character", "HUME describes citrus, spice and warm woods", "Original Viking’s fresh aromatic, peppery and woody direction"],
    ["Edition", "Inspired by original Viking", "Viking Cologne is a separate composition"],
    ["Listed price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised price for your chosen size"],
    ["Similarity and performance", "No controlled side-by-side result published here", "No relative performance asserted"]
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "viking-spirit" && <p className="my-6">Explore contrasting fresh and woody directions: <Link className="underline" href="/how-is-hume-aventus">Aventus</Link>, <Link className="underline" href="/how-is-hume-terre-de-hermes">Terre de Hermes</Link> and <Link className="underline" href="/how-is-hume-srk-special">SRK Special</Link>.</p>}
  {guide.slug === "hume-the-blue-vs-bleu-de-chanel" && <section className="my-10"><h2 className="text-2xl mb-4">How do the specifications compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME The Blue</th><th className="py-3">Chanel Bleu de Chanel</th></tr></thead><tbody>{[
    ["Position", "Independent inspired alternative", "Original Chanel fragrance range"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Depends on chosen edition; numerical oil percentage not verified here"],
    ["Edition", "Listing names Bleu de Chanel without an edition", "EDT, EDP and Parfum have distinct compositions"],
    ["Character", "HUME describes fresh citrus, aromatic mint and sensual woods", "Fresh aromatic and woody directions vary by edition"],
    ["Listed price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised price for the exact edition and size"],
    ["Similarity and performance", "No controlled side-by-side result published here", "No relative performance asserted"]
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "the-blue" && <p className="my-6">HUME’s listing does not specify a Bleu de Chanel edition. The linked Chanel Eau de Parfum profile provides context, not confirmation of an edition match. Explore other directions: <Link className="underline" href="/how-is-hume-sauvage">Sauvage</Link>, <Link className="underline" href="/how-is-hume-imagine">Imagine</Link> and <Link className="underline" href="/how-is-hume-srk-special">SRK Special</Link>.</p>}
  {guide.slug === "hume-srk-special-vs-tam-dao-dunhill-icon" && <section className="my-10"><h2 className="text-2xl mb-4">How do one bottle and layering compare?</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3 pr-4">Factor</th><th className="py-3 pr-4">HUME SRK Special</th><th className="py-3">Tam Dao + Dunhill Icon</th></tr></thead><tbody>{[
    ["Position", "Independent single-bottle interpretation", "Layering two original fragrances"],
    ["Concentration", "Approximately 40% fragrance oil, stated by HUME", "Two separate formulations; no combined percentage verified"],
    ["Character", "Intended creamy woods and fresh aromatic spice", "Balance depends on edition, application order and ratio"],
    ["Convenience", "One bottle to apply", "Two bottles with separately adjustable application"],
    ["Listed price and size", `₹${product.price.toLocaleString("en-IN")} / ${product.size}`, "Check current authorised prices for both chosen sizes"],
    ["Similarity and performance", "No controlled side-by-side result published here", "No universal layering ratio or relative performance established"],
    ["Celebrity connection", "No celebrity endorsement", "Exact variants not identified in SRK’s original statement"]
  ].map(([factor,hume,original])=><tr key={factor} className="border-b"><th className="py-3 pr-4 font-medium">{factor}</th><td className="py-3 pr-4">{hume}</td><td className="py-3">{original}</td></tr>)}</tbody></table></div></section>}
  {guide.cluster === "srk-special" && <section className="my-8"><h2 className="text-2xl mb-3">What is confirmed about SRK’s fragrance combination?</h2><p>Shah Rukh Khan named Dunhill and Diptyque in his original interview, without identifying the exact variants. Tam Dao + Icon is HUME’s chosen inspiration; it is not a confirmed personal formula or celebrity collaboration.</p><p className="mt-4">Sources: <a className="underline" href={SRK_INTERVIEW_REFERENCE}>GQ India’s original fragrance interview</a>, <a className="underline" href={cluster.reference}>Diptyque’s Tam Dao Eau de Parfum profile</a> and <a className="underline" href={ICON_REFERENCE}>Icon’s official woody-aromatic profile</a>.</p><p className="mt-4">Compare other directions: <Link className="underline" href="/how-is-hume-oud-wood">Oud Wood</Link>, <Link className="underline" href="/how-is-hume-aventus">Aventus</Link>, <Link className="underline" href="/how-is-hume-imagine">Imagine</Link>, <Link className="underline" href="/how-is-hume-sauvage">Sauvage</Link> and <Link className="underline" href="/how-is-hume-myrrh-tonka">Myrrh &amp; Tonka</Link>.</p></section>}
  <section className="my-8"><h2 className="text-2xl mb-3">{faqs[faqs.length - 1].question}</h2><p>{faqs[faqs.length - 1].answer}</p>{guide.cluster !== "srk-special" && <p className="mt-4">Inspiration reference: <a className="underline" href={cluster.reference}>{cluster.brand}’s official {cluster.inspiration} profile</a>.</p>}</section>
  <section className="my-10"><h2 className="text-2xl mb-4">Where can you explore {cluster.name}?</h2><div className="flex flex-wrap gap-5"><Link className="underline" href={getProductPath(product)}>View the perfume and current stock</Link><Link className="underline" href={DISCOVERY_SET_PATH}>Explore the Discovery Set and sample eligibility</Link></div></section>
  <section><h2 className="text-2xl mb-4">Which related guide should you read next?</h2><ul className="space-y-3">{cluster.guides.filter(item=>item.slug!==guide.slug).map(item=><li key={item.slug}><Link className="underline" href={`/${item.slug}`}>{item.title}</Link></li>)}</ul></section>
  </article><Footer /></main>;
}
