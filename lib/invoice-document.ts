import { z } from "zod";

export const invoiceItemSchema = z.object({
  id: z.string().min(1).max(100), name: z.string().trim().min(1, "Add an item description").max(1000),
  category: z.enum(["perfume", "sample", "machine", "oil", "other"]).default("other"),
  unit: z.enum(["pcs", "set", "ml", "litre", "service"]).default("pcs"),
  quantity: z.number().positive().max(100000), price: z.number().min(0).max(10000000), gstPercent: z.number().min(0).max(100),
});
const text = z.string().max(4000);
export const invoiceDocumentSchema = z.object({
  sellerName: z.string().trim().min(1).max(255), sellerAddress: text, sellerEmail: text, sellerPhone: text, sellerGstin: text,
  buyerName: z.string().trim().min(1, "Add the buyer name").max(255), buyerAddress: text, buyerEmail: text, buyerPhone: text, buyerGstin: text,
  invoiceNumber: z.string().trim().min(1).max(100), invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  paymentStatus: z.enum(["Paid", "Unpaid", "Partially Paid"]), showPaymentStatus: z.boolean().default(true), items: z.array(invoiceItemSchema).min(1).max(100),
  targetGrandTotal: z.string().max(30).refine(value => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0), "Enter a valid target total"),
  shippingFee: z.number().min(0).max(1000000), bankDetails: text, terms: text, notes: text,
}).strict();
export type InvoiceDocument = z.infer<typeof invoiceDocumentSchema>;
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type SavedInvoice = { id: string; title: string; document: InvoiceDocument; createdAt: string; updatedAt: string };
export function newInvoiceIdentity() {
  const date = new Date();
  const invoiceDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  return { invoiceDate, invoiceNumber: `HF-${invoiceDate.slice(0, 4)}-${crypto.randomUUID().slice(0, 8).toUpperCase()}` };
}
export function duplicateInvoice(document: InvoiceDocument): InvoiceDocument {
  return { ...structuredClone(document), ...newInvoiceIdentity(), paymentStatus: "Unpaid", items: document.items.map(item => ({ ...item, id: crypto.randomUUID() })) };
}
