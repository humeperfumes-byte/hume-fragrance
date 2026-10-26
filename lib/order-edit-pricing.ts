type Item = { id: string; price: number; quantity: number; isGift?: boolean; kitSelections?: unknown[]; sampleSelections?: unknown[] };

export function preserveOrderItem<T extends Item>(item: T, originalItems: T[]): T | undefined {
  const original = originalItems.find(saved => saved.id === item.id && !saved.isGift && !saved.kitSelections?.length && !saved.sampleSelections?.length);
  return original ? { ...original, quantity: item.quantity } : undefined;
}

export function getStoredOrderDiscount(order: { subtotal: string | null; shippingFee: string | null; manualAdjustment: string | null; codFee?: string | null; grandTotal: string | null }): number {
  return Math.max(0, Number(order.subtotal || 0) + Number(order.shippingFee || 0) + Number(order.manualAdjustment || 0) + Number(order.codFee || 0) - Number(order.grandTotal || 0));
}
