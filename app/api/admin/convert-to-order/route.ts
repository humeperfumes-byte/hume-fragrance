import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { checkoutDrafts,orders,secureCheckoutSessions,siteSettings,coupons,orderEditAudits } from '@/db/schema';
import { eq,sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { requireAdminToken } from '@/lib/admin-auth';
import { canonicalCart, CheckoutRequestError } from '@/lib/secure-checkout';
import { ADMIN_CONTROLS_KEY,normalizeAdminControls } from '@/lib/admin-settings';
import { priceSecureCart,expectedPaymentMinor } from '@/lib/secure-checkout-pricing';
import { normalizeIndianMobile } from '@/lib/phone';
export async function POST(request:NextRequest){
 const unauthorized=requireAdminToken(request);if(unauthorized)return unauthorized;
 if(request.headers.get('origin')!==request.nextUrl.origin)return NextResponse.json({error:'Invalid request origin'},{status:403});
 try{
  const {draftId,expectedUpdatedAt}=z.object({draftId:z.string().min(1).max(255),expectedUpdatedAt:z.string().datetime()}).strict().parse(await request.json());
  const [snapshot]=await db.select().from(checkoutDrafts).where(eq(checkoutDrafts.id,draftId)).limit(1);
  if(!snapshot)return NextResponse.json({error:'Checkout not found'},{status:404});
  const [already]=await db.select({id:orders.id,orderNumber:orders.orderNumber}).from(orders).where(eq(orders.sessionId,snapshot.sessionId)).limit(1);
  if(already)return NextResponse.json({ok:true,existing:true,orderId:already.id,orderNumber:already.orderNumber});
  if(snapshot.updatedAt.toISOString()!==expectedUpdatedAt)return NextResponse.json({error:'This checkout changed. Refresh and review it before creating an order.'},{status:409});
  const phone=normalizeIndianMobile(snapshot.phone||'');
  if(snapshot.country&&snapshot.country!=='IN')throw new CheckoutRequestError('Review this international checkout in Orders before creating an order.');
  if(!snapshot.fullName?.trim()||!/^[6-9]\d{9}$/.test(phone)||!snapshot.addressLine1?.trim()||!snapshot.city?.trim()||!snapshot.state?.trim()||!/^\d{6}$/.test(snapshot.pincode||''))throw new CheckoutRequestError('Complete the customer name, mobile number and delivery address before creating an order.');
  const [cart,setting]=await Promise.all([canonicalCart(snapshot.cartSnapshot),db.select({value:siteSettings.value}).from(siteSettings).where(eq(siteSettings.key,ADMIN_CONTROLS_KEY)).limit(1)]);
  const config=normalizeAdminControls(setting[0]?.value);
  const rawCodes=String(snapshot.pricingBreakdown.appliedCouponCode||snapshot.pricingBreakdown.couponCode||snapshot.pricingBreakdown.appliedOfferCodes||'').split(/\s*\+\s*/).filter(Boolean);
  const normal=rawCodes.filter(code=>!/^WELCOME-BACK-(5|10)$/.test(code));
  if(normal.length>1)throw new CheckoutRequestError('Review this checkout’s offers before creating an order.');
  const [row]=normal[0]?await db.select().from(coupons).where(eq(coupons.code,normal[0].toUpperCase())).limit(1):[];
  if(normal[0]&&(!row?.active||row.archivedAt))throw new CheckoutRequestError('The saved coupon is unavailable. Ask the customer to reopen checkout to review the total.',409);
  const coupon=row?{...row,value:Number(row.value),minSubtotal:Number(row.minSubtotal)}:null;
  const welcome=Number(snapshot.pricingBreakdown.welcomeBackPercent)===10?10:Number(snapshot.pricingBreakdown.welcomeBackPercent)===5?5:0;
  const quote=priceSecureCart(cart,coupon,welcome,config);
  const override=Number(snapshot.pricingBreakdown.overrideTotal);
  const hasOverride=Number.isFinite(override)&&override>0;
  const finalTotal=hasOverride?Math.round(override*100)/100:quote.grandTotal;
  if(!(finalTotal>0)||(!hasOverride&&Math.round(finalTotal*100)!==Math.round(Number(snapshot.grandTotal)*100)))throw new CheckoutRequestError('The price changed. Ask the customer to reopen checkout and review the current total.',409);
  const result=await db.transaction(async tx=>{
   await tx.execute(sql`SELECT set_config('lock_timeout','3s',true),set_config('statement_timeout','10s',true)`);
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${snapshot.sessionId}))`);
   const [current]=await tx.select().from(checkoutDrafts).where(eq(checkoutDrafts.id,draftId)).for('update').limit(1);
   if(!current)throw new CheckoutRequestError('Checkout not found',404);
   const [existing]=await tx.select({id:orders.id,orderNumber:orders.orderNumber}).from(orders).where(eq(orders.sessionId,current.sessionId)).limit(1);
   if(existing)return {existing:true,orderId:existing.id,orderNumber:existing.orderNumber};
   if(current.updatedAt.toISOString()!==expectedUpdatedAt||current.status==='promoted'||JSON.stringify(current.pricingBreakdown)!==JSON.stringify(snapshot.pricingBreakdown))throw new CheckoutRequestError('This checkout changed. Refresh and review it before creating an order.',409);
   const [session]=await tx.select().from(secureCheckoutSessions).where(eq(secureCheckoutSessions.id,current.sessionId)).limit(1);
   const id=session?.orderId||randomUUID();const orderNumber=session?.orderNumber||`HF-${new Date().getUTCFullYear()}-${randomUUID().slice(0,12).toUpperCase()}`;
   const gifts=quote.subtotal>=config.giftTwoThreshold?2:quote.subtotal>=config.giftOneThreshold?1:0;
   const giftItems=Array.from({length:gifts},(_,i)=>`Gift ${i+1}`);
   const cartSnapshot=[...cart,...giftItems.map((name,i)=>({id:`gift-tier-${i+1}`,name,inspiration:'Complimentary gift',price:0,quantity:1,isGift:true}))];
   const adjustment=Math.round((finalTotal-quote.grandTotal)*100)/100;
   const details={fullName:current.fullName||'',phone,alternatePhone:current.alternatePhone||'',email:current.email||'',addressLine1:current.addressLine1||'',addressLine2:current.addressLine2||'',city:current.city||'',state:current.state||'',pincode:current.pincode||'',notes:current.notes||''};
   await tx.insert(orders).values({id,orderNumber,sessionId:current.sessionId,status:'payment_pending',checkoutChannel:session?'razorpay':'manual_admin',paymentMethod:session?'Razorpay Online Payment':'Awaiting payment (checkout recovery)',...details,country:'IN',path:current.path,acquisitionSource:current.acquisitionSource,acquisitionCategory:current.acquisitionCategory,acquisitionReferrerHost:current.acquisitionReferrerHost,utmSource:current.utmSource,utmMedium:current.utmMedium,utmCampaign:current.utmCampaign,utmTerm:current.utmTerm,utmContent:current.utmContent,subtotal:quote.subtotal.toFixed(2),shippingFee:quote.shippingFee.toFixed(2),grandTotal:finalTotal.toFixed(2),codFee:'0.00',appliedCouponCode:coupon?.code||null,manualAdjustment:adjustment.toFixed(2),adjustmentReason:adjustment?String(current.pricingBreakdown.overrideReason||'Saved checkout total approved by admin'):null,cartSnapshot,giftItems});
   if(session)await tx.update(secureCheckoutSessions).set({cart,details,expectedPaymentMinor:expectedPaymentMinor(finalTotal,false),updatedAt:new Date()}).where(eq(secureCheckoutSessions.id,session.id));
   const history=Array.isArray(current.pricingBreakdown.recoveryHistory)?current.pricingBreakdown.recoveryHistory.slice(-49):[];
   await tx.update(checkoutDrafts).set({status:'promoted',leadStatus:'contacted',pricingBreakdown:{...current.pricingBreakdown,workflowUpdatedAt:new Date().toISOString(),recoveryHistory:[...history,{at:new Date().toISOString(),action:'order_created',orderNumber}]}}).where(eq(checkoutDrafts.id,draftId));
   await tx.insert(orderEditAudits).values({id:randomUUID(),orderId:id,changeType:'recovery_order_created',reason:'Created an unpaid order from reviewed checkout',actor:'admin',beforeSnapshot:{draftId},afterSnapshot:{orderNumber,grandTotal:finalTotal,status:'payment_pending',paymentReceived:false}});
   return {existing:false,orderId:id,orderNumber};
  });
  return NextResponse.json({ok:true,...result},{headers:{'Cache-Control':'private, no-store'}});
 }catch(error){
  if(error instanceof z.ZodError)return NextResponse.json({error:'Refresh the checkout and review its details before creating an order.'},{status:400});
  if(error instanceof CheckoutRequestError)return NextResponse.json({error:error.message},{status:error.status});
  return NextResponse.json({error:'The order could not be created. Refresh to check whether it was saved before retrying.'},{status:503});
 }
}
