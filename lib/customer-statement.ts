import { eq, asc } from "drizzle-orm";
import { savedInvoices, invoiceCustomerLinks, invoiceCorrections } from "@/db/schema";
import { invoiceBalance } from "./invoice-ledger";
import { correctionRecord, type InvoiceTransaction } from "./invoice-management-store";

export async function customerStatement(tx: InvoiceTransaction, customerId: string) {
  const invoices = await tx.select({invoice:savedInvoices}).from(savedInvoices).innerJoin(invoiceCustomerLinks,eq(invoiceCustomerLinks.invoiceId,savedInvoices.id)).where(eq(invoiceCustomerLinks.customerId,customerId)).orderBy(asc(savedInvoices.createdAt),asc(savedInvoices.id));
  const corrections = await tx.select({correction:invoiceCorrections}).from(invoiceCorrections).innerJoin(invoiceCustomerLinks,eq(invoiceCustomerLinks.invoiceId,invoiceCorrections.invoiceId)).where(eq(invoiceCustomerLinks.customerId,customerId)).orderBy(asc(invoiceCorrections.createdAt),asc(invoiceCorrections.id));
  const grouped = new Map<string,ReturnType<typeof correctionRecord>[]>();
  for (const {correction} of corrections) grouped.set(correction.invoiceId,[...(grouped.get(correction.invoiceId)||[]),correctionRecord(correction)]);
  const rows = invoices.map(({invoice})=>({id:invoice.id,number:invoice.document.invoiceNumber,date:invoice.document.invoiceDate,buyerName:invoice.document.buyerName,lifecycle:invoice.document.lifecycle||"draft",...invoiceBalance(invoice.document,grouped.get(invoice.id)||[])}));
  const issued = rows.filter(row=>row.lifecycle === "issued");
  const sum = (key:"totalMinor"|"creditMinor"|"receivedMinor"|"refundMinor")=>issued.reduce((value,row)=>value+row[key],0);
  const unknownPayments = issued.filter(row=>!row.paymentKnown).length;
  const totals = {invoicedMinor:sum("totalMinor"),creditedMinor:sum("creditMinor"),receivedMinor:sum("receivedMinor"),refundedMinor:sum("refundMinor"),unknownPayments,
    balanceMinor:unknownPayments ? null : issued.reduce((sum,row)=>sum+(row.balanceMinor||0)-(row.customerCreditMinor||0),0)};
  return {rows,totals,corrections:corrections.map(({correction})=>correctionRecord(correction))};
}
export function csvCell(value: string | number | null) {
  const text = value === null ? "Unknown" : String(value);
  // Spreadsheet applications must not execute customer names/references as formulas.
  return `"${(typeof value === "string" && /^[\s]*[=+@\-\t\r]/.test(text) ? "'" : "") + text.replace(/"/g,'""')}"`;
}
