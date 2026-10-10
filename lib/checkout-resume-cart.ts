import type { CartItem } from "@/context/CartContext";
import { DISCOVERY_SET_PRODUCT_ID, DISCOVERY_SET_PRICE, DISCOVERY_SET_IMAGES, DISCOVERY_SET_SAMPLE_COUNT, DISCOVERY_SET_SIZE, isDiscoverySetCartItemId } from "./discovery-set";
type Snapshot = { id: string; quantity: number; price: number; isGift?: boolean; sampleSelections?: { id: string }[]; kitSelections?: { id: string }[] };
export type ResumeProduct = { id: string; name: string; inspiration: string; price: number; category: string; images: string[]; size: string; badges?: { soldOut?: boolean; comingSoon?: boolean; showInDiscoverySet?: boolean }; priceCurrency?: string };
export function buildResumeCart(snapshot: Snapshot[], catalogue: ResumeProduct[]) {
  const products = new Map(catalogue.map(product => [product.id, product]));
  const items: CartItem[] = [];
  const issues: string[] = [];
  let pricesChanged = false;
  for (const saved of snapshot.filter(item => !item.isGift)) {
    if (!Number.isInteger(saved.quantity) || saved.quantity < 1 || saved.quantity > 20) { issues.push("A saved quantity needs correcting."); continue; }
    if (saved.kitSelections?.length) { issues.push("Please rebuild your custom kit to confirm its current selections and price."); continue; }
    const discovery = isDiscoverySetCartItemId(saved.id);
    const product = products.get(discovery ? DISCOVERY_SET_PRODUCT_ID : saved.id);
    if (!product || product.badges?.soldOut || product.badges?.comingSoon || (product.priceCurrency && product.priceCurrency !== "INR") || !Number.isFinite(product.price) || product.price < 100) { issues.push("A saved product is unavailable. Please update your selection before checkout."); continue; }
    let sampleSelections: CartItem["sampleSelections"];
    if (discovery) {
      const choices = saved.sampleSelections || [];
      const samples = choices.map(choice => products.get(choice.id));
      if (choices.length !== DISCOVERY_SET_SAMPLE_COUNT || new Set(choices.map(choice => choice.id)).size !== DISCOVERY_SET_SAMPLE_COUNT || samples.some(sample => !sample || sample.id === DISCOVERY_SET_PRODUCT_ID || sample.badges?.soldOut || sample.badges?.comingSoon || !sample.badges?.showInDiscoverySet)) { issues.push("Your discovery set needs updated sample selections. Please rebuild it before checkout."); continue; }
      sampleSelections = samples.map(sample => ({ id: sample!.id, name: sample!.name, inspiration: sample!.inspiration }));
    }
    const price = discovery ? DISCOVERY_SET_PRICE : product.price;
    if (price !== saved.price) pricesChanged = true;
    items.push({ id: saved.id, name: product.name, inspiration: product.inspiration, category: product.category, image: discovery ? DISCOVERY_SET_IMAGES[0] : product.images[0] || "/images/logo.png", price, size: discovery ? DISCOVERY_SET_SIZE : product.size, quantity: saved.quantity, ...(sampleSelections ? { sampleSelections } : {}) });
  }
  if (items.length === 0 && issues.length === 0) issues.push("This saved checkout has no products to restore.");
  return { items, issues, pricesChanged };
}
