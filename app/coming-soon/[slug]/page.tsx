import { permanentRedirect } from "next/navigation";
import {
  DETAIL_UPCOMING_PRODUCTS,
  getUpcomingProductBySlug,
} from "@/lib/upcoming-products";

export const revalidate = 300;

export function generateStaticParams() {
  return DETAIL_UPCOMING_PRODUCTS.map((product) => ({ slug: product.slug }));
}

export default async function LegacyComingSoonProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getUpcomingProductBySlug(slug);

  permanentRedirect(product?.path ?? "/shop");
}
