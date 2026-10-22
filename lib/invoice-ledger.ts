import { z } from "zod";
import { calculateInvoice } from "./invoice-calculations";
import type { InvoiceDocument } from "./invoice-document";

export const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, "Enter a valid calendar date");
export const customerSchema = z.object({
  name: z.string().trim().min(1).max(255), address: z.string().max(4000),
  email: z.string().trim().max(320).refine(value=>!value||z.string().email().safeParse(value).success,"Enter a valid email").transform(value => value.toLowerCase()),
  phone: z.string().trim().max(50), gstin: z.string().trim().toUpperCase().regex(/^$|^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/),
}).strict();
export type InvoiceCustomer = z.infer<typeof customerSchema> & { id: string; createdAt: string; updatedAt: string };
export const correctionSchema = z.object({
  id: z.string().uuid(), invoiceId: z.string().uuid(), expectedUpdatedAt: z.string().datetime(),
  kind: z.enum(["credit", "refund", "cancel"]), date: calendarDate,
  reason: z.string().trim().min(3).max(2000), reference: z.string().trim().max(255).default(""),
  lines: z.array(z.object({ itemId: z.string().min(1).max(100), quantity: z.number().positive().max(100000) }).strict()).max(100).default([]),
  includeShipping: z.boolean().default(false), amount: z.number().positive().max(100000000).optional(),
}).strict();
export type CreditLine = { itemId: string; description: string; quantity: number; grossMinor: number; taxableMinor: number; cgstMinor: number; sgstMinor: number; igstMinor: number };
export type Correction = {
  id: string; invoiceId: string; kind: "credit" | "refund" | "cancel"; number: string;
  date: string; reason: string; reference: string; amountMinor: number; lines: CreditLine[];
  includeShipping: boolean; createdAt: string; source: InvoiceDocument;
};
export const toMinor = (value: number) => {
  const result = Math.round(value * 100);
  if (!Number.isSafeInteger(result)) throw new Error("Amount exceeds the supported accounting range");
  return result;
};
export function invoiceBalance(document: InvoiceDocument, corrections: Correction[]) {
  const totalMinor = toMinor(calculateInvoice(document).grandTotal);
  const creditMinor = corrections.filter(row => row.kind !== "refund").reduce((sum, row) => sum + row.amountMinor, 0);
  const refundMinor = corrections.filter(row => row.kind === "refund").reduce((sum, row) => sum + row.amountMinor, 0);
  const receivedMinor = toMinor(document.amountReceived || 0);
  // Older manually labelled Paid/Partially Paid documents do not prove a receipt amount.
  const paymentKnown = document.showPaymentAmounts === true || receivedMinor > 0 || document.paymentStatus === "Unpaid";
  const netMinor = totalMinor - creditMinor - receivedMinor + refundMinor;
  return { totalMinor, creditMinor, refundMinor, receivedMinor, paymentKnown,
    balanceMinor: paymentKnown ? Math.max(0, netMinor) : null,
    customerCreditMinor: paymentKnown ? Math.max(0, -netMinor) : null,
    cancelled: corrections.some(row => row.kind === "cancel") };
}

export function buildCorrection(document: InvoiceDocument, existing: Correction[], input: z.infer<typeof correctionSchema>) {
  const balance = invoiceBalance(document, existing);
  if (balance.cancelled) throw new Error("This invoice is cancelled and cannot receive further corrections");
  if (input.date < document.invoiceDate) throw new Error("Correction date cannot precede the invoice date");
  if (existing.some(row => row.date > input.date)) throw new Error("Correction date cannot precede an existing correction");
  if (input.kind === "refund") {
    if (input.lines.length || input.includeShipping) throw new Error("Refunds cannot include credit lines");
    if (!input.reference) throw new Error("Enter the refund payment method and reference");
    if (!balance.paymentKnown) throw new Error("Record the actual amount received before recording a refund");
    const amountMinor = toMinor(input.amount || 0);
    if (amountMinor <= 0 || amountMinor > (balance.customerCreditMinor || 0) || amountMinor > balance.receivedMinor - balance.refundMinor) throw new Error("Refund exceeds the customer credit available from recorded payments");
    return { amountMinor, lines: [] as CreditLine[], includeShipping: false };
  }
  if (input.amount !== undefined) throw new Error("Credit values are calculated from original invoice quantities");
  if (input.kind === "cancel" && (existing.length || balance.receivedMinor || !balance.paymentKnown)) throw new Error("Cancellation requires an unpaid invoice without corrections. For paid invoices, issue a credit note and record the refund instead.");
  const totals = calculateInvoice(document);
  const requests = input.kind === "cancel" ? document.items.map(item => ({ itemId: item.id, quantity: item.quantity })) : input.lines;
  if (new Set(requests.map(row => row.itemId)).size !== requests.length) throw new Error("Each item may appear only once in a credit note");
  const lines: CreditLine[] = [];
  for (const request of requests) {
    const original = totals.lines.find(row => row.id === request.itemId);
    if (!original) throw new Error("Credit item does not exist on the original invoice");
    const previous = existing.flatMap(row => row.lines).filter(row => row.itemId === request.itemId).reduce((sum, row) => sum + row.quantity, 0);
    const next = previous + request.quantity;
    if (next - original.quantity > 0.00000001) throw new Error(`Credit quantity exceeds the remaining quantity for ${original.name}`);
    // Round cumulative gross first, then tax within that gross. Partial returns
    // cannot create negative taxable values, and the last return clears every paise.
    const cumulative = (quantity:number) => {
      const fullGross=toMinor(original.gross), fullTax=toMinor(original.tax);
      const gross= Math.round(fullGross*Math.min(quantity,original.quantity)/original.quantity);
      const tax=fullGross?Math.round(fullTax*gross/fullGross):0;
      const cgst=fullTax?Math.floor(toMinor(original.cgst)*tax/fullTax):0;
      const igst=original.igst?tax:0;
      return {gross,cgst,sgst:totals.taxKind==='split'?tax-cgst:0,igst};
    };
    const before=cumulative(previous), after=cumulative(next);
    const grossMinor=after.gross-before.gross, cgstMinor=after.cgst-before.cgst, sgstMinor=after.sgst-before.sgst, igstMinor=after.igst-before.igst;
    lines.push({ itemId: original.id, description: original.name, quantity: request.quantity, grossMinor, taxableMinor: grossMinor - cgstMinor - sgstMinor - igstMinor, cgstMinor, sgstMinor, igstMinor });
  }
  const includeShipping = (input.kind === "cancel" || input.includeShipping) && document.shippingFee > 0;
  if (includeShipping) {
    if (existing.some(row => row.includeShipping)) throw new Error("Shipping has already been credited");
    const tax = toMinor(totals.shippingTax), cgstMinor = totals.taxKind === "split" ? Math.floor(tax / 2) : 0;
    lines.push({ itemId: "__shipping__", description: "Shipping", quantity: 1, grossMinor: toMinor(totals.shippingGross), taxableMinor: toMinor(totals.shippingTaxable), cgstMinor, sgstMinor: totals.taxKind === "split" ? tax - cgstMinor : 0, igstMinor: totals.taxKind === "igst" ? tax : 0 });
  }
  const amountMinor = lines.reduce((sum, row) => sum + row.grossMinor, 0);
  if (!lines.length) throw new Error("Choose at least one item or the shipping charge to credit");
  if (amountMinor > balance.totalMinor - balance.creditMinor) throw new Error("Credit exceeds the remaining invoice value");
  return { amountMinor, lines, includeShipping };
}
