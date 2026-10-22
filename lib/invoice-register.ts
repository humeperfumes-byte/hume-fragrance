import { z } from "zod";
import { and, asc, desc, sql } from "drizzle-orm";
import { savedInvoices, invoiceCustomerLinks } from "@/db/schema";

export const registerQuerySchema = z.object({
  q: z.string().max(200).default(""), page: z.coerce.number().int().min(1).max(1000000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  state: z.enum(["all","draft","issued","cancelled"]).default("all"),
  status: z.enum(["All","Paid","Unpaid","Partially Paid"]).default("All"),
  unlinked:z.enum(["true"]).optional(),
  sort: z.enum(["updated","date","amount"]).default("updated"), customerId: z.string().uuid().optional(),
});
export function registerQuery(params: URLSearchParams) {
  const input = registerQuerySchema.parse(Object.fromEntries(params));
  const pattern = `%${input.q.trim().replace(/[\\%_]/g, value => `\\${value}`)}%`;
  const cancelled = sql`exists (select 1 from invoice_corrections c where c.invoice_id=${savedInvoices.id} and c.kind='cancel')`;
  const where = and(
    input.q.trim() ? sql`concat_ws(' ',${savedInvoices.title},${savedInvoices.document}->>'buyerName',${savedInvoices.document}->>'buyerEmail',${savedInvoices.document}->>'buyerPhone',${savedInvoices.document}->>'invoiceNumber',${savedInvoices.document}->>'invoiceDate',jsonb_path_query_array(${savedInvoices.document},'$.items[*].name')::text) ilike ${pattern}` : undefined,
    input.state === "cancelled" ? cancelled : input.state === "all" ? undefined : sql`coalesce(${savedInvoices.document}->>'lifecycle','draft')=${input.state} and not ${cancelled}`,
    input.status === "All" ? undefined : sql`${savedInvoices.document}->>'paymentStatus'=${input.status}`,
    input.unlinked ? sql`not exists(select 1 from ${invoiceCustomerLinks} where ${invoiceCustomerLinks.invoiceId}=${savedInvoices.id})` : undefined,
    input.customerId ? sql`exists(select 1 from ${invoiceCustomerLinks} where ${invoiceCustomerLinks.invoiceId}=${savedInvoices.id} and ${invoiceCustomerLinks.customerId}=${input.customerId})` : undefined,
  );
  // Same gross-value rules as calculateInvoice: per-line paise rounding, tax-exclusive additions, and an optional target total.
  const amount = sql<number>`case when coalesce(${savedInvoices.document}->>'targetGrandTotal','') <> '' then (${savedInvoices.document}->>'targetGrandTotal')::numeric else (
    select coalesce(sum(case when ${savedInvoices.document}->>'priceMode'='exclusive' and coalesce(${savedInvoices.document}->>'taxMode','auto')<>'none'
      then round((item->>'price')::numeric*(item->>'quantity')::numeric*100) + round(round((item->>'price')::numeric*(item->>'quantity')::numeric*100)*(item->>'gstPercent')::numeric/100)
      else round((item->>'price')::numeric*(item->>'quantity')::numeric*100) end),0)/100 from jsonb_array_elements(${savedInvoices.document}->'items') item
    ) + coalesce((${savedInvoices.document}->>'shippingFee')::numeric,0) + case when ${savedInvoices.document}->>'priceMode'='exclusive' and coalesce(${savedInvoices.document}->>'taxMode','auto')<>'none' then round(coalesce((${savedInvoices.document}->>'shippingFee')::numeric,0)*coalesce((${savedInvoices.document}->>'shippingGstPercent')::numeric,0))/100 else 0 end end`;
  const order = input.sort === "amount" ? desc(amount) : input.sort === "date" ? desc(sql`${savedInvoices.document}->>'invoiceDate'`) : desc(savedInvoices.updatedAt);
  return { input, where, order: [order, asc(savedInvoices.id)], offset: (input.page-1)*input.pageSize };
}
