import { notFound, permanentRedirect } from "next/navigation";
import { getPerfumeGuide } from "@/lib/perfume-guides";
export default async function LegacyGuidePage({ params }: { params: Promise<{ slug: string }> }) {
 const guide = getPerfumeGuide((await params).slug);
 if (!guide) notFound();
 permanentRedirect(`/${guide.slug}`);
}
