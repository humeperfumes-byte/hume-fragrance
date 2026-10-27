import { z } from "zod";

export const invoiceItemSchema = z.object({
  id: z.string().min(1).max(100), name: z.string().trim().min(1, "Add an item description").max(1000),
  category: z.enum(["perfume", "sample", "machine", "oil", "other"]).default("other"),
  unit: z.enum(["pcs", "set", "ml", "litre", "service"]).default("pcs"),
  hsnSac: z.string().regex(/^$|^\d{4,8}$/, "Use a 4–8 digit HSN/SAC").optional(),
  quantity: z.number().positive().max(100000), price: z.number().min(0).max(10000000), gstPercent: z.number().min(0).max(100),
});
const text = z.string().max(4000);
export const invoiceDocumentSchema = z.object({
  sellerName: z.string().trim().min(1).max(255), sellerAddress: text, sellerEmail: text, sellerPhone: text, sellerGstin: text.transform(value=>value.trim().toUpperCase()),
  customerId: z.string().uuid().optional(),
  buyerName: z.string().trim().min(1, "Add the buyer name").max(255), buyerAddress: text, buyerEmail: text, buyerPhone: text, buyerGstin: text.transform(value=>value.trim().toUpperCase()),
  buyerAlternativePhone: z.string().trim().max(50).optional(),
  separateShipping: z.boolean().optional(), shippingName: z.string().max(255).optional(), shippingAddress: text.optional(), shippingPhone: text.optional(),
  invoiceNumber: z.string().trim().min(1).max(100), invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value=>{const date=new Date(value+"T00:00:00Z");return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;}, "Enter a valid calendar date"),
  paymentStatus: z.enum(["Paid", "Unpaid", "Partially Paid"]), showPaymentStatus: z.boolean().default(false), items: z.array(invoiceItemSchema).min(1).max(100),
  targetGrandTotal: z.string().max(30).refine(value => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0), "Enter a valid target total"),
  lifecycle: z.enum(["draft", "issued"]).optional(), issuedAt: z.string().datetime().optional(),
  priceMode: z.enum(["inclusive", "exclusive"]).optional(), taxMode: z.enum(["auto", "intra", "inter", "none"]).optional(),
  sellerStateCode: z.string().regex(/^$|^\d{2}$/).optional(), placeOfSupplyCode: z.string().regex(/^$|^\d{2}$/).optional(), placeOfSupply: z.string().max(100).optional(),
  shippingGstPercent: z.number().min(0).max(100).nullable().optional(), amountReceived: z.number().min(0).max(100000000).optional(), showPaymentAmounts: z.boolean().optional(),
  shippingFee: z.number().min(0).max(1000000), bankDetails: text, terms: text, notes: text,
}).strict();
export type InvoiceDocument = z.infer<typeof invoiceDocumentSchema>;
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type SavedInvoice = { id: string; title: string; document: InvoiceDocument; createdAt: string; updatedAt: string; customerId?: string | null; ledger?: ReturnType<typeof import("./invoice-ledger").invoiceBalance> };
export function newInvoiceIdentity() {
  const date = new Date();
  const invoiceDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  return { invoiceDate, invoiceNumber: `DRAFT-${crypto.randomUUID().slice(0, 8).toUpperCase()}` };
}
export function duplicateInvoice(document: InvoiceDocument): InvoiceDocument {
  return { ...structuredClone(document), ...newInvoiceIdentity(), paymentStatus: "Unpaid", lifecycle: "draft", issuedAt: undefined, amountReceived: 0, items: document.items.map(item => ({ ...item, id: crypto.randomUUID() })) };
}
export type InvoiceOptions = {buyerAlternativePhone?:string;separateShipping:boolean;shippingName:string;shippingAddress:string;shippingPhone:string;customerId?:string;lifecycle: "draft"|"issued";priceMode:"inclusive"|"exclusive";taxMode:"auto"|"intra"|"inter"|"none";sellerStateCode:string;placeOfSupplyCode:string;placeOfSupply:string;shippingGstPercent:number|null;amountReceived:number;showPaymentAmounts:boolean;issuedAt?:string};
export const invoiceOptionDefaults:InvoiceOptions = { separateShipping:false, shippingName:'', shippingAddress:'', shippingPhone:'', lifecycle: 'draft' as const, priceMode: 'inclusive' as const, taxMode: 'auto' as const, sellerStateCode: '09', placeOfSupplyCode: '', placeOfSupply: '', shippingGstPercent: null as number | null, amountReceived: 0, showPaymentAmounts: false };
export function invoiceOptions(document: InvoiceDocument) { return {buyerAlternativePhone:document.buyerAlternativePhone,customerId:document.customerId,...Object.fromEntries(Object.entries(invoiceOptionDefaults).map(([key,value])=>[key,document[key as keyof InvoiceDocument]??value]))} as InvoiceOptions; }
export function invoiceSnapshotFingerprint(value: unknown) {
  const stable = (value: unknown): unknown => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).filter(([,entry])=>entry!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([key,entry])=>[key,stable(entry)])) : value;
  return JSON.stringify(stable(value));
}
export function invoiceFinancialFingerprint(document: InvoiceDocument) {
  const payments = new Set(['amountReceived','showPaymentAmounts','paymentStatus','showPaymentStatus']);
  return invoiceSnapshotFingerprint(Object.fromEntries(Object.entries(document).filter(([key])=>!payments.has(key))));
}
