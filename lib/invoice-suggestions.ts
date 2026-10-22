import type {InvoiceItem} from './invoice-document';
import {invoiceItemSchema} from './invoice-document';
export const customInvoiceSuggestionSchema=invoiceItemSchema.pick({name:true,category:true,unit:true,price:true}).extend({name:invoiceItemSchema.shape.name}).strict();
export function invoiceSuggestionKey(name:string,unit:string){return `${name.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase()}|${unit}`;}
export function savedInvoiceSuggestion(row:{id:string;name:string;category:string;unit:string;price:string|number;details?:Pick<InvoiceSuggestion,'gstPercent'|'hsnSac'|'priceMode'|'taxMode'>}):InvoiceSuggestion|null {
 // Explicit shape prevents database metadata from entering the saved suggestion.
 const value=customInvoiceSuggestionSchema.safeParse({name:row.name,category:row.category,unit:row.unit,price:Number(row.price)});
 if(!value.success)return null;
 return {...row.details,id:`custom-${row.id}`,name:value.data.name,search:value.data.name.toLowerCase(),price:value.data.price,category:value.data.category,unit:value.data.unit};
}
export type InvoiceSuggestion={gstPercent?:number;hsnSac?:string;priceMode?:'inclusive'|'exclusive';taxMode?:'auto'|'intra'|'inter'|'none';id:string;name:string;search:string;price:number|null;category:InvoiceItem['category'];unit:InvoiceItem['unit']};
export function invoiceSuggestions(products:Array<{id:string;name:string;price:string|number;category?:string;size?:string;inspiration?:string;priceCurrency?:string}>) {
 const catalogue:InvoiceSuggestion[]=products.filter(p=>!p.priceCurrency||p.priceCurrency==='INR').map(p=>{
  const category:InvoiceItem['category']=/machine|diffuser/i.test(p.category||'')?'machine':/oil/i.test(p.category||'')?'oil':/sample|discovery/i.test(p.category||'')?'sample':'perfume';
  const name=[p.name,p.size].filter(Boolean).join(' · ');const price=Number(p.price);
  return {id:p.id,name,search:`${name} ${p.inspiration||''} ${p.category||''}`.toLowerCase(),price:Number.isFinite(price)&&price>=0?price:null,category,unit:category==='sample'?'set':'pcs'};
 });
 const presets:InvoiceSuggestion[]=[
  ['oil','Fragrance oil','oil','ml'],['diffuser','Diffuser machine','machine','pcs'],
  ['400ml','400 mL diffuser machine','machine','pcs'],['800ml','800 mL diffuser machine','machine','pcs'],
  ['tower-200ml','200 mL tower diffuser','machine','pcs'],['tower-800ml','800 mL tower diffuser','machine','pcs'],
 ].map(([id,name,category,unit])=>({id:`preset-${id}`,name,search:name.toLowerCase(),price:null,category:category as InvoiceItem['category'],unit:unit as InvoiceItem['unit']}));
 return [...catalogue,...presets].sort((a,b)=>a.name.localeCompare(b.name));
}
