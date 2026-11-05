import { db } from '@/db';
import { checkoutDrafts, orders } from '@/db/schema';
import { and, desc, gte, inArray, lte, ne, or } from 'drizzle-orm';
import { CheckoutsTable } from './CheckoutsTable';
import { formatINR } from '@/lib/currency';
import { filterExcludedAdminRows, collectExcludedSessionIds } from '@/lib/admin-data-filters';
import { parseAdminTimeWindow } from '@/lib/admin-time-window';
import { parseAdminMarket, isIndiaCheckoutSignal } from '@/lib/admin-market';
import { matchCheckoutOrder, recoveredOrder, recoveryState, checkoutValue, type RecoveryDraft } from '@/lib/checkout-recovery';
import { RotateCcw } from 'lucide-react';
export const dynamic='force-dynamic';
type AdminPageProps={searchParams?:Promise<{hours?:string;market?:string;from?:string;to?:string}>};
export default async function CheckoutsPage({searchParams}:AdminPageProps){
  const params=await searchParams;
  const timeWindow=parseAdminTimeWindow(params?.hours,params?.from,params?.to);
  let drafts:RecoveryDraft[]=[];let capped=false;
  try{
    const window=and(gte(checkoutDrafts.updatedAt,timeWindow.since),lte(checkoutDrafts.updatedAt,timeWindow.until));
    // Scheduled overdue work stays visible even when the customer last visited earlier.
    const overdue=and(lte(checkoutDrafts.nextFollowUpAt,new Date()),ne(checkoutDrafts.leadStatus,'lost'),ne(checkoutDrafts.leadStatus,'converted'));
    const rows=await db.select().from(checkoutDrafts).where(timeWindow.isCustom?window:or(window,overdue)).orderBy(desc(checkoutDrafts.createdAt),desc(checkoutDrafts.id)).limit(501);
    capped=rows.length>500;
    const checkoutRows=rows.slice(0,500);
    const sessionIds=checkoutRows.map(row=>row.sessionId);
    const linkedOrders=sessionIds.length?await db.select({id:orders.id,sessionId:orders.sessionId,orderNumber:orders.orderNumber,status:orders.status,createdAt:orders.createdAt,paymentCapturedAt:orders.paymentCapturedAt,paymentSyncStatus:orders.paymentSyncStatus}).from(orders).where(inArray(orders.sessionId,sessionIds)):[];
    drafts=checkoutRows.map(draft=>{
      const order=matchCheckoutOrder(draft.sessionId,linkedOrders);
      return {...draft,hasOrderRecord:!!order,hasConfirmedOrder:!!order&&recoveredOrder(order),linkedOrderId:order?.id||null,linkedOrderNumber:order?.orderNumber||null,linkedOrderStatus:order?.status||null,linkedOrderNeedsReview:!!order&&(['payment_authorized','refunded','partially_refunded','disputed'].includes(order.status)||['creating','switching','payment_review','payment_mismatch','multiple_captures'].includes(order.paymentSyncStatus||''))};
    });
    drafts=filterExcludedAdminRows(drafts,collectExcludedSessionIds(drafts));
    const market=parseAdminMarket(params?.market);
    if(market==='india')drafts=drafts.filter(isIndiaCheckoutSignal);
    else if(market==='out_of_india')drafts=drafts.filter(row=>!isIndiaCheckoutSignal(row));
  }catch{
    return <div className="admin-page-layout mx-auto max-w-7xl space-y-5"><h1 className="text-2xl font-semibold text-white">Checkout Recovery</h1><div role="alert" className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-amber-100"><h2 className="font-semibold">Checkouts could not be loaded</h2><p className="mt-2 text-sm text-white/50">Please refresh this page. Your saved checkouts have not been changed.</p></div></div>;
  }
  const now=Date.now();const states=drafts.map(draft=>recoveryState(draft,now));
  const summaries=[{label:'Needs follow-up',value:String(states.filter(state=>!state.recovered&&!state.lost&&!state.active&&state.hasContact&&!state.review).length)},{label:'Follow-up overdue',value:String(states.filter(state=>state.due).length)},{label:'Payment needs attention',value:String(states.filter(state=>state.payment).length)},{label:'Open checkout value',value:formatINR(drafts.filter((draft,index)=>!draft.hasOrderRecord&&!states[index].recovered&&!states[index].lost).reduce((sum,draft)=>sum+checkoutValue(draft),0))}];
  return <div className="admin-page-layout mx-auto max-w-7xl space-y-5">
    <header className="flex items-center gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#f2d56b]/20 bg-[#f2d56b]/10"><RotateCcw className="h-5 w-5 text-[#f2d56b]"/></span><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#f2d56b]/60">A thoughtful follow-up</p><h1 className="mt-1 text-2xl font-semibold text-white">Checkout Recovery</h1><p className="mt-1 text-sm text-white/45">See who needs help, prepare a personal message, and help them pick up where they left off.</p><p className="mt-1 text-xs text-white/35">{timeWindow.label}{!timeWindow.isCustom?' · Includes older overdue follow-ups.':''}</p></div></header>
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{summaries.map(item=><div key={item.label} className="rounded-2xl border border-white/10 bg-[#19191c] p-4"><p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{item.label}</p><p className="mt-2 text-2xl font-semibold text-white">{item.value}</p></div>)}</div>
    {capped&&<p role="status" className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200">Showing the most recent 500 checkouts. Narrow the date or market filter to see a complete result. Counters cover only the loaded records.</p>}
    <CheckoutsTable initialDrafts={drafts}/>
    <p className="text-xs leading-5 text-white/30">Open checkout value is potential order value, not collected revenue. Recovered checkouts have a linked order; this does not establish that a reminder caused the order. Priority is a rule-based work queue, not a prediction of purchase.</p>
  </div>;
}
