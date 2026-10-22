import { z } from "zod";
import { invoiceDocumentSchema, invoiceItemSchema } from "./invoice-document";

// Incomplete names are expected in an unfinished draft.
export const recoverableInvoiceSchema = invoiceDocumentSchema.extend({
  buyerName: z.string().max(255),
  sellerName: z.string().max(255),
  items: z.array(invoiceItemSchema.extend({ name: z.string().max(1000) })).min(1).max(100),
});
