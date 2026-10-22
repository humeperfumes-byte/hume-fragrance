import {createHash,randomUUID} from "node:crypto";
import {eq,sql} from "drizzle-orm";
import {invoiceCustomers,invoiceItemSuggestions,invoiceReusableDefaults} from "@/db/schema";
import type {InvoiceTransaction} from "./invoice-management-store";
import type {InvoiceDocument} from "./invoice-document";
import {invoiceSuggestionKey} from "./invoice-suggestions";

export const normalizeCustomerText=(value:string)=>value.normalize("NFKC").trim().replace(/\s+/g," ").toLowerCase();
const phoneKey=(value:string)=>{const digits=value.replace(/\D/g,"");return digits.length===12&&digits.startsWith("91")?digits.slice(2):digits;};
type CustomerIdentity={name:string;address:string;email:string;phone:string;gstin:string};
export function sameInvoiceCustomer(a:CustomerIdentity,b:CustomerIdentity){
  const norm=normalizeCustomerText;
  if(a.gstin&&b.gstin)return norm(a.gstin)===norm(b.gstin);
  if(norm(a.name)!==norm(b.name))return false;
  if(a.email&&b.email&&norm(a.email)===norm(b.email))return true;
  if(a.phone&&b.phone&&phoneKey(a.phone)===phoneKey(b.phone))return true;
  if(a.email&&b.email&&norm(a.email)!==norm(b.email))return false;
  if(a.phone&&b.phone&&phoneKey(a.phone)!==phoneKey(b.phone))return false;
  return norm(a.address)===norm(b.address);
}
export function reusableDefaults(document:InvoiceDocument){
  const {sellerName,sellerAddress,sellerEmail,sellerPhone,sellerGstin,bankDetails,terms,priceMode,taxMode,sellerStateCode,shippingGstPercent,showPaymentAmounts,showPaymentStatus}=document;
  return {sellerName,sellerAddress,sellerEmail,sellerPhone,sellerGstin,bankDetails,terms,priceMode,taxMode,sellerStateCode,shippingGstPercent,showPaymentAmounts,showPaymentStatus};
}
export async function rememberInvoiceDetails(tx:InvoiceTransaction,document:InvoiceDocument){
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext('invoice-reusable-details'))`);
  const values={name:document.buyerName.trim(),address:document.buyerAddress.trim(),email:document.buyerEmail.trim(),phone:document.buyerPhone.trim(),gstin:document.buyerGstin.trim().toUpperCase()};
  let customer;
  if(document.customerId){[customer]=await tx.select().from(invoiceCustomers).where(eq(invoiceCustomers.id,document.customerId));if(!customer)throw new Error("Selected customer no longer exists");}
  else {
    // Candidate lookup is server-side; JS normalization handles spaces and country-code phone formats.
    const candidates=await tx.select().from(invoiceCustomers).where(sql`lower(regexp_replace(trim(${invoiceCustomers.name}),'[[:space:]]+',' ','g'))=${normalizeCustomerText(values.name)} or (${values.gstin}<>'' and lower(${invoiceCustomers.gstin})=${values.gstin.toLowerCase()})`).orderBy(invoiceCustomers.id);
    customer=candidates.find(candidate=>sameInvoiceCustomer(candidate,values));
  }
  if(customer){
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`customer-${customer.id}`}))`);
    const [latest]=await tx.select().from(invoiceCustomers).where(eq(invoiceCustomers.id,customer.id));
    const updates={name:values.name,address:values.address||latest.address,email:values.email||latest.email,phone:values.phone||latest.phone,gstin:values.gstin||latest.gstin,updatedAt:new Date(Math.max(Date.now(),latest.updatedAt.getTime()+1))};
    [customer]=await tx.update(invoiceCustomers).set(updates).where(eq(invoiceCustomers.id,customer.id)).returning();
  }else{[customer]=await tx.insert(invoiceCustomers).values({id:randomUUID(),...values}).returning();}
  const unique=new Map(document.items.map(item=>[invoiceSuggestionKey(item.name,item.unit),item]));
  // Stable ordering also prevents lock inversions with other batch writers.
  for(const [key,item] of [...unique].sort(([a],[b])=>a.localeCompare(b))){
    const id=createHash("sha256").update(key).digest("hex");
    const values={id,name:item.name.trim(),category:item.category,unit:item.unit,price:item.price.toFixed(2),details:{gstPercent:item.gstPercent,hsnSac:item.hsnSac,priceMode:document.priceMode||"inclusive",taxMode:document.taxMode||"auto"},updatedAt:new Date()};
    await tx.insert(invoiceItemSuggestions).values(values).onConflictDoUpdate({target:invoiceItemSuggestions.id,set:values});
  }
  await tx.insert(invoiceReusableDefaults).values({id:"business",document:reusableDefaults(document),updatedAt:new Date()}).onConflictDoUpdate({target:invoiceReusableDefaults.id,set:{document:reusableDefaults(document),updatedAt:new Date()}});
  return {...document,customerId:customer.id};
}
