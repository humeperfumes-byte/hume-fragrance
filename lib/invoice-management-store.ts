import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { invoiceCorrections } from "@/db/schema";
import type { Correction } from "./invoice-ledger";

export type InvoiceTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export function correctionRecord(row: typeof invoiceCorrections.$inferSelect): Correction {
  return {...row,...row.details,amountMinor:Number(row.amountMinor),createdAt:row.createdAt.toISOString()};
}
export async function correctionsFor(tx: InvoiceTransaction | typeof db, invoiceId: string) {
  return (await tx.select().from(invoiceCorrections).where(eq(invoiceCorrections.invoiceId, invoiceId)).orderBy(asc(invoiceCorrections.createdAt),asc(invoiceCorrections.id))).map(correctionRecord);
}
