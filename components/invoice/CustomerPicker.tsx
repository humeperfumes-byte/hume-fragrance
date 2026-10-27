"use client";
import { useEffect, useState } from "react";
import type { InvoiceCustomer } from "@/lib/invoice-ledger";

export function CustomerPicker({onSelect,value,onChange}:{onSelect:(customer:InvoiceCustomer)=>void;value?:string;onChange?:(value:string)=>void}) {
  const [search,setSearch]=useState("");const query=value??search;const [customers,setCustomers]=useState<InvoiceCustomer[]>([]);
  const [active,setActive]=useState(false);const [status,setStatus]=useState("");
  useEffect(()=>{
    if(!active)return;
    const controller=new AbortController();
    const timer=setTimeout(async()=>{
      setStatus("Searching directory…");
      try{
        const response=await fetch(`/api/admin/invoices/customers?q=${encodeURIComponent(query)}&pageSize=8`,{cache:"no-store",signal:controller.signal});
        const data=await response.json();if(!response.ok)throw new Error(data.error);
        setCustomers(data.customers);setStatus(data.customers.length?"":onChange?"New customer - continue entering billing details below.":"No matching customer. Create one in Customers.");
      }catch(error){if(!controller.signal.aborted)setStatus(error instanceof Error?error.message:"Customer search unavailable");}
    },250);
    return()=>{clearTimeout(timer);controller.abort();};
  },[query,active,onChange]);
  return <div className="space-y-2"><label className="invoice-field"><span>{onChange?"Customer or business name":"Search customer directory"}</span><input data-invoice-path={onChange?"buyerName":undefined} value={query} onFocus={()=>setActive(true)} onChange={event=>{if(onChange)onChange(event.target.value);else setSearch(event.target.value);setCustomers([]);setActive(true);}} placeholder={onChange?"Enter a new name or search by name, email, phone or GSTIN":"Name, email, phone or GSTIN"} autoComplete="off" /></label>{active&&<><p role="status" className="text-xs text-white/50">{status}</p>{customers.map(customer=><button key={customer.id} type="button" className="invoice-small-button w-full justify-start text-left" onClick={()=>{onSelect(customer);setActive(false);setSearch("");}}>{customer.name} · {customer.phone||customer.email||customer.gstin||"Customer"}</button>)}<button type="button" className="text-xs text-white/50 underline" onClick={()=>setActive(false)}>Close results</button></>}</div>;
}
