import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { checkAdminToken } from "@/lib/admin-auth";
import InvoiceWorkspace from "@/components/invoice/InvoiceWorkspace";
import {db} from '@/db';
import {products,invoiceItemSuggestions} from '@/db/schema';
import {invoiceSuggestions,savedInvoiceSuggestion} from '@/lib/invoice-suggestions';
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Invoice workspace | HUME", robots: { index: false, follow: false } };
export default async function InvoicePage() {
  if (!await checkAdminToken()) redirect("/admin/login");
  let suggestions=invoiceSuggestions([]);
  try{const catalogue=await db.select({id:products.id,name:products.name,price:products.price,priceCurrency:products.priceCurrency,category:products.category,size:products.size,inspiration:products.inspiration}).from(products);suggestions=invoiceSuggestions(catalogue);}catch{console.error('Invoice product suggestions unavailable');}
  try{const custom=await db.select().from(invoiceItemSuggestions).limit(1000);suggestions.push(...custom.map(savedInvoiceSuggestion).filter((item):item is NonNullable<typeof item>=>item!==null));}catch{console.error('Saved invoice item suggestions unavailable');}
  return <InvoiceWorkspace suggestions={suggestions}/>;
}
