import test from 'node:test';
import assert from 'node:assert/strict';

import { checkoutRecoveryMessage,checkoutValue,customerActivityAt,matchCheckoutOrder,recoveredOrder,recoveryState,matchesRecoveryQueue,recoveryPriority,type RecoveryDraft } from '../lib/checkout-recovery';
import { recoveryWorkflowUpdate,recoveryWorkflowSchema } from '../lib/checkout-recovery-workflow';
const now=Date.parse('2026-10-29T06:00:00Z');
function draft(patch:Partial<RecoveryDraft>={}):RecoveryDraft{return {id:'draft',sessionId:'session',status:'partial',fullName:'Asha Sharma',phone:'9900000000',email:null,createdAt:new Date(now-86400000),updatedAt:new Date(now-3600000),nextFollowUpAt:null,lastContactedAt:null,leadStatus:'new',leadNotes:null,pricingBreakdown:{},cartSnapshot:[{id:'p',name:'Test perfume',price:799,quantity:1}],grandTotal:'799',hasOrderRecord:false,hasConfirmedOrder:false,linkedOrderId:null,linkedOrderNumber:null,linkedOrderStatus:null,linkedOrderNeedsReview:false,...patch} as RecoveryDraft;}

test('orders match the checkout session, never another purchase by the same contact',()=>{
 const rows=[{sessionId:'other',email:'same@example.com',createdAt:new Date(now),id:'unrelated'},{sessionId:'session',createdAt:new Date(now-1000),id:'latest'},{sessionId:'session',createdAt:new Date(now-2000),id:'older'}];
 assert.equal(matchCheckoutOrder('session',rows)?.id,'latest');assert.equal(matchCheckoutOrder('unknown',rows),undefined);
});
test('authorized payments are not recovered and payment-review status wins over processing',()=>{
 assert.equal(recoveredOrder({status:'payment_authorized'}),false);
 assert.equal(recoveredOrder({status:'processing',paymentSyncStatus:'payment_review'}),false);
 assert.equal(recoveredOrder({status:'processing'}),true);
 assert.equal(recoveredOrder({status:'refunded',paymentCapturedAt:new Date()}),false);
});
test('queues separate active customers, contactable leads, missing contacts and due work',()=>{
 assert.equal(matchesRecoveryQueue(draft({updatedAt:new Date(now-1000)}),'active',now),true);
 assert.equal(matchesRecoveryQueue(draft({phone:null,email:null,fullName:'Name only'}),'no_contact',now),true);
 const due=draft({nextFollowUpAt:new Date(now-1)});assert.equal(matchesRecoveryQueue(due,'due',now),true);
 assert.ok(recoveryPriority(due,now)>recoveryPriority(draft(),now));
});
test('real orders and review flags take precedence over lead status',()=>{
 assert.equal(matchesRecoveryQueue(draft({hasOrderRecord:true,hasConfirmedOrder:true,leadStatus:'lost'}),'recovered',now),true);
 const review=draft({hasOrderRecord:true,linkedOrderNeedsReview:true,leadStatus:'lost'});
 assert.equal(recoveryState(review,now).review,true);assert.equal(matchesRecoveryQueue(review,'payment',now),true);
 assert.equal(matchesRecoveryQueue(draft({leadStatus:'lost'}),'lost',now),true);
});
test('admin workflow timestamps never count as customer activity',()=>{
 const row=draft({pricingBreakdown:{workflowUpdatedAt:new Date(now).toISOString(),customerUpdatedAt:new Date(now-3600000).toISOString()}});
 assert.equal(customerActivityAt(row).getTime(),now-3600000);
 assert.equal(recoveryState(row,now).active,false);
});
test('contact action updates status and time, ordinary saves preserve contact time and customer time',()=>{
 const row=draft();const saved=recoveryWorkflowUpdate(row,{id:row.id,leadStatus:'new',markContacted:true},false,false,new Date(now));
 assert.equal(saved.leadStatus,'contacted');assert.equal(saved.lastContactedAt?.getTime(),now);
 assert.equal('updatedAt' in saved,false);
 const notes=recoveryWorkflowUpdate(draft({leadStatus:'contacted'}),{id:row.id,leadStatus:'contacted',leadNotes:'Follow up tomorrow'},false,false,new Date(now));
 assert.equal(notes.lastContactedAt,undefined);
});
test('workflow saves preserve offer details, activity and overrides unless explicitly changed',()=>{
 const row=draft({pricingBreakdown:{overrideTotal:700,couponCode:'TEN',checkoutActivity:[{event:'opened',at:new Date(now-1000).toISOString()}]}});
 const saved=recoveryWorkflowUpdate(row,{id:row.id,leadNotes:'Notes only'},false,false,new Date(now));
 assert.equal(saved.pricingBreakdown.overrideTotal,700);assert.equal((saved.pricingBreakdown as Record<string,unknown>).couponCode,'TEN');assert.deepEqual((saved.pricingBreakdown as Record<string,unknown>).checkoutActivity,row.pricingBreakdown.checkoutActivity);
});
test('price changes require a reason, cannot change frozen orders, and stale edits fail',()=>{
 const row=draft();assert.throws(()=>recoveryWorkflowUpdate(row,{id:row.id,overrideTotal:700},false,false),/reason/);
 assert.throws(()=>recoveryWorkflowUpdate(row,{id:row.id,overrideTotal:700,overrideReason:'Approved quote'},true,false),/already has an order/);
 assert.throws(()=>recoveryWorkflowUpdate(draft({pricingBreakdown:{workflowUpdatedAt:new Date(now).toISOString()}}),{id:row.id,expectedWorkflowUpdatedAt:null},false,false),/another tab/);
 assert.equal(recoveryWorkflowSchema.safeParse({id:'draft',overrideTotal:-5}).success,false);
});
test('a lead cannot be marked converted without a confirmed order',()=>{
 assert.throws(()=>recoveryWorkflowUpdate(draft(),{id:'draft',leadStatus:'converted'},false,false),/confirmed order/);
});
test('recovery message contains a secure continuation link and no false offers or internal field names',()=>{
 const url='https://www.humefragrance.com/checkout/example?resume=1';const message=checkoutRecoveryMessage('Asha Sharma',url);
 assert.ok(message.body.startsWith('Hi Asha,'));assert.ok(message.body.includes(url));assert.ok(!message.body.includes('Open on your original device'));assert.ok(!message.body.includes('HUME Fragrance'));
 assert.ok(!/discount|addressLine|lastEditedField|reserved|limited stock/i.test(message.body));assert.ok(message.body.length<500);
});
test('saved approved totals are shown consistently in the queue',()=>{assert.equal(checkoutValue(draft({pricingBreakdown:{overrideTotal:700}})),700);});
