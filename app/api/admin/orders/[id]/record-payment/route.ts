import {randomUUID} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import {eq,sql} from 'drizzle-orm';
import {z} from 'zod';
import {db} from '@/db';
import {orders,orderEditAudits,secureCheckoutSessions,checkoutDrafts} from '@/db/schema';
import {requireAdminToken} from '@/lib/admin-auth';
import {externalPaymentPatch,externalReceiptSchema,isExternallySettled} from '@/lib/external-order-payment';
import {readBoundedJson} from '@/lib/bounded-request-body';
import {secureCheckoutConfigured} from '@/lib/checkout-settings';
import {closeManualLinkForExternalPayment} from '@/lib/manual-order-payment';

const inputSchema=externalReceiptSchema.omit({recordedAt:true}).extend({expectedUpdatedAt:z.string().datetime(),confirmed:z.literal(true)}).strict();
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
 const unauthorized=requireAdminToken(request);if(unauthorized)return unauthorized;
 try {
  const input=inputSchema.parse(await readBoundedJson(request,4000));const {id}=await params;
  const order=await db.transaction(async tx=>{
   const [snapshot]=await tx.select().from(orders).where(eq(orders.id,id)).limit(1);
   if(!snapshot)throw new Error('Order not found');
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${snapshot.sessionId}))`);
   const [current]=await tx.select().from(orders).where(eq(orders.id,id)).for('update');
   if(isExternallySettled(current))return current;
   if(current.updatedAt.toISOString()!==input.expectedUpdatedAt)throw new Error('This order changed. Reopen it before recording the payment.');
   const patch=externalPaymentPatch(current,input);
   await closeManualLinkForExternalPayment(current);
   const [saved]=await tx.update(orders).set(patch).where(eq(orders.id,id)).returning();
   await tx.insert(orderEditAudits).values({id:randomUUID(),orderId:id,changeType:'external_payment',actor:'admin',reason:`Full payment recorded: ${input.method}; ₹${(input.amountMinor/100).toFixed(2)}; ${input.reference}`,beforeSnapshot:current,afterSnapshot:saved});
   if(secureCheckoutConfigured())await tx.update(secureCheckoutSessions).set({updatedAt:new Date()}).where(eq(secureCheckoutSessions.orderId,id));
   await tx.update(checkoutDrafts).set({status:'complete',updatedAt:new Date()}).where(eq(checkoutDrafts.sessionId,current.sessionId));
   return saved;
  });
  return NextResponse.json({ok:true,order},{headers:{'Cache-Control':'private, no-store'}});
 }catch(error){return NextResponse.json({error:error instanceof z.ZodError?error.issues.map(issue=>issue.message).join('; '):error instanceof Error?error.message:'Could not record payment'},{status:409});}
}
