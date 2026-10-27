import type { InvoiceDocument } from './invoice-document';
const minor=(value:number)=>Math.round(value*100);
export function financialYear(date:string) {const [year,month]=date.split('-').map(Number);const first=month<4?year-1:year;return `${first}-${String(first+1).slice(-2)}`;}
export function issuedNumber(year:string, sequence:number) {if(sequence<1||sequence>999999)throw new Error('Invoice sequence is exhausted');return `HF/${year.slice(2,4)}${year.slice(-2)}/${String(sequence).padStart(6,'0')}`;}
export function calculateInvoice(data:InvoiceDocument) {
  const taxMode=data.taxMode??'auto';const taxKind=taxMode==='none'?'none':taxMode==='inter'||taxMode==='auto'&&!!data.placeOfSupplyCode&&data.placeOfSupplyCode!==(data.sellerStateCode||'09')?'igst':'split';
  const inclusive=data.priceMode!=='exclusive';
  const source=data.items.map(item=>{const amount=minor(item.price*item.quantity),rate=taxKind==='none'?0:item.gstPercent;return {item,rate,gross:inclusive?amount:amount+Math.round(amount*rate/100)};});
  const shippingRate=taxKind==='none'?0:data.shippingGstPercent??0;
  const shippingInput=minor(data.shippingFee);const shippingGross=inclusive?shippingInput:shippingInput+Math.round(shippingInput*shippingRate/100);
  const itemGross=source.reduce((sum,line)=>sum+line.gross,0),rawTotal=itemGross+shippingGross;
  const hasTarget=data.targetGrandTotal.trim()!=='';const target=hasTarget?minor(Number(data.targetGrandTotal)):rawTotal;
  const errors:string[]=[];
  if(hasTarget&&(!Number.isFinite(target)||target<shippingGross||target>rawTotal))errors.push('Target total must be between the shipping charge (including its tax) and the undiscounted total.');
  const discount=Math.min(itemGross,Math.max(0,rawTotal-(Number.isFinite(target)?target:rawTotal)));
  const allocation=source.map((line,index)=>({index,share:itemGross?discount*line.gross/itemGross:0}));
  const assigned=allocation.map(row=>Math.floor(row.share));let remaining=discount-assigned.reduce((a,b)=>a+b,0);
  for(const row of [...allocation].sort((a,b)=>(b.share-Math.floor(b.share))-(a.share-Math.floor(a.share)))){if(remaining<=0)break;if(source[row.index].gross>0){assigned[row.index]++;remaining--;}}
  const lines=source.map((line,index)=>{const gross=line.gross-assigned[index];const taxable=Math.round(gross/(1+line.rate/100));const tax=gross-taxable;const cgst=taxKind==='split'?Math.floor(tax/2):0;return {...line.item,rate:line.rate,discount:assigned[index]/100,gross:gross/100,taxable:taxable/100,tax:tax/100,cgst:cgst/100,sgst:taxKind==='split'?(tax-cgst)/100:0,igst:taxKind==='igst'?tax/100:0};});
  const shippingTaxable=Math.round(shippingGross/(1+shippingRate/100));const shippingTax=shippingGross-shippingTaxable;
  const taxableMinor=lines.reduce((sum,line)=>sum+minor(line.taxable),0)+shippingTaxable;
  const taxMinor=lines.reduce((sum,line)=>sum+minor(line.tax),0)+shippingTax;
  const cgstMinor=lines.reduce((sum,line)=>sum+minor(line.cgst),0)+(taxKind==='split'?Math.floor(shippingTax/2):0);
  const sgstMinor=taxKind==='split'?taxMinor-cgstMinor:0;
  const grandTotal=(taxableMinor+taxMinor)/100;
  const received=minor(data.amountReceived??0);if(received>minor(grandTotal))errors.push('Amount received cannot exceed the invoice total.');
  return {lines,taxKind,itemSubtotal:(taxableMinor-shippingTaxable)/100,subtotal:taxableMinor/100,totalGst:taxMinor/100,cgst:cgstMinor/100,sgst:sgstMinor/100,igst:taxKind==='igst'?taxMinor/100:0,shippingGross:shippingGross/100,shippingTax:shippingTax/100,shippingTaxable:shippingTaxable/100,discountAmount:discount/100,discountPercent:itemGross?discount/itemGross*100:0,rawSubtotalInclusive:itemGross/100,grandTotal,amountReceived:received/100,balanceDue:Math.max(0,minor(grandTotal)-received)/100,errors};
}
export function validateForIssue(data:InvoiceDocument) {
  const errors=[...calculateInvoice(data).errors];
  if(!data.sellerAddress.trim()||!data.buyerAddress.trim())errors.push('Seller and buyer addresses are required before issue.');
  if(data.taxMode!=='none'&&(!data.placeOfSupplyCode||!data.placeOfSupply?.trim()))errors.push('Enter place of supply and its two-digit state code.');
  const gstin=/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
  if(data.taxMode!=='none') {
    if(!gstin.test(data.sellerGstin.toUpperCase()))errors.push('Enter the registered seller GSTIN, or choose No GST.');
    if(data.sellerGstin.slice(0,2)!==(data.sellerStateCode||'09'))errors.push('Seller GSTIN state code must match the seller state.');
    if(data.items.some(item=>!item.hsnSac))errors.push('Enter an HSN/SAC for every item before issuing a GST invoice.');
    if(data.shippingFee>0&&data.shippingGstPercent==null)errors.push('Choose the reviewed GST rate for shipping, including 0% where applicable.');
  }
  if(data.taxMode!=='none'&&data.buyerGstin&&!gstin.test(data.buyerGstin.toUpperCase()))errors.push('Buyer GSTIN format is invalid.');
  if(data.taxMode==='intra'&&data.placeOfSupplyCode!==(data.sellerStateCode||'09'))errors.push('Intra-state GST requires matching seller and supply states.');
  if(data.taxMode==='inter'&&data.placeOfSupplyCode===(data.sellerStateCode||'09'))errors.push('Inter-state GST requires different seller and supply states.');
  return errors;
}
