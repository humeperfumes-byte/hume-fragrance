'use client';
import SiteLoading from '@/components/SiteLoading';
import { useEffect,useState } from 'react';
import { ACTIVITY_LABELS,EXIT_REASONS,readCheckoutActivity,type CheckoutActivity } from '@/lib/checkout-activity';
export default function CheckoutActivityTimeline({sessionId}:{sessionId:string}){return <ActivityForSession key={sessionId} sessionId={sessionId}/>;}
function ActivityForSession({sessionId}:{sessionId:string}){
 const [events,setEvents]=useState<CheckoutActivity[]>([]);const [state,setState]=useState('loading');const [attempt,setAttempt]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();let active=true;const timer=window.setTimeout(()=>controller.abort(),10000);
  fetch(`/api/admin/checkout-activity?sessionId=${encodeURIComponent(sessionId)}`,{signal:controller.signal,cache:'no-store'}).then(async response=>{if(!response.ok)throw Error();const data=await response.json();if(active){setEvents(readCheckoutActivity(data.activity));setState('ready');}}).catch(()=>{if(active)setState('error');}).finally(()=>clearTimeout(timer));
  return()=>{active=false;clearTimeout(timer);controller.abort();};
 },[sessionId,attempt]);
 const last=events.findLast(item=>!['page_hidden','navigation_requested','reason_given','full_selected','partial_cod_selected','payment_options_viewed'].includes(item.event));
 const reason=events.findLast(item=>item.event==='reason_given'&&item.reason)?.reason;
 const suggestions:Partial<Record<CheckoutActivity['event'],string>>={opened:'No later payment action recorded; the exact reason is unknown.',validation_failed:'Details or availability prevented checkout from continuing.',payment_start_failed:'A technical issue prevented payment from starting.',payment_window_missing:'The payment window did not appear.',payment_window_closed:'The payment window closed without a confirmed result.',payment_failed:'The payment provider reported a failure.',verification_failed:'Payment confirmation needs checking before requesting another payment.',payment_callback_verified:'A payment callback was verified. Review the order before requesting payment.'};
 const when=(at:string)=>new Date(at).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})+' IST';
 return <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-white">Checkout activity</h3><button type="button" onClick={()=>{setState('loading');setAttempt(value=>value+1);}} className="text-xs text-[#c5a9ff]" disabled={state==='loading'}>Refresh activity</button></div>
  {state==='loading'?<SiteLoading compact dark title="Gathering checkout activity" description="Preparing the last recorded checkout stage."/>:state==='error'?<p role="status" className="mt-2 text-xs text-white/55">Activity could not be loaded. Use Refresh activity to retry.</p>:<>
   {last?<><p className="mt-3 text-sm text-white/80">Last step: {ACTIVITY_LABELS[last.event]}</p><p className="mt-1 text-xs leading-5 text-white/50">{suggestions[last.event]||'No later payment result recorded; the exact reason is unknown.'}</p></>:<p className="mt-3 text-sm text-white/45">No activity recorded yet.</p>}
   {reason&&<p className="mt-3 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-200">Customer’s stated reason: {EXIT_REASONS[reason]}</p>}
   {events.length>0&&<details className="mt-3 border-t border-white/10 pt-3"><summary className="cursor-pointer text-xs text-white/55">View recent activity · {events.length} recorded events</summary><ol className="mt-3 space-y-3 border-l border-white/10 pl-4">{events.slice(-12).reverse().map((item,index)=><li key={`${item.at}-${index}`}><p className="text-xs text-white/65">{ACTIVITY_LABELS[item.event]}</p><p className="mt-0.5 text-[10px] text-white/35">{when(item.at)}</p></li>)}</ol></details>}
  </>}
 </section>;
}
