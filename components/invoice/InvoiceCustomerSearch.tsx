"use client";
import type { InvoiceDocument } from "@/lib/invoice-document";
import { CustomerPicker } from "./CustomerPicker";
export function InvoiceCustomerSearch({value,onChange,onSelect}:{value:string;onChange:(value:string)=>void;onSelect:(customer:Partial<InvoiceDocument>)=>void}) {
  return <div className="sm:col-span-2"><CustomerPicker value={value} onChange={onChange} onSelect={customer=>onSelect({customerId:customer.id,buyerName:customer.name,buyerAddress:customer.address,buyerEmail:customer.email,buyerPhone:customer.phone,buyerAlternativePhone:undefined,buyerGstin:customer.gstin})}/></div>;
}
