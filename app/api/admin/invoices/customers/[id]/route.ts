import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { invoiceCustomers, savedInvoices, invoiceCustomerLinks, invoiceRevisions } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";
import { readBoundedJson } from "@/lib/bounded-request-body";
import { customerStatement, csvCell } from "@/lib/customer-statement";

type Context = {params:Promise<{id:string}>};
export async function GET(request: NextRequest, context: Context) {
  const unauthorized = requireAdminToken(request); if (unauthorized) return unauthorized;
  try {
    const id = z.string().uuid().parse((await context.params).id);
    const page = z.coerce.number().int().min(1).max(1000000).parse(request.nextUrl.searchParams.get("page")||1);
    const result = await db.transaction(async tx=>{
      const [customer] = await tx.select().from(invoiceCustomers).where(eq(invoiceCustomers.id,id));
      if (!customer) return null;
      return {customer,...await customerStatement(tx,id)};
    },{isolationLevel:"repeatable read",accessMode:"read only"});
    if (!result) return NextResponse.json({error:"Customer not found"},{status:404});
    if (request.nextUrl.searchParams.get("format") === "csv") {
      const lines: (string|number|null)[][] = [ ["Customer statement",result.customer.name], ["All dates; INR; payments are manually recorded"], ["Invoice","Date","State","Original total","Credits","Received","Refunded","Balance due","Customer credit"] ];
      for (const row of result.rows) lines.push([row.number,row.date,row.cancelled?"Cancelled":row.lifecycle,row.totalMinor/100,row.creditMinor/100,row.paymentKnown?row.receivedMinor/100:null,row.refundMinor/100,row.lifecycle==="draft"?"Draft - excluded":row.balanceMinor===null?null:row.balanceMinor/100,row.lifecycle==="draft"?"Draft - excluded":row.customerCreditMinor===null?null:row.customerCreditMinor/100]);
      lines.push([], ["Net customer balance (drafts excluded)",result.totals.balanceMinor===null?null:result.totals.balanceMinor/100],[],["Correction","Invoice ID","Date","Kind","Amount","Reason","Payment reference"]);
      for (const row of result.corrections) lines.push([row.number,row.invoiceId,row.date,row.kind,row.amountMinor/100,row.reason,row.reference]);
      return new NextResponse("\uFEFF"+lines.map(row=>row.map(csvCell).join(",")).join("\r\n"),{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":`attachment; filename="customer-statement-${id}.csv"`,"Cache-Control":"private, no-store"}});
    }
    return NextResponse.json({...result,rows:result.rows.slice((page-1)*25,page*25),total:result.rows.length,page,pageSize:25,corrections:undefined},{headers:{"Cache-Control":"private, no-store"}});
  } catch(error) {return NextResponse.json({error:error instanceof z.ZodError?"Invalid statement request":"Could not load customer statement"},{status:error instanceof z.ZodError?400:503});}
}
const linkSchema = z.object({invoiceId:z.string().uuid(),expectedUpdatedAt:z.string().datetime()}).strict();
export async function POST(request: NextRequest, context: Context) {
  const unauthorized = requireAdminToken(request); if (unauthorized) return unauthorized;
  try {
    const customerId = z.string().uuid().parse((await context.params).id);
    const input = linkSchema.parse(await readBoundedJson(request,2000));
    const invoice = await db.transaction(async tx=>{
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${input.invoiceId}))`);
      const [customer] = await tx.select().from(invoiceCustomers).where(eq(invoiceCustomers.id,customerId));
      const [invoice] = await tx.select().from(savedInvoices).where(eq(savedInvoices.id,input.invoiceId));
      if (!customer || !invoice) throw new Error("Customer or invoice not found");
      if (invoice.updatedAt.toISOString() !== input.expectedUpdatedAt) throw new Error("Invoice changed elsewhere. Reopen it before linking.");
      const [prior] = await tx.select().from(invoiceCustomerLinks).where(eq(invoiceCustomerLinks.invoiceId,invoice.id));
      await tx.insert(invoiceCustomerLinks).values({invoiceId:invoice.id,customerId}).onConflictDoUpdate({target:invoiceCustomerLinks.invoiceId,set:{customerId,updatedAt:new Date()}});
      await tx.insert(invoiceRevisions).values({id:crypto.randomUUID(),invoiceId:invoice.id,action:"customer_linked",title:`Customer ${prior?.customerId||"unlinked"} -> ${customerId}`,document:invoice.document});
      const document=invoice.document.lifecycle==="issued"?invoice.document:{...invoice.document,customerId};
      const [updated] = await tx.update(savedInvoices).set({document,updatedAt:new Date(Math.max(Date.now(),invoice.updatedAt.getTime()+1))}).where(eq(savedInvoices.id,invoice.id)).returning();return updated;
    });
    return NextResponse.json({invoice});
  } catch(error) {return NextResponse.json({error:error instanceof z.ZodError?"Invalid customer link":error instanceof Error?error.message:"Could not link customer"},{status:error instanceof z.ZodError?400:409});}
}
