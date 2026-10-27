import { notFound, permanentRedirect } from "next/navigation";
import { DISCOVERY_SET_PATH } from "@/lib/discovery-set";
import { getDiscoverySetSeoPageBySlug, getDiscoverySetSeoSlugs } from "@/lib/discovery-set-seo";

export function generateStaticParams() {
  return getDiscoverySetSeoSlugs().map(slug=>({slug}));
}

// These keyword aliases offer the same kit. Preserve incoming links while
// consolidating their product, review and canonical signals on the main page.
export default async function DiscoverySetAlias({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  if(!getDiscoverySetSeoPageBySlug(slug))notFound();
  permanentRedirect(DISCOVERY_SET_PATH);
}
