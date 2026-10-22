import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { savedInvoices, issuedInvoices, invoiceCorrections, invoiceCorrectionCounters, invoiceRevisions, invoiceCustomerLinks } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";
import { readBoundedJson } from "@/lib/bounded-request-body";
import { correctionSchema, buildCorrection, invoiceBalance } from "@/lib/invoice-ledger";
import { correctionsFor, correctionRecord } from "@/lib/invoice-management-store";
import { financialYear } from "@/lib/invoice-calculations";
import { invoiceSnapshotFingerprint } from "@/lib/invoice-document";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request); if (unauthorized) return unauthorized;
  const id = z.string().uuid().safeParse(request.nextUrl.searchParams.get("invoiceId"));
  if (!id.success) return NextResponse.json({error:"Invalid invoice ID"},{status:400});
  try {
    return await db.transaction(async tx => {
      const [invoice] = await tx.select().from(savedInvoices).where(eq(savedInvoices.id,id.data));
      if (!invoice) return NextResponse.json({error:"Invoice not found"},{status:404});
      const corrections = await correctionsFor(tx,id.data);
      const [link] = await tx.select().from(invoiceCustomerLinks).where(eq(invoiceCustomerLinks.invoiceId,id.data));
      const balance=invoiceBalance(invoice.document,corrections);
      return NextResponse.json({invoice:{...invoice,ledger:balance,customerId:link?.customerId||null},customerId:link?.customerId||null,corrections,balance},{headers:{"Cache-Control":"private, no-store"}});
    },{isolationLevel:"repeatable read",accessMode:"read only"});
  } catch { return NextResponse.json({error:"Could not load corrections"},{status:503}); }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request); if (unauthorized) return unauthorized;
  try {
    const input = correctionSchema.parse(await readBoundedJson(request,64000));
    const fingerprint = invoiceSnapshotFingerprint({...input,expectedUpdatedAt:undefined});
    const result = await db.transaction(async tx => {
      // All invoice writes share this lock, including receipts, links and corrections.
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${input.invoiceId}))`);
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`correction-${input.id}`}))`);
      const [retry] = await tx.select().from(invoiceCorrections).where(eq(invoiceCorrections.id,input.id));
      if (retry) {
        if (retry.requestFingerprint !== fingerprint) throw new Error("This operation ID was already used for different details");
        return correctionRecord(retry);
      }
      const [invoice] = await tx.select().from(savedInvoices).where(eq(savedInvoices.id,input.invoiceId));
      const [issued] = await tx.select().from(issuedInvoices).where(eq(issuedInvoices.invoiceId,input.invoiceId));
      if (!invoice || !issued) throw new Error("Only issued invoices can receive corrections");
      if (invoice.updatedAt.toISOString() !== input.expectedUpdatedAt) throw new Error("Invoice changed elsewhere. Reload its records before continuing.");
      const today = new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
      if (input.date > today) throw new Error("Correction date cannot be in the future");
      const existing = await correctionsFor(tx,input.invoiceId);
      const values = buildCorrection({...issued.document,amountReceived:invoice.document.amountReceived,showPaymentAmounts:invoice.document.showPaymentAmounts,paymentStatus:invoice.document.paymentStatus},existing,input);
      const year = financialYear(input.date);
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`correction-year-${year}`}))`);
      const [counter] = await tx.insert(invoiceCorrectionCounters).values({financialYear:year,lastNumber:1}).onConflictDoUpdate({target:invoiceCorrectionCounters.financialYear,set:{lastNumber:sql`${invoiceCorrectionCounters.lastNumber}+1`}}).returning();
      if (counter.lastNumber > 999999) throw new Error("Correction sequence exhausted");
      const number = `${input.kind === "refund" ? "RF" : "CN"}/${year.slice(2,4)}${year.slice(-2)}/${String(counter.lastNumber).padStart(6,"0")}`;
      const [saved] = await tx.insert(invoiceCorrections).values({id:input.id,invoiceId:input.invoiceId,kind:input.kind,number,date:input.date,reason:input.reason,reference:input.reference,amountMinor:String(values.amountMinor),details:{lines:values.lines,includeShipping:values.includeShipping,source:issued.document},requestFingerprint:fingerprint}).returning();
      await tx.update(savedInvoices).set({updatedAt:new Date(Math.max(Date.now(),invoice.updatedAt.getTime()+1))}).where(eq(savedInvoices.id,invoice.id));
      await tx.insert(invoiceRevisions).values({id:crypto.randomUUID(),invoiceId:invoice.id,action:input.kind === "cancel" ? "cancelled" : input.kind === "refund" ? "refund_recorded" : "credit_issued",title:number,document:invoice.document});
      return correctionRecord(saved);
    });
    return NextResponse.json({correction:result});
  } catch (error) {
    return NextResponse.json({error:error instanceof z.ZodError ? error.issues.map(row=>row.message).join("; ") : error instanceof Error ? error.message : "Correction could not be recorded"},{status:error instanceof z.ZodError ? 400 : 409});
  }
}
