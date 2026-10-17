// Run with node --require ./scripts/server-only-test-register.cjs --import tsx scripts/verify-external-order-payment.ts
import {config} from 'dotenv';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
config({path:'.env.local',quiet:true});config({path:'.env',quiet:true});
async function main(){
 const {db}=await import('../db');const {orders,products,orderEditAudits}=await import('../db/schema');const {eq}=await import('drizzle-orm');
 const {POST:record}=await import('../app/api/admin/orders/[id]/record-payment/route');
 const {POST:create}=await import('../app/api/admin/orders/manual/route');
 const {NextRequest}=await import('next/server');
 const realTransaction=db.transaction.bind(db),rollback=new Error('verification rollback');
 const request=(body:unknown,url='http://localhost:3002/api/admin/orders/manual?saveOnly=1')=>new NextRequest(url,{method:'POST',headers:{'x-admin-token':process.env.ADMIN_API_TOKEN||'','Content-Type':'application/json'},body:JSON.stringify(body)});
 try{await realTransaction(async tx=>{
  const original=db.transaction;db.transaction=(async callback=>callback(tx)) as typeof db.transaction;
  try{
   const [product]=await tx.select().from(products).where(eq(products.priceCurrency,'INR')).limit(1);assert.ok(product,'An INR product is needed');
   const created=await create(request({requestId:randomUUID(),fullName:'External payment verification',phone:'9876543210',addressLine1:'Verification address only',city:'Kanpur',state:'Uttar Pradesh',pincode:'208012',items:[{id:product.id,quantity:1}],paymentMode:'already_paid',receiptMethod:'upi_qr',receiptReference:'Synthetic receipt - rollback'}));
   assert.equal(created.status,200,await created.clone().text());const custom=(await created.json()).order;
   assert.equal(custom.status,'processing');assert.equal(custom.razorpayOrderId,null);assert.equal(custom.capturedPaymentAmount,null);assert.ok(custom.externalPaymentReceipt);
   const id=randomUUID();const [cod]=await tx.insert(orders).values({id,orderNumber:`TEST-${id}`,sessionId:randomUUID(),checkoutChannel:'razorpay',status:'processing',grandTotal:'1000.00',capturedPaymentAmount:'200.00',paymentCapturedAt:new Date(),paymentMethod:'20% Prepaid + 80% Cash on Delivery',cartSnapshot:[]}).returning();
   const payload={amountMinor:80000,method:'upi_qr',reference:'Synthetic COD balance - rollback',confirmed:true,expectedUpdatedAt:cod.updatedAt.toISOString()};
   const call=(body:unknown)=>record(request(body),{params:Promise.resolve({id})});
   assert.equal((await call({...payload,amountMinor:100000})).status,409);
   const result=await call(payload);assert.equal(result.status,200,await result.clone().text());const saved=(await result.json()).order;
   assert.equal(saved.status,'processing');assert.equal(saved.capturedPaymentAmount,'200.00');assert.equal(saved.externalPaymentReceipt.amountMinor,80000);
   assert.equal((await call(payload)).status,200,'A retry returns the same receipt without double counting');
   const history=await tx.select().from(orderEditAudits).where(eq(orderEditAudits.orderId,id));assert.equal(history.length,1);
   const unauthorized=await record(new NextRequest('http://localhost/api/admin/orders/test/record-payment',{method:'POST',headers:{'x-admin-token':'invalid'},body:JSON.stringify(payload)}),{params:Promise.resolve({id})});assert.equal(unauthorized.status,401);
   console.log('External receipt checks passed: confirmed custom entry, COD remainder, capture preservation, duplicate retry, audit and authorization.');
  }finally{db.transaction=original;}
  throw rollback;
 });}catch(error){if(error!==rollback)throw error;}
 console.log('All synthetic orders and receipts rolled back. No provider payment requests or customer notifications sent.');
}
main().then(()=>process.exit(0)).catch(error=>{console.error(error.message);process.exit(1);});
