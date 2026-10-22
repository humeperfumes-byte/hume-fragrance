"use client";
import { useEffect, useRef, useState } from "react";
import type { InvoiceCustomer } from "@/lib/invoice-ledger";
import { formatINR } from "@/lib/currency";
import type { SavedInvoice } from "@/lib/invoice-document";

type Statement = {
  customer:InvoiceCustomer; page:number;pageSize:number;total:number;
  totals:{invoicedMinor:number;creditedMinor:number;receivedMinor:number;refundedMinor:number;balanceMinor:number|null;unknownPayments:number};
  rows:{id:string;number:string;date:string;lifecycle:string;cancelled:boolean;totalMinor:number;creditMinor:number;receivedMinor:number;refundMinor:number;balanceMinor:number|null;customerCreditMinor:number|null;paymentKnown:boolean}[];
};
const empty={name:"",address:"",email:"",phone:"",gstin:""};
const money=(minor:number|null)=>minor===null?"Unknown":formatINR(minor/100);
export function CustomerDirectory({onClose,onOpen}:{onClose:()=>void;onOpen:(invoice:SavedInvoice)=>void}) {
  const createId=useRef<string|null>(null);
  const [query,setQuery]=useState("");const [page,setPage]=useState(1);
  const [customers,setCustomers]=useState<InvoiceCustomer[]>([]);const [total,setTotal]=useState(0);const [unlinked,setUnlinked]=useState(0);
  const [error,setError]=useState("");const [loading,setLoading]=useState(false);const [version,setVersion]=useState(0);
  const [editing,setEditing]=useState<InvoiceCustomer|null>(null);const [form,setForm]=useState(empty);const [formOpen,setFormOpen]=useState(false);const [saving,setSaving]=useState(false);
  const [selected,setSelected]=useState<string|null>(null);const [statement,setStatement]=useState<Statement|null>(null);const [statementPage,setStatementPage]=useState(1);
  useEffect(()=>{
    const controller=new AbortController();setLoading(true);setError("");
    const timer=setTimeout(async()=>{try{const response=await fetch(`/api/admin/invoices/customers?q=${encodeURIComponent(query)}&page=${page}`,{cache:"no-store",signal:controller.signal});const data=await response.json();if(!response.ok)throw new Error(data.error);setCustomers(data.customers);setTotal(data.total);setUnlinked(data.unlinked);}catch(error){if(!controller.signal.aborted)setError(error instanceof Error?error.message:"Directory unavailable");}finally{if(!controller.signal.aborted)setLoading(false);}},250);
    return()=>{clearTimeout(timer);controller.abort();};
  },[query,page,version]);
  useEffect(()=>{
    if(!selected)return;const controller=new AbortController();setStatement(null);setError("");
    fetch(`/api/admin/invoices/customers/${selected}?page=${statementPage}`,{cache:"no-store",signal:controller.signal}).then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data.error);setStatement(data);}).catch(error=>{if(!controller.signal.aborted)setError(error.message);});return()=>controller.abort();
  },[selected,statementPage,version]);
  async function save(){
    setSaving(true);setError("");
    try{const response=await fetch("/api/admin/invoices/customers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,id:editing?.id||(createId.current ||= crypto.randomUUID()),expectedUpdatedAt:editing?.updatedAt}),signal:AbortSignal.timeout(15000)});const data=await response.json();if(!response.ok)throw new Error(data.error);setFormOpen(false);setEditing(null);setVersion(value=>value+1);}catch(error){setError(error instanceof Error?error.message:"Could not save customer");}finally{setSaving(false);}
  }
  async function openInvoice(id:string){try{const response=await fetch(`/api/admin/invoices?invoiceId=${id}`,{cache:"no-store"});const data=await response.json();if(!response.ok)throw new Error(data.error);onOpen(data.invoice);}catch(error){setError(error instanceof Error?error.message:"Could not open invoice");}}
  return <section aria-label="Customer directory" className="invoice-controls border-b border-white/10 bg-[#12141b] p-5 print:hidden sm:p-7"><div className="mx-auto max-w-6xl space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Customers</h2></div><div className="flex gap-2"><button className="invoice-small-button" onClick={()=>{setEditing(null);createId.current=crypto.randomUUID();setForm(empty);setFormOpen(true);}}>+ New customer</button><button className="invoice-small-button" onClick={onClose}>Close</button></div></div>
    {error&&<p role="alert" className="text-sm text-amber-200">{error} <button className="underline" onClick={()=>setVersion(value=>value+1)}>Reload</button></p>}
    {unlinked>0&&<p className="text-xs text-amber-100/75">{unlinked} unlinked invoice{unlinked===1?"":"s"} · excluded from statements.</p>}
    {formOpen&&<form className="invoice-card" onSubmit={event=>{event.preventDefault();void save();}}><h3 className="mb-4 font-semibold">{editing?"Edit customer":"New customer"}</h3><fieldset disabled={saving} className="invoice-fields">{(["name","address","email","phone","gstin"] as const).map(key=><label key={key} className={`invoice-field ${key==="address"?"sm:col-span-2":""}`}><span>{({name:"Customer / business name",address:"Billing address",email:"Email",phone:"Phone",gstin:"GSTIN (optional)"})[key]}</span>{key==="address"?<textarea value={form[key]} onChange={event=>setForm({...form,[key]:event.target.value})}/>:<input required={key==="name"} type={key==="email"?"email":key==="phone"?"tel":"text"} value={form[key]} onChange={event=>setForm({...form,[key]:event.target.value})}/>}</label>)}<div className="flex gap-2"><button type="submit" className="invoice-small-button">{saving?"Saving…":"Save customer"}</button><button type="button" className="invoice-small-button" onClick={()=>setFormOpen(false)}>Cancel</button></div></fieldset></form>}
    <label className="invoice-field"><span>Search all customers</span><input value={query} placeholder="Name, phone, email or GSTIN" onChange={event=>{setQuery(event.target.value);setPage(1);}}/></label>
    {loading?<p role="status" className="text-sm text-white/50">Loading customers…</p>:<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{customers.map(customer=><article key={customer.id} className="invoice-card min-w-0"><h3 className="break-words font-semibold">{customer.name}</h3><p className="mt-2 break-words text-xs text-white/50">{customer.email||customer.phone||customer.gstin||"No contact details"}</p><div className="mt-4 flex flex-wrap gap-2"><button className="invoice-small-button" onClick={()=>{setSelected(customer.id);setStatementPage(1);}}>Statement & balance</button><button className="invoice-small-button" onClick={()=>{setEditing(customer);setForm({name:customer.name,address:customer.address,email:customer.email,phone:customer.phone,gstin:customer.gstin});setFormOpen(true);}}>Edit</button></div></article>)}{!customers.length&&<p className="text-sm text-white/50">No customers found.</p>}</div>}
    <div className="flex items-center gap-3 text-xs text-white/50"><button className="invoice-small-button" disabled={loading||page===1} onClick={()=>setPage(page-1)}>Previous</button><span>Page {page} · {total} customers</span><button className="invoice-small-button" disabled={loading||page*25>=total} onClick={()=>setPage(page+1)}>Next</button></div>
    {selected&&<div className="invoice-card space-y-4" role="region" aria-label="Customer statement">{statement?<><div className="flex flex-wrap justify-between gap-3"><h3 className="font-semibold">{statement.customer.name} · Statement</h3><a className="invoice-small-button" href={`/api/admin/invoices/customers/${selected}?format=csv`} download>Download full statement CSV</a><button className="invoice-small-button" onClick={()=>setSelected(null)}>Close statement</button></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[["Invoiced",statement.totals.invoicedMinor],["Credited",statement.totals.creditedMinor],["Received",statement.totals.receivedMinor],["Refunded",statement.totals.refundedMinor],["Net balance",statement.totals.balanceMinor]].map(([label,value])=><div key={String(label)}><p className="text-xs text-white/45">{label}</p><p className="mt-1 font-semibold">{money(value as number|null)}</p></div>)}</div>
      {statement.totals.unknownPayments>0&&<p className="text-sm text-amber-200">{statement.totals.unknownPayments} invoice(s) have a payment label without an actual received amount. Record their amounts before relying on the customer balance.</p>}

      <div className="space-y-3">{statement.rows.map(row=><div key={row.id} className="rounded-xl border border-white/10 p-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><button className="break-all text-left text-[#c4aeec] underline" onClick={()=>void openInvoice(row.id)}>{row.number}</button><span>{row.date} · {row.cancelled?"Cancelled":row.lifecycle}</span></div><p className="mt-2 text-xs text-white/55">Total {money(row.totalMinor)} · Credits {money(row.creditMinor)} · Refunds {money(row.refundMinor)}</p><p className="mt-2">{row.lifecycle==="draft"?"Draft — excluded from balance":row.customerCreditMinor?`Customer credit ${money(row.customerCreditMinor)}`:`Balance due ${money(row.balanceMinor)}`}</p></div>)}</div>
      <div className="flex gap-3"><button className="invoice-small-button" disabled={statementPage===1} onClick={()=>setStatementPage(statementPage-1)}>Previous</button><span className="self-center text-xs">Page {statementPage} · {statement.total} documents</span><button className="invoice-small-button" disabled={statementPage*25>=statement.total} onClick={()=>setStatementPage(statementPage+1)}>Next</button></div>
    </>:<p role="status" className="text-sm text-white/50">Loading statement…</p>}</div>}
  </div></section>;
}
