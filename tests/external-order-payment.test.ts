import test from 'node:test';
import assert from 'node:assert/strict';
import {externalPaymentPatch,isExternallySettled,orderPaymentBalance,readExternalReceipt} from '../lib/external-order-payment';
import {checkoutCanContinue} from '../lib/checkout-continuation';
import {customerOrderView} from '../lib/customer-order-view';
import type {Order} from '../db/schema';

const pending={status:'payment_pending',grandTotal:'999.00',capturedPaymentAmount:null,externalPaymentReceipt:null};
const now=new Date('2026-10-17T10:00:00Z');
const receipt={amountMinor:99900,method:'upi_qr' as const,reference:'UTR fixture 123'};
test('personal QR receipts confirm a full order without fabricating a Razorpay capture',()=>{
 const saved={...pending,...externalPaymentPatch(pending,receipt,now)};
 assert.equal(saved.status,'processing');assert.equal(saved.capturedPaymentAmount,null);
 assert.equal(orderPaymentBalance(saved).remainingMinor,0);assert.equal(isExternallySettled(saved),true);
 assert.equal(checkoutCanContinue({...saved,checkoutChannel:'razorpay',paymentCapturedAt:null}),false);
 const view=customerOrderView({...saved,orderNumber:'fixture',cartSnapshot:[]} as unknown as Order);
 assert.equal(view.payment,'Payment received');assert.equal(view.received,999);assert.equal(view.codBalance,0);
});
test('COD settlement records only the remainder and preserves its real online advance',()=>{
 const order={...pending,status:'processing',capturedPaymentAmount:'199.80'};
 assert.throws(()=>externalPaymentPatch(order,receipt,now),/remaining balance/);
 const saved={...order,...externalPaymentPatch(order,{...receipt,amountMinor:79920},now)};
 assert.equal(orderPaymentBalance(saved).receivedMinor,99900);assert.equal(saved.capturedPaymentAmount,'199.80');
 assert.throws(()=>externalPaymentPatch(saved,{...receipt,amountMinor:1},now),/already recorded/);
 const laterCapture={...saved,capturedPaymentAmount:'999.00'};
 assert.equal(orderPaymentBalance(laterCapture).overpaidMinor,79920);
});
test('receipt validation rejects incomplete, negative, refunded and disputed entries and keeps delivery status',()=>{
 assert.equal(readExternalReceipt('HUME external receipt: {"amountMinor":99900}'),null);
 assert.throws(()=>externalPaymentPatch(pending,{...receipt,reference:''},now));
 assert.throws(()=>externalPaymentPatch(pending,{...receipt,amountMinor:-1},now));
 for(const status of ['cancelled','refunded','partially_refunded','payment_disputed'])assert.throws(()=>externalPaymentPatch({...pending,status},receipt,now));
 for(const status of ['packed','shipped','delivered','complete'])assert.equal(externalPaymentPatch({...pending,status},receipt,now).status,status);
});
