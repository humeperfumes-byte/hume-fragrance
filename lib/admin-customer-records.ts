import type { Order, Product } from '@/db/schema';
import { normalizeIndianMobile } from './phone';
import { DISCOVERY_SET_PRICE, DISCOVERY_SET_PRODUCT_ID, DISCOVERY_SET_SAMPLE_COUNT, isDiscoverySetCartItemId, isEligibleDiscoverySample } from './discovery-set';

export type CustomerContact = Pick<Order, 'fullName' | 'phone' | 'email' | 'addressLine1' | 'addressLine2' | 'city' | 'state' | 'pincode'>;
export type RepeatOrderSource = CustomerContact & Pick<Order, 'cartSnapshot'>;
export type CustomerSearchRow = RepeatOrderSource & {
  id: string; source: 'order' | 'checkout'; orderNumber: string | null; trackingNumber: string | null;
  status: string; grandTotal: string | null; createdAt: Date | string; updatedAt: Date | string;
};
export function latestCustomerContact(rows: CustomerSearchRow[]): CustomerContact | null {
  const sorted = [...rows].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  if (!sorted.length) return null;
  // Keep an address together; never combine a new street with an older city/pincode.
  const address = sorted.find(row => row.addressLine1?.trim()) || sorted[0];
  return {
    fullName: sorted.find(row => row.fullName?.trim())?.fullName || null,
    phone: sorted.find(row => row.phone?.trim())?.phone || null,
    email: sorted.find(row => row.email?.trim())?.email || null,
    addressLine1: address.addressLine1, addressLine2: address.addressLine2,
    city: address.city, state: address.state, pincode: address.pincode,
  };
}
export function eligibleCustomerPhone(value: string | null | undefined): string | null {
  const phone = normalizeIndianMobile(value || '');
  return /^[6-9]\d{9}$/.test(phone) ? phone : null;
}
export function customerIdentity(row: Pick<CustomerContact, 'phone' | 'email'>): string | null {
  const phone = eligibleCustomerPhone(row.phone);
  if (phone) return `phone:${phone}`;
  const email = row.email?.trim().toLowerCase();
  return email ? `email:${email}` : null;
}
export function csvCell(value: unknown): string {
  let text = String(value ?? '');
  // Spreadsheet apps execute formulas even inside quoted CSV fields.
  if (/^[\s\uFEFF]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function recordsCsv(headers: string[], rows: unknown[][]): string {
  return '\uFEFF' + [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
}
export function buildRepeatOrder(source: RepeatOrderSource, products: Product[]) {
  const items: { id: string; quantity: number; sampleSelections?: string[] }[] = [];
  const notices: string[] = [];
  for (const old of source.cartSnapshot || []) {
    if (old.isGift) { notices.push(`${old.name}: complimentary gift not copied.`); continue; }
    const discovery = isDiscoverySetCartItemId(old.id);
    const id = discovery ? DISCOVERY_SET_PRODUCT_ID : old.id;
    const product = products.find(p => p.id === id && p.priceCurrency === 'INR');
    if (!product || product.badges?.soldOut || product.badges?.comingSoon) {
      notices.push(`${old.name}: unavailable; choose a replacement.`); continue;
    }
    const samples = discovery ? (old.sampleSelections || []).map(sample => sample.id) : undefined;
    if (discovery && (samples?.length !== DISCOVERY_SET_SAMPLE_COUNT || new Set(samples).size !== DISCOVERY_SET_SAMPLE_COUNT || samples.some(sampleId => !products.some(p => p.id === sampleId && isEligibleDiscoverySample(p))))) {
      notices.push(`${old.name}: sample selection needs rebuilding.`); continue;
    }
    const price = discovery ? DISCOVERY_SET_PRICE : Number(product.price);
    if (!Number.isFinite(price) || price <= 0) { notices.push(`${old.name}: price unavailable.`); continue; }
    if (price !== Number(old.price)) notices.push(`${old.name}: price changed from ₹${old.price} to ₹${price}.`);
    if (product.name !== old.name) notices.push(`${old.name} is now ${product.name}.`);
    const existing = items.find(item => item.id === id);
    if (existing && discovery) { notices.push('Additional discovery set needs its own sample review; only the first selection was copied.'); continue; }
    const requested = (existing?.quantity || 0) + old.quantity;
    const quantity = Math.max(1, Math.min(20, Math.floor(requested)));
    if (quantity !== requested) notices.push(`${product.name}: quantity limited to ${quantity}.`);
    if (existing) existing.quantity = quantity;
    else if (items.length < 20) items.push({ id, quantity, ...(samples ? { sampleSelections: samples } : {}) });
    else notices.push(`${product.name}: order limit reached; add separately.`);
  }
  return { items, notices };
}
