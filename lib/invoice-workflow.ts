import { invoiceDocumentSchema, type InvoiceDocument } from './invoice-document';
import { validateForIssue } from './invoice-calculations';
export type InvoiceIssue = {path:string;message:string};
export const invoiceDefaultsSchema=invoiceDocumentSchema.pick({sellerName:true,sellerAddress:true,sellerEmail:true,sellerPhone:true,sellerGstin:true,bankDetails:true,terms:true,priceMode:true,taxMode:true,sellerStateCode:true,shippingGstPercent:true,showPaymentAmounts:true,showPaymentStatus:true});
export function invoiceDefaults(document:InvoiceDocument){return invoiceDefaultsSchema.strip().parse(document);}
export function invoiceCompletionIssues(document:InvoiceDocument):InvoiceIssue[]{
 const parsed=invoiceDocumentSchema.safeParse(document);
 const issues:InvoiceIssue[]=parsed.success?[]:parsed.error.issues.map(issue=>({path:issue.path.join('.'),message:issue.message}));
 if(!document.sellerAddress.trim())issues.push({path:'sellerAddress',message:'Enter your business address.'});
 if(!document.buyerAddress.trim())issues.push({path:'buyerAddress',message:'Enter the billing address.'});
 if(document.separateShipping){if(!document.shippingName?.trim())issues.push({path:'shippingName',message:'Enter the shipping recipient.'});if(!document.shippingAddress?.trim())issues.push({path:'shippingAddress',message:'Enter the shipping address.'});}
 if(document.taxMode!=='none'){
  if(!document.placeOfSupplyCode)issues.push({path:'placeOfSupplyCode',message:'Enter the two-digit supply state code.'});
  if(!document.placeOfSupply?.trim())issues.push({path:'placeOfSupply',message:'Enter the supply state.'});
  document.items.forEach((item,index)=>{if(!item.hsnSac)issues.push({path:`items.${index}.hsnSac`,message:'Enter HSN / SAC for this item.'});});
 }
 if(parsed.success)for(const message of validateForIssue(parsed.data)){
  if(message.startsWith('Seller and buyer')||message.startsWith('Enter place of supply')||message.startsWith('Enter an HSN'))continue;
  const path=message.includes('Target total')?'targetGrandTotal':message.includes('Amount received')?'amountReceived':message.includes('shipping')?'shippingGstPercent':message.toLowerCase().includes('buyer gstin')?'buyerGstin':message.includes('seller GSTIN')||message.includes('Seller GSTIN')?'sellerGstin':'placeOfSupplyCode';
  issues.push({path,message});
 }
 return [...new Map(issues.map(issue=>[issue.path,issue])).values()];
}
