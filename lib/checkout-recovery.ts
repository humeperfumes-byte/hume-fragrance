import type { CheckoutDraft } from '@/db/schema';
import { readCheckoutActivity, ACTIVITY_LABELS } from './checkout-activity';
import { hasCheckoutContact } from './checkout-continuation';
import { formatINR } from './currency';

export type RecoveryDraft = CheckoutDraft & { hasOrderRecord: boolean; hasConfirmedOrder: boolean; linkedOrderId: string | null; linkedOrderNumber: string | null; linkedOrderStatus: string | null; linkedOrderNeedsReview: boolean };
export type RecoveryQueue = 'open' | 'due' | 'payment' | 'active' | 'no_contact' | 'recovered' | 'lost';
export const RECOVERY_QUEUES: Array<{key:RecoveryQueue;label:string}> = [{key:'open',label:'All open'},{key:'due',label:'Follow-up due'},{key:'payment',label:'Payment issues'},{key:'active',label:'Active now'},{key:'no_contact',label:'No contact details'},{key:'recovered',label:'Recovered'},{key:'lost',label:'Lost'}];
export function customerActivityAt(draft: CheckoutDraft): Date {
  const activity=readCheckoutActivity(draft.pricingBreakdown?.checkoutActivity).at(-1)?.at;
  const saved=typeof draft.pricingBreakdown?.customerUpdatedAt==='string' ? draft.pricingBreakdown.customerUpdatedAt : draft.updatedAt;
  const values=[activity,saved].map(value=>new Date(value || draft.createdAt).getTime()).filter(Number.isFinite);
  return new Date(Math.max(new Date(draft.createdAt).getTime(),...values));
}
export function recoveredOrder(order: {status:string;paymentCapturedAt?:unknown;paymentSyncStatus?:string|null}): boolean {
  if(/cancel|refund|disput/i.test(order.status)||['payment_review','payment_mismatch','multiple_captures'].includes(order.paymentSyncStatus||''))return false;
  return !!order.paymentCapturedAt || order.paymentSyncStatus==='external_paid' || ['processing','packed','shipped','delivered','complete'].includes(order.status);
}
export function recoveryState(draft: RecoveryDraft, now=Date.now()) {
  const last=readCheckoutActivity(draft.pricingBreakdown?.checkoutActivity).filter(item=>!['page_hidden','navigation_requested','reason_given','full_selected','partial_cod_selected','payment_options_viewed'].includes(item.event)).at(-1);
  const hasContact=hasCheckoutContact(draft);
  const recovered=draft.hasConfirmedOrder;
  const review=draft.linkedOrderNeedsReview || last?.event==='verification_failed' || last?.event==='payment_callback_verified';
  const lost=!recovered&&!review&&(draft.leadStatus==='lost'||draft.linkedOrderStatus==='cancelled');
  const active=!recovered&&!lost&&!review&&!draft.hasOrderRecord&&now-customerActivityAt(draft).getTime()<15*60*1000;
  const payment=!recovered&&!lost&&(draft.hasOrderRecord||!!last&&['payment_failed','verification_failed','payment_start_failed','payment_window_missing'].includes(last.event));
  const due=!recovered&&!lost&&!!draft.nextFollowUpAt&&new Date(draft.nextFollowUpAt).getTime()<=now;
  const label=recovered?'Recovered · order saved':review?'Payment needs checking':lost?'Marked lost':draft.hasOrderRecord?'Order saved · payment pending':last?ACTIVITY_LABELS[last.event]:draft.lastEditedField?'Delivery details in progress':'Checkout started';
  return {recovered,lost,active,payment,due,hasContact,review,label,last};
}
export function matchesRecoveryQueue(draft:RecoveryDraft,queue:RecoveryQueue,now=Date.now()) {
  const state=recoveryState(draft,now);
  return queue==='recovered' ? state.recovered : queue==='lost' ? state.lost : queue==='open' ? !state.recovered&&!state.lost : queue==='due' ? state.due : queue==='payment' ? state.payment : queue==='active' ? state.active : !state.recovered&&!state.lost&&!state.hasContact;
}
export function recoveryPriority(draft:RecoveryDraft,now=Date.now()) {
  const state=recoveryState(draft,now);
  if(state.recovered||state.lost)return 0;
  if(state.review)return 100;
  if(state.due&&state.hasContact)return 90;
  if(state.payment&&state.hasContact)return 80;
  if(!state.hasContact)return 10;
  if(state.active)return 20;
  return Math.min(75,40+(Number(draft.grandTotal)>=1500?15:0)+(draft.addressLine1?10:0)+(now-customerActivityAt(draft).getTime()<86400000?10:0));
}
export function matchCheckoutOrder<T extends {sessionId:string;createdAt:Date|string}>(sessionId:string,orders:T[]):T|undefined {
  return orders.filter(order=>order.sessionId===sessionId).sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())[0];
}
export function checkoutRecoveryMessage(name:string|null|undefined,url:string) {
  const first=(name||'').trim().split(/\s+/)[0] || 'there';
  return {subject:'Complete your HUME order today',body:[`Hi ${first},`,'','Don’t leave your favourites behind. ✨','Your HUME cart is saved—make it yours today.','Prices and availability can change, so complete your order now:','',url,'','Need help placing your order? Just reply.'].join('\n')};
}
export function checkoutValue(draft:CheckoutDraft) { const value=Number(draft.pricingBreakdown?.overrideTotal ?? draft.grandTotal ?? 0);return Number.isFinite(value)?value:0; }
export function formatRecoveryDue(value:Date|string|null) {return value ? new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}).format(new Date(value))+' IST' : 'Not scheduled';}
export const recoveryValueLabel=(draft:CheckoutDraft)=>formatINR(checkoutValue(draft));
