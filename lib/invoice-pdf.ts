import PDFDocument from 'pdfkit';
import path from 'node:path';
import type {InvoiceDocument} from './invoice-document';
import {calculateInvoice} from './invoice-calculations';

/** The A4 export follows the workspace preview's header, table and two-column footer. */
export async function renderInvoicePdf(data:InvoiceDocument):Promise<Buffer> {
 const fontPath=(name:string)=>path.join(process.cwd(),'public/fonts',name);
 const pdf=new PDFDocument({size:'A4',margin:36,bufferPages:true,font:fontPath('NotoSans-Regular.ttf'),info:{Title:`${data.invoiceNumber} - ${data.buyerName}`,Author:'HUME Fragrance'}});
 const chunks:Buffer[]=[];
 const result=new Promise<Buffer>((resolve,reject)=>{pdf.on('data',chunk=>chunks.push(chunk));pdf.on('end',()=>resolve(Buffer.concat(chunks)));pdf.on('error',reject);});
 pdf.registerFont('Latin',fontPath('NotoSans-Regular.ttf'));
 pdf.registerFont('Bold',fontPath('NotoSans-Bold.ttf'));
 pdf.registerFont('Hindi',fontPath('NotoSansDevanagari-Regular.ttf'));
 const left=36,right=559,width=523,bottom=785;
 const totals=calculateInvoice(data);
 const noGst=data.taxMode==='none';
 const runs=(value:string)=>value.match(/[\u0900-\u097f]+|[^\u0900-\u097f]+/g)||[];
 const selectFont=(value:string,bold=false)=>pdf.font(/[\u0900-\u097f]/.test(value)?'Hindi':bold?'Bold':'Latin');
 function height(value:string,size:number,w:number,bold=false) {
  if(!/[\u0900-\u097f]/.test(value))return pdf.font(bold?'Bold':'Latin').fontSize(size).heightOfString(value,{width:w,lineGap:2});
  let lines=1,current=0;
  for(const word of value.split(/(\s+|\n)/)){
   if(word==='\n'){lines++;current=0;continue;}
   let span=0;for(const run of runs(word)){selectFont(run,bold).fontSize(size);span+=pdf.widthOfString(run);}
   if(current+span>w&&current>0){lines++;current=0;}current+=span;
   while(current>w){lines++;current-=w;}
  }
  return lines*Math.max(pdf.font('Latin').fontSize(size).currentLineHeight(true)+2,pdf.font('Hindi').fontSize(size).currentLineHeight(true)+2);
 }
 function text(value:string,x:number,y:number,w:number,size=10,color='#222',bold=false,align:'left'|'right'|'center'='left') {
  if(!value)return;
  const parts=runs(value);
  parts.forEach((run,index)=>{selectFont(run,bold).fontSize(size).fillColor(color);const options={width:w,lineGap:2,align,continued:index<parts.length-1};if(index===0)pdf.text(run,x,y,options);else pdf.text(run,options);});
 }
 const money=(value:number)=>`₹${value.toFixed(2)}`;
 const rule=(y:number,color='#e5e5e5')=>pdf.moveTo(left,y).lineTo(right,y).lineWidth(.6).strokeColor(color).stroke();
 let y=36,tableMode=false;
 function page(){pdf.addPage();y=64;if(tableMode)tableHeading();}
 function need(h:number){if(y+h>bottom)page();}
 function tableHeading(){
  const labels=['#','ITEM DESCRIPTION','PRICE','QTY',noGst?'':'GST %','AMOUNT'];
  const xs=[36,60,331,391,433,475],ws=[18,265,60,42,42,84];
  labels.forEach((label,index)=>text(label,xs[index],y,ws[index],7.5,'#777',true,index===2||index===5?'right':index===3||index===4?'center':'left'));
  y+=25;rule(y,'#d6d6d6');y+=9;
 }
 try {
  pdf.image(path.join(process.cwd(),'public/images/logo/invoice-hume-black.png'),left,y,{fit:[117,48]});
  text('HUME FRAGRANCE',left,94,265,10.5,'#111',true);
  let sellerY=122;
  for(const value of [data.sellerAddress, data.sellerEmail?`Email: ${data.sellerEmail}`:'',data.sellerPhone?`Phone: ${data.sellerPhone}`:'',!noGst&&data.sellerGstin?`GSTIN: ${data.sellerGstin}`:'']){
   if(!value)continue;text(value,left,sellerY,240,9.5,'#444');sellerY+=height(value,9.5,240)+3;
  }
  pdf.rect(465,36,94,24).fill('#111');text('INVOICE',465,41,94,9,'#fff',true,'center');
  text('INVOICE NO',374,96,185,8,'#777',true,'right');
  text(data.invoiceNumber,344,113,215,11,'#111',true,'right');
  const numberHeight=height(data.invoiceNumber,11,215,true);
  text('DATE',374,121+numberHeight,185,8,'#777',true,'right');
  const date=new Date(`${data.invoiceDate}T00:00:00Z`).toLocaleDateString('en-IN',{timeZone:'Asia/Kolkata'});
  text(date,374,138+numberHeight,185,10,'#111',true,'right');
  y=Math.max(sellerY,158+numberHeight)+22;rule(y);y+=25;
  text(data.separateShipping?'BILLED TO:':'BILLED & SHIPPING TO:',left,y,270,8,'#777',true);
  const billingTop=y;let buyerY=y+20;
  text(data.buyerName,left,buyerY,270,12,'#111',true);buyerY+=height(data.buyerName,12,270,true)+4;
  for(const value of [data.buyerAddress,data.buyerEmail?`Email: ${data.buyerEmail}`:'',data.buyerPhone?`Phone: ${data.buyerPhone}`:'',!noGst&&data.placeOfSupply?`Place of supply: ${data.placeOfSupply} (${data.placeOfSupplyCode||'not set'})`:'',!noGst&&data.buyerGstin?`GSTIN: ${data.buyerGstin}`:'']){
   if(!value)continue;text(value,left,buyerY,270,9.5,'#444');buyerY+=height(value,9.5,270)+3;
  }
  let shippingY=billingTop;
  if(data.separateShipping){
   text('SHIPPING TO:',349,shippingY,210,8,'#777',true);shippingY+=20;
   for(const [value,size,bold] of [[data.shippingName||'',12,true],[data.shippingAddress||'',9.5,false],[data.shippingPhone?`Phone: ${data.shippingPhone}`:'',9.5,false]] as const){
    if(!value)continue;text(value,349,shippingY,210,size,'#444',bold);shippingY+=height(value,size,210,bold)+4;
   }
   shippingY+=8;
  }
  if(data.showPaymentStatus){text('PAYMENT DETAILS',349,shippingY,210,8,'#777',true,'right');text(`Status: ${data.paymentStatus}`,349,shippingY+21,210,10,data.paymentStatus==='Paid'?'#047857':data.paymentStatus==='Unpaid'?'#be123c':'#a16207',true,'right');shippingY+=42;}
  y=Math.max(buyerY,shippingY)+12;
  const legend=data.taxMode==='none'?'No GST charged.':data.priceMode==='exclusive'?'Unit prices exclude GST; line totals include GST.':'Unit prices and line totals include GST.';
  if(!noGst){text(legend,left,y,width,8,'#777');y+=22;}
  need(85);tableMode=true;tableHeading();
  totals.lines.forEach((line,index)=>{
   const nameHeight=height(line.name,10.5,265,true);
   const details=noGst?[]:[line.hsnSac?`HSN/SAC: ${line.hsnSac}`:'',`Taxable: ${money(line.taxable)}${line.discount?` · Discount: ${money(line.discount)}`:''}`].filter(Boolean);
   const detailsHeight=details.reduce((sum,value)=>sum+height(value,7.5,265)+2,0);
   const rowHeight=Math.max(49,nameHeight+detailsHeight+19);
   need(rowHeight);
   text(String(index+1),36,y,18,9,'#888');text(line.name,60,y,265,10.5,'#111',true);
   let detailY=y+nameHeight+3;for(const detail of details){text(detail,60,detailY,265,7.5,'#777');detailY+=height(detail,7.5,265)+2;}
   text(money(line.price),331,y,60,9.5,'#333',false,'right');text(String(line.quantity),391,y,42,9.5,'#333',false,'center');text(line.unit,391,y+17,42,7.5,'#888',false,'center');if(!noGst)text(`${line.rate}%`,433,y,42,9.5,'#666',false,'center');text(money(line.gross),475,y,84,10,'#111',true,'right');
   y+=rowHeight;rule(y,'#eeeeee');y+=12;
  });
  tableMode=false;y+=9;
  const summary:Array<[string,number,boolean?]>=[[noGst?'Subtotal':'Taxable value',totals.itemSubtotal]];
  if(totals.totalGst>0){if(totals.taxKind==='split')summary.push(['CGST',totals.cgst],['SGST',totals.sgst]);else if(totals.taxKind==='igst')summary.push(['IGST',totals.igst]);}
  if(data.shippingFee>0)summary.push([noGst?'Shipping':'Shipping (excl. GST)',totals.shippingTaxable]);
  if(totals.discountAmount>0)summary.push(['Discount included',totals.discountAmount]);
  summary.push(['Grand Total',totals.grandTotal,true]);
  if(data.showPaymentAmounts)summary.push(['Amount recorded received',totals.amountReceived],['Balance due',totals.balanceDue,true]);
  const summaryHeight=summary.reduce((sum,[label,,strong])=>sum+Math.max(strong?34:24,height(label,strong?10:8.5,130,strong)+9),0);
  need(Math.max(110,summaryHeight+35));rule(y);y+=20;
  const footerTop=y;let summaryY=y;
  for(const [label,value,strong] of summary){if(strong){pdf.moveTo(349,summaryY-7).lineTo(right,summaryY-7).strokeColor('#dddddd').stroke();summaryY+=5;}text(label,349,summaryY,130,strong?10:8.5,'#444',!!strong);text(`${label.startsWith('Shipping')?'+':''}${money(value)}`,479,summaryY,80,strong?11:9,'#111',!!strong,'right');summaryY+=Math.max(strong?34:24,height(label,strong?10:8.5,130,strong)+9);}
  // Notes, terms and bank details share the preview's left column, below the table.
  let footerY=footerTop;
  for(const [label,value] of [['Notes',data.notes],['Terms & Conditions',data.terms],['Bank Details',data.bankDetails]]){
   if(!value.trim())continue;
   if(footerY+40>bottom){y=Math.max(summaryY,footerY);page();footerY=y;}
   text(label.toUpperCase(),left,footerY,270,7.5,'#777',true);footerY+=18;
   for(const paragraph of value.split('\n')){
    const words=paragraph.split(/\s+/);for(let i=0;i<words.length;i+=35){const part=words.slice(i,i+35).join(' ');const h=height(part,8.5,270);if(footerY+h>bottom){page();footerY=y;}text(part,left,footerY,270,8.5,'#666');footerY+=h+4;}
   }
   footerY+=13;
  }
  const range=pdf.bufferedPageRange();for(let i=0;i<range.count;i++){pdf.switchToPage(i);pdf.page.margins.bottom=0;if(i>0)text(`HUME FRAGRANCE  ·  ${data.invoiceNumber}`,left,36,width,8,'#777');text(`${data.invoiceNumber}  |  ${i+1} / ${range.count}`,left,808,width,7.5,'#999',false,'right');}
  pdf.end();return await result;
 }catch(error){pdf.end();await result.catch(()=>undefined);throw error;}
}
