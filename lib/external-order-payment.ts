import { z } from 'zod';

export const externalReceiptSchema = z.object({
  amountMinor: z.number().int().positive().max(100000000),
  method: z.enum(['upi_qr', 'bank_transfer', 'cash']),
  reference: z.string().trim().min(3, 'Add a payment reference or receipt note').max(200),
  recordedAt: z.string().datetime(),
});
export type ExternalReceipt = z.infer<typeof externalReceiptSchema>;
type PaymentOrder = { grandTotal: string | number | null; capturedPaymentAmount?: string | null; externalPaymentReceipt?: unknown; status: string };
export function readExternalReceipt(value: unknown): ExternalReceipt | null {
  const parsed=externalReceiptSchema.safeParse(value);
  return parsed.success?parsed.data:null;
}
export function orderPaymentBalance(order: PaymentOrder) {
  const totalMinor = Math.round(Number(order.grandTotal || 0) * 100);
  const capturedMinor = Math.max(0, Math.round(Number(order.capturedPaymentAmount || 0) * 100));
  const receipt = readExternalReceipt(order.externalPaymentReceipt);
  const receivedMinor = capturedMinor + (receipt?.amountMinor || 0);
  return { totalMinor, capturedMinor, receivedMinor, receipt, remainingMinor: Math.max(0, totalMinor - receivedMinor), overpaidMinor: Math.max(0, receivedMinor - totalMinor) };
}
export function isExternallySettled(order: PaymentOrder) {
  const balance = orderPaymentBalance(order);
  return !!balance.receipt && balance.totalMinor > 0 && balance.remainingMinor === 0 && !/refund|disput|cancel/i.test(order.status);
}
export function externalPaymentPatch(order: PaymentOrder, input: {amountMinor:number;method:ExternalReceipt['method'];reference:string}, now = new Date()) {
  if (/refund|disput|cancel/i.test(order.status)) throw new Error('Resolve the cancellation, refund or dispute before recording a payment.');
  const balance = orderPaymentBalance(order);
  if (balance.receipt) throw new Error('An external payment is already recorded. Reopen the order to review its receipt.');
  const receipt = externalReceiptSchema.parse({...input, recordedAt:now.toISOString()});
  if (!balance.totalMinor || receipt.amountMinor !== balance.remainingMinor) throw new Error(`Record exactly the remaining balance of ₹${(balance.remainingMinor / 100).toFixed(2)}. Refresh if the Razorpay payment changed.`);
  return {
    externalPaymentReceipt: receipt,
    paymentMethod: `Fully paid — ${receipt.method === 'upi_qr' ? 'UPI / QR' : receipt.method === 'cash' ? 'Cash' : 'Bank transfer'} (admin recorded)`,
    paymentSyncStatus: 'external_paid',
    status: ['packed','shipped','delivered','complete'].includes(order.status) ? order.status : 'processing',
    updatedAt: now,
  };
}
