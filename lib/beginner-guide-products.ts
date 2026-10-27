import type { PerfumeData } from "@/data/perfumes";
import type { BeginnerGuide } from "@/lib/beginner-perfume-guides";
import { isDiscoverySetProductId } from "@/lib/discovery-set";

/** Editorial examples are shown only when their public full-bottle listing is available. */
export function getBeginnerGuideProducts(guide: BeginnerGuide, products: PerfumeData[]) {
  return guide.productIds.flatMap(id => {
    const product = products.find(product => product.id === id);
    if (!product || (product.visibility ?? "public") !== "public" || product.badges?.soldOut || product.badges?.comingSoon || isDiscoverySetProductId(product.id)) return [];
    if (guide.requiredNote) {
      const noteWords = [...product.notes.top, ...product.notes.heart, ...product.notes.base].flatMap(note => note.toLowerCase().split(/[^a-z]+/));
      if (!noteWords.includes(guide.requiredNote.toLowerCase())) return [];
    }
    return [product];
  });
}
