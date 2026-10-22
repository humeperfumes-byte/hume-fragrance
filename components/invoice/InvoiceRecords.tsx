"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SavedInvoice } from "@/lib/invoice-document";
import { buildCorrection, correctionSchema, invoiceBalance, type Correction } from "@/lib/invoice-ledger";
import { CustomerPicker } from "./CustomerPicker";
import { formatINR } from "@/lib/currency";

type Records = {invoice:SavedInvoice;corrections:Correction[];balance:ReturnType<typeof invoiceBalance>;customerId?:string|null};
const money=(minor:number|null)=>minor===null?"Unknown":formatINR(minor/100);
export function InvoiceRecords({id,onClose,onChanged}:{id:string;onClose:()=>void;onChanged:(invoice:SavedInvoice)=>void}) {
  const [records,setRecords]=useState<Records|null>(null);const [error,setError]=useState("");const [busy,setBusy]=useState(false);
  const [kind,setKind]=useState<"credit"|"refund"|"cancel">("credit");
  const [date,setDate]=useState(()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()));
  const [reason,setReason]=useState("");const [reference,setReference]=useState("");const [amount,setAmount]=useState("");
  const [quantities,setQuantities]=useState<Record<string,string>>({});const [shipping,setShipping]=useState(false);const [confirming,setConfirming]=useState(false);
  const pending=useRef<{signature:string;id:string}|null>(null);
  const load=useCallback(async()=>{
    const response=await fetch(`/api/admin/invoices/corrections?invoiceId=${id}`,{cache:"no-store",signal:AbortSignal.timeout(15000)});
    const data=await response.json();if(!response.ok)throw new Error(data.error);setRecords(data);return data as Records;
  },[id]);
  useEffect(()=>{let active=true;load().catch(error=>{if(active)setError(error.message);});return()=>{active=false;};},[load]);
  function input(){return correctionSchema.parse({id:pending.current?.id||crypto.randomUUID(),invoiceId:id,expectedUpdatedAt:records!.invoice.updatedAt,kind,date,reason,reference,
    lines:kind==="credit"?Object.entries(quantities).filter(([,value])=>Number(value)>0).map(([itemId,value])=>({itemId,quantity:Number(value)})):[],includeShipping:kind==="credit"&&shipping,...(kind==="refund"?{amount:Number(amount)}:{})});}
  function review(){setError("");try{buildCorrection(records!.invoice.document,records!.corrections,input());setConfirming(true);}catch(error){setError(error instanceof Error?error.message:"Check correction details");}}
  async function commit(){
    setBusy(true);setError("");
    try{
      const values=input(),signature=JSON.stringify({...values,id:undefined});
      if(pending.current?.signature!==signature)pending.current={signature,id:crypto.randomUUID()};
      const response=await fetch("/api/admin/invoices/corrections",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...values,id:pending.current.id}),signal:AbortSignal.timeout(30000)});
      const data=await response.json();if(!response.ok)throw new Error(data.error);
      pending.current=null;setConfirming(false);setReason("");setReference("");setAmount("");setQuantities({});setShipping(false);
      const fresh=await load();onChanged(fresh.invoice);
    }catch(error){setError(error instanceof Error?error.message:"Could not record correction");}finally{setBusy(false);}
  }
  let preview:ReturnType<typeof buildCorrection>|null=null;
  if(confirming&&records){try{preview=buildCorrection(records.invoice.document,records.corrections,input());}catch{preview=null;}}
  return <section className="invoice-controls border-b border-white/10 bg-[#12141b] p-5 print:hidden sm:p-7" aria-label="Invoice records"><div className="mx-auto max-w-6xl space-y-5">
    <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-semibold">Invoice records</h2><p className="mt-1 text-sm text-white/45">{records?.invoice.document.invoiceNumber} · {records?.invoice.document.buyerName}</p></div><div className="flex gap-2"><button className="invoice-small-button" disabled={busy} onClick={()=>{setError("");void load().catch(error=>setError(error.message));}}>Reload records</button><button className="invoice-small-button" disabled={busy} onClick={onClose}>Close records</button></div></div>
    {error&&<p role="alert" className="text-sm text-amber-200">{error}</p>}
    {!records?<p role="status" className="text-sm text-white/50">Loading records…</p>:<>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{[["Original invoice",records.balance.totalMinor],["Credits",records.balance.creditMinor],["Balance due",records.balance.balanceMinor],["Customer credit",records.balance.customerCreditMinor]].map(([label,value])=><div key={String(label)}><p className="text-xs text-white/45">{label}</p><p className="mt-1 font-semibold">{money(value as number|null)}</p></div>)}</div>
      <p className="text-xs text-white/45">Recorded receipts {money(records.balance.receivedMinor)} · Refunds {money(records.balance.refundMinor)}. {records.balance.cancelled?"Cancelled: invoice details and payment records are locked.":!records.balance.paymentKnown?"Record the actual amount received to establish the balance.":"Manual refund records."}</p>
      <details className="invoice-card"><summary className="cursor-pointer font-semibold">Customer statement link · {records.customerId?"Linked":"Not linked"}</summary><fieldset disabled={busy} className="mt-4"><CustomerPicker onSelect={customer=>{
        if(!window.confirm(`Link this invoice to ${customer.name}? Its original billing details will be retained.`))return;
        setBusy(true);setError("");fetch(`/api/admin/invoices/customers/${customer.id}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({invoiceId:id,expectedUpdatedAt:records.invoice.updatedAt}),signal:AbortSignal.timeout(15000)}).then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data.error);const fresh=await load();onChanged(fresh.invoice);}).catch(error=>setError(error.message)).finally(()=>setBusy(false));
      }}/></fieldset></details>
      {records.invoice.document.lifecycle==="issued"&&!records.balance.cancelled&&<form className="invoice-card" onSubmit={event=>{event.preventDefault();review();}}><h3 className="mb-4 font-semibold">Corrections</h3><fieldset disabled={busy||confirming} className="space-y-4"><div className="invoice-fields"><label className="invoice-field"><span>Action</span><select value={kind} onChange={event=>setKind(event.target.value as typeof kind)}><option value="credit">Issue credit note</option><option value="refund">Record completed refund</option><option value="cancel">Cancel unpaid invoice</option></select></label><label className="invoice-field"><span>Correction date</span><input type="date" required value={date} onChange={event=>setDate(event.target.value)}/></label><label className="invoice-field sm:col-span-2"><span>Reason</span><textarea required minLength={3} maxLength={2000} value={reason} onChange={event=>setReason(event.target.value)}/></label></div>
      {kind==="credit"&&<>{records.invoice.document.items.map(item=>{const credited=records.corrections.flatMap(row=>row.lines).filter(row=>row.itemId===item.id).reduce((sum,row)=>sum+row.quantity,0);const remaining=Math.max(0,item.quantity-credited);return <label key={item.id} className="invoice-field"><span>{item.name} · {remaining} {item.unit} remaining</span><input type="number" inputMode="decimal" min="0" max={remaining} step="any" disabled={remaining===0} value={quantities[item.id]||""} placeholder="Quantity to credit" onChange={event=>setQuantities({...quantities,[item.id]:event.target.value})}/></label>;})}{records.invoice.document.shippingFee>0&&<label className="flex items-center gap-3 text-sm"><input type="checkbox" disabled={records.corrections.some(row=>row.includeShipping)} checked={shipping} onChange={event=>setShipping(event.target.checked)}/>Credit original shipping charge</label>}</>}
      {kind==="refund"&&<div className="invoice-fields"><label className="invoice-field"><span>Amount returned (₹)</span><input required type="number" min="0.01" step="0.01" inputMode="decimal" value={amount} onChange={event=>setAmount(event.target.value)}/></label><label className="invoice-field"><span>Payment method / transaction reference</span><input required maxLength={255} value={reference} onChange={event=>setReference(event.target.value)} placeholder="UPI / bank reference / cash receipt"/></label></div>}
      {kind==="cancel"&&<p className="text-sm text-amber-100/80">Unpaid invoices only. Cancellation creates a full credit note and locks the invoice.</p>}
      <button className="invoice-small-button" type="submit">Review {kind==="refund"?"refund":kind==="cancel"?"cancellation":"credit note"}</button></fieldset>
      {confirming&&preview&&<div role="alert" className="mt-4 rounded-xl border border-[#c4aeec]/30 p-4"><p className="font-semibold">Confirm {kind==="refund"?"refund record":kind==="cancel"?"cancellation":"credit note"}: {money(preview.amountMinor)}</p><p className="mt-2 text-sm text-white/60">{reason} · {date}</p><div className="mt-3 space-y-1 text-xs text-white/60">{preview.lines.map(line=><p key={line.itemId}>{line.description} · Qty {line.quantity} · Credit {money(line.grossMinor)} · Tax {money(line.cgstMinor+line.sgstMinor+line.igstMinor)}</p>)}</div><p className="mt-2 text-xs text-white/50">This creates a permanent accounting record.</p><div className="mt-4 flex flex-wrap gap-2"><button disabled={busy} type="button" className="invoice-small-button" onClick={()=>void commit()}>{busy?"Recording…":"Confirm and record"}</button><button disabled={busy} type="button" className="invoice-small-button" onClick={()=>setConfirming(false)}>Back to edit</button></div></div>}</form>}
      <div className="space-y-3"><h3 className="font-semibold">Credit notes, refunds & cancellations</h3>{records.corrections.map(row=><article key={row.id} className="invoice-card"><div className="flex flex-wrap justify-between gap-3"><p className="font-semibold">{row.number} · {row.kind==="cancel"?"Cancellation credit note":row.kind==="refund"?"Refund record":"Credit note"}</p><span>{money(row.amountMinor)}</span></div><p className="mt-2 text-xs text-white/50">{row.date} · {row.reason}</p>{row.reference&&<p className="mt-2 text-xs text-white/50">{row.reference}</p>}<a className="invoice-small-button mt-3" href={`/api/admin/invoices/corrections/${row.id}/pdf`} download>Download {row.kind==="refund"?"refund record":"credit note"} PDF</a></article>)}{!records.corrections.length&&<p className="text-sm text-white/45">No corrections recorded.</p>}</div>
    </>}
  </div></section>;
}
