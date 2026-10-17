"use client";
import {useState} from 'react';
import type {Order} from '@/db/schema';
import {isExternallySettled,orderPaymentBalance} from '@/lib/external-order-payment';

export function ExternalPaymentPanel({order,onUpdate}:{order:Order;onUpdate:(order:Order)=>void}) {
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const balance=orderPaymentBalance(order);
 const settled=isExternallySettled(order);
 if(/refund|disput|cancel/i.test(order.status))return null;
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;const form=new FormData(event.currentTarget);setBusy(true);setError('');
  try{const response=await fetch(`/api/admin/orders/${encodeURIComponent(order.id)}/record-payment`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amountMinor:Math.round(Number(form.get('amount'))*100),method:form.get('method'),reference:form.get('reference'),confirmed:true,expectedUpdatedAt:new Date(order.updatedAt).toISOString()}),signal:AbortSignal.timeout(30000)});const data=await response.json();if(!response.ok)throw new Error(data.error||'Could not record payment');onUpdate(data.order);setOpen(false);}
  catch(cause){setError(cause instanceof Error?cause.message:'Could not record payment');}finally{setBusy(false);}
 }
 return <section className="space-y-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-4">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold text-emerald-100">{settled?'Fully paid · payment recorded':'Received payment outside the website?'}</h3><p className="mt-1 text-xs text-white/55">{settled?`₹${(balance.receivedMinor/100).toFixed(2)} received · No COD collection due`:'Record a verified personal QR, bank transfer or cash receipt.'}</p></div>{!settled&&balance.remainingMinor>0&&!balance.receipt&&<button type="button" onClick={()=>setOpen(!open)} disabled={busy} className="rounded-lg border border-emerald-300/25 px-3 py-2 text-xs font-semibold text-emerald-100">{open?'Cancel':'Record full payment'}</button>}</div>
  {balance.receipt&&<p className="break-words text-xs text-white/50">External receipt ₹{(balance.receipt.amountMinor/100).toFixed(2)} · {balance.receipt.method.replaceAll('_',' ')} · {balance.receipt.reference}{balance.capturedMinor>0?` · Razorpay ₹${(balance.capturedMinor/100).toFixed(2)}`:''}</p>}
  {balance.overpaidMinor>0&&<p role="alert" className="text-sm text-amber-200">Payments exceed the total by ₹{(balance.overpaidMinor/100).toFixed(2)}. Review the receipts and arrange any refund separately.</p>}
  {open&&!settled&&<form onSubmit={submit} className="space-y-3"><fieldset disabled={busy} className="grid gap-3 sm:grid-cols-2 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-white/15 [&_input]:bg-black/20 [&_input]:px-3 [&_input]:py-2 [&_select]:w-full [&_select]:rounded-lg [&_select]:bg-[#202229] [&_select]:px-3 [&_select]:py-2"><label className="space-y-1 text-xs">Amount received now (₹)<input name="amount" type="number" step="0.01" min="0.01" required defaultValue={(balance.remainingMinor/100).toFixed(2)}/></label><label className="space-y-1 text-xs">Received through<select name="method"><option value="upi_qr">UPI / personal QR</option><option value="bank_transfer">Bank transfer</option><option value="cash">Cash</option></select></label><label className="space-y-1 text-xs sm:col-span-2">UTR / transaction reference or cash receipt note<input name="reference" required minLength={3} maxLength={200}/></label><label className="flex items-start gap-2 text-xs text-white/65 sm:col-span-2"><input type="checkbox" required className="!w-auto"/>I verified this receipt. Confirm the order as fully paid with no amount due on delivery.</label></fieldset><button type="submit" disabled={busy} className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold disabled:opacity-50">{busy?'Recording payment…':'Confirm fully paid'}</button></form>}
  {error&&<p role="alert" className="text-sm text-amber-200">{error}</p>}
 </section>;
}
