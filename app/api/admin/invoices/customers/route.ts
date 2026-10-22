import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { invoiceCustomers, savedInvoices, invoiceCustomerLinks } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";
import { readBoundedJson } from "@/lib/bounded-request-body";
import { invoiceSnapshotFingerprint } from "@/lib/invoice-document";
import { customerSchema } from "@/lib/invoice-ledger";

const querySchema = z.object({q:z.string().max(200).default(""),page:z.coerce.number().int().min(1).max(1000000).default(1),pageSize:z.coerce.number().int().min(1).max(100).default(25)});
export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request); if (unauthorized) return unauthorized;
  try {
    const input = querySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const pattern = `%${input.q.trim().replace(/[\\%_]/g,value=>`\\${value}`)}%`;
    const where = input.q.trim() ? sql`concat_ws(' ',${invoiceCustomers.name},${invoiceCustomers.email},${invoiceCustomers.phone},${invoiceCustomers.gstin}) ilike ${pattern}` : undefined;
    const result = await db.transaction(async tx=>{
      const [count] = await tx.select({total:sql<number>`count(*)::int`}).from(invoiceCustomers).where(where);
      const customers = await tx.select().from(invoiceCustomers).where(where).orderBy(asc(invoiceCustomers.name),asc(invoiceCustomers.id)).limit(input.pageSize).offset((input.page-1)*input.pageSize);
      const [unlinked] = await tx.select({total:sql<number>`count(*)::int`}).from(savedInvoices).where(sql`not exists(select 1 from ${invoiceCustomerLinks} where ${invoiceCustomerLinks.invoiceId}=${savedInvoices.id})`);
      return {customers,total:count.total,unlinked:unlinked.total,page:input.page,pageSize:input.pageSize};
    },{isolationLevel:"repeatable read",accessMode:"read only"});
    return NextResponse.json(result,{headers:{"Cache-Control":"private, no-store"}});
  } catch (error) { return NextResponse.json({error:error instanceof z.ZodError ? "Invalid customer search" : "Could not load customer directory"},{status:error instanceof z.ZodError?400:503}); }
}
const saveSchema = customerSchema.extend({id:z.string().uuid(),expectedUpdatedAt:z.string().datetime().optional()});
export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request); if (unauthorized) return unauthorized;
  try {
    const {id,expectedUpdatedAt,...input} = saveSchema.parse(await readBoundedJson(request,16000));
    const customer = await db.transaction(async tx=>{
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`customer-${id}`}))`);
      const [existing] = await tx.select().from(invoiceCustomers).where(eq(invoiceCustomers.id,id));
      if (existing) {
        if (!expectedUpdatedAt && invoiceSnapshotFingerprint(input) === invoiceSnapshotFingerprint({name:existing.name,address:existing.address,email:existing.email,phone:existing.phone,gstin:existing.gstin})) return existing;
        if (!expectedUpdatedAt || existing.updatedAt.toISOString() !== expectedUpdatedAt) throw new Error("Customer changed elsewhere. Reload the directory before editing.");
        const [updated] = await tx.update(invoiceCustomers).set({...input,updatedAt:new Date(Math.max(Date.now(),existing.updatedAt.getTime()+1))}).where(eq(invoiceCustomers.id,id)).returning();
        return updated;
      }
      if (expectedUpdatedAt) throw new Error("Customer no longer exists");
      const [created] = await tx.insert(invoiceCustomers).values({id,...input}).returning();return created;
    });
    return NextResponse.json({customer});
  } catch(error) {return NextResponse.json({error:error instanceof z.ZodError ? error.issues.map(row=>`${row.path.join(".")}: ${row.message}`).join("; ") : error instanceof Error ? error.message : "Could not save customer"},{status:error instanceof z.ZodError?400:409});}
}
