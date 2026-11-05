import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { checkoutDrafts, orders } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";

import { recoveryWorkflowSchema, recoveryWorkflowUpdate, RecoveryWorkflowError } from "@/lib/checkout-recovery-workflow";
import { recoveredOrder } from "@/lib/checkout-recovery";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const hours = Math.min(24 * 90, Math.max(1, Number(searchParams.get("hours") || "720")));
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const drafts = await db
      .select()
      .from(checkoutDrafts)
      .where(and(gte(checkoutDrafts.updatedAt, since)))
      .orderBy(desc(checkoutDrafts.updatedAt))
      .limit(200);

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("admin checkout-drafts fetch error:", error);
    return NextResponse.json({ error: "Failed to load checkout drafts" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const unauthorized=requireAdminToken(request);if(unauthorized)return unauthorized;
  if(request.headers.get('origin')!==request.nextUrl.origin)return NextResponse.json({error:'Invalid request origin'},{status:403});
  try {
    const data=recoveryWorkflowSchema.parse(await request.json());
    const [snapshot]=await db.select({sessionId:checkoutDrafts.sessionId}).from(checkoutDrafts).where(eq(checkoutDrafts.id,data.id)).limit(1);
    if(!snapshot)return NextResponse.json({error:'Checkout not found'},{status:404});
    const draft=await db.transaction(async tx=>{
      await tx.execute(sql`SELECT set_config('lock_timeout','3s',true),set_config('statement_timeout','8s',true)`);
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${snapshot.sessionId}))`);
      const [current]=await tx.select().from(checkoutDrafts).where(eq(checkoutDrafts.id,data.id)).for('update').limit(1);
      if(!current)throw new RecoveryWorkflowError('Checkout not found',404);
      const linked=await tx.select({status:orders.status,paymentCapturedAt:orders.paymentCapturedAt,paymentSyncStatus:orders.paymentSyncStatus}).from(orders).where(eq(orders.sessionId,current.sessionId));
      const patch=recoveryWorkflowUpdate(current,data,linked.length>0,linked.some(recoveredOrder));
      return (await tx.update(checkoutDrafts).set(patch).where(eq(checkoutDrafts.id,data.id)).returning())[0];
    });
    return NextResponse.json({ok:true,draft},{headers:{'Cache-Control':'private, no-store'}});
  }catch(error){
    if(error instanceof z.ZodError)return NextResponse.json({error:'Please check the lead fields and try again.'},{status:400});
    if(error instanceof RecoveryWorkflowError)return NextResponse.json({error:error.message},{status:error.status});
    return NextResponse.json({error:'The lead could not be saved. Please retry.'},{status:503});
  }
}
