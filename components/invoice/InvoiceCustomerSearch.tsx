"use client";
import type { InvoiceDocument } from "@/lib/invoice-document";
import { CustomerPicker } from "./CustomerPicker";
export function InvoiceCustomerSearch({onSelect}:{onSelect:(customer:Partial<InvoiceDocument>)=>void}) {
  return <div className="mb-5"><CustomerPicker onSelect={customer=>onSelect({customerId:customer.id,buyerName:customer.name,buyerAddress:customer.address,buyerEmail:customer.email,buyerPhone:customer.phone,buyerGstin:customer.gstin})}/></div>;
}
