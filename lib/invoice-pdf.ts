import PDFDocument from 'pdfkit';
import path from 'node:path';
import type {InvoiceDocument} from './invoice-document';
import {calculateInvoice} from './invoice-calculations';
export async function renderInvoicePdf(data:InvoiceDocument):Promise<Buffer>{
 const pdf=new PDFDocument({size:'A4',margin:38,bufferPages:true,font:path.join(process.cwd(),'public/fonts/NotoSans-Regular.ttf'),info:{Title:`${data.invoiceNumber} - ${data.buyerName}`,Author:'HUME Fragrance'}});
 const chunks:Buffer[]=[];const result=new Promise<Buffer>((resolve,reject)=>{pdf.on('data',chunk=>chunks.push(chunk));pdf.on('end',()=>resolve(Buffer.concat(chunks)));pdf.on('error',reject);});
 pdf.registerFont('Latin',path.join(process.cwd(),'public/fonts/NotoSans-Regular.ttf'));pdf.registerFont('Hindi',path.join(process.cwd(),'public/fonts/NotoSansDevanagari-Regular.ttf'));
 const runs=(value:string)=>value.match(/[\u0900-\u097f]+|[^\u0900-\u097f]+/g)||[];
 const selectFont=(value:string)=>pdf.font(/[\u0900-\u097f]/.test(value)?'Hindi':'Latin');
 const mixedHeight=(value:string,size:number,width:number)=>{let lines=1,current=0;for(const word of value.split(/(\s+)/)){let span=0;for(const run of runs(word)){selectFont(run).fontSize(size);span+=pdf.widthOfString(run);}if(current+span>width&&current>0){lines++;current=0;}current+=span;}return lines*Math.max(pdf.font('Latin').fontSize(size).currentLineHeight(true),pdf.font('Hindi').fontSize(size).currentLineHeight(true));};
 const mixedText=(value:string,x:number,y:number,width:number,size:number,color:string)=>{const parts=runs(value);parts.forEach((run,index)=>{selectFont(run).fontSize(size).fillColor(color);const options={width,continued:index<parts.length-1};if(index===0)pdf.text(run,x,y,options);else pdf.text(run,options);});};
 const money=(n:number)=>`INR ${n.toFixed(2)}`;const left=38,width=519,bottom=785;
 const totals=calculateInvoice(data);let y=38;let tableMode=false;
 function page(){pdf.addPage();y=38;pdf.font('Latin').fontSize(8).fillColor('#777').text(`HUME Fragrance | ${data.invoiceNumber} | continued`,left,y,{width});y+=25;if(tableMode)heading();}
 function need(height:number){if(y+height>bottom)page();}
 function text(value:string,size=9,color='#333',space=5){if(!value.trim())return;const paragraphs=value.split('\n');for(const paragraph of paragraphs){const words=paragraph.split(/\s+/);for(let i=0;i<words.length;i+=55){const part=words.slice(i,i+55).join(' ');const height=mixedHeight(part,size,width);need(height+space);mixedText(part,left,y,width,size,color);y+=height+space;}}}
 function label(value:string){need(25);pdf.font('Latin').fontSize(8).fillColor('#777').text(value.toUpperCase(),left,y,{width});y+=16;}
 pdf.image(path.join(process.cwd(),'public/images/logo/invoice-hume-black.png'),left,y,{fit:[130,54]});
 pdf.font('Latin').fontSize(20).fillColor('#111').text('INVOICE',380,y,{width:177,align:'right'});pdf.fontSize(8).text(data.lifecycle==='issued'?'Issued invoice':'DRAFT - not issued',380,y+27,{width:177,align:'right'});y+=66;
 text(`Invoice: ${data.invoiceNumber}    Date: ${data.invoiceDate}`,10,'#111');
 text(data.sellerName,11,'#111');text(data.sellerAddress);text([data.sellerEmail,data.sellerPhone].filter(Boolean).join(' | '));if(data.sellerGstin)text(`GSTIN: ${data.sellerGstin}`);
 y+=8;label('Billed to');text(data.buyerName,11,'#111');text(data.buyerAddress);text([data.buyerEmail,data.buyerPhone].filter(Boolean).join(' | '));if(data.buyerGstin)text(`Buyer GSTIN: ${data.buyerGstin}`);if(data.placeOfSupply)text(`Place of supply: ${data.placeOfSupply} (${data.placeOfSupplyCode||'not set'})`);
 if(data.showPaymentStatus)text(`Payment status: ${data.paymentStatus}`);
 text(data.taxMode==='none'?'No GST charged.':data.priceMode==='exclusive'?'Unit prices exclude GST; line totals include GST.':'Unit prices and line totals include GST.',8,'#666');
 y+=8;
 const cols=[38,64,310,349,408,470],widths=[20,238,33,53,55,87];
 function heading(){pdf.font('Latin').fontSize(8).fillColor('#555');['#','Description / HSN-SAC','Qty','Unit price','GST','Line total'].forEach((value,index)=>pdf.text(value,cols[index],y,{width:widths[index],align:index>1?'right':'left'}));y+=20;pdf.moveTo(left,y-5).lineTo(left+width,y-5).strokeColor('#bbb').stroke();}
 need(60);tableMode=true;heading();
 totals.lines.forEach((line,index)=>{const description=line.name+(line.hsnSac?`\nHSN/SAC: ${line.hsnSac}`:'')+`\nTaxable: ${money(line.taxable)}`+(line.discount?` | Discount: ${money(line.discount)}`:'');const height=Math.max(39,description.split('\n').reduce((sum,line)=>sum+mixedHeight(line,8,238),0)+15);need(height);mixedText(description,cols[1],y,238,8,'#222');pdf.font('Latin').fontSize(8);[String(index+1),`${line.quantity} ${line.unit}`,line.price.toFixed(2),`${line.rate}%`,line.gross.toFixed(2)].forEach((value,i)=>{const col=[0,2,3,4,5][i];pdf.text(value,cols[col],y,{width:widths[col],align:col>1?'right':'left'});});y+=height;pdf.moveTo(left,y-5).lineTo(left+width,y-5).strokeColor('#e4e4e4').stroke();});
 tableMode=false;y+=10;need(135);
 const summary=(name:string,value:number,strong=false)=>{pdf.font('Latin').fontSize(strong?11:9).fillColor(strong?'#111':'#555').text(name,300,y,{width:170});pdf.text(money(value),470,y,{width:87,align:'right'});y+=strong?23:18;};
 summary('Taxable value',totals.subtotal);if(totals.taxKind==='split'){summary('CGST',totals.cgst);summary('SGST',totals.sgst);}else if(totals.taxKind==='igst')summary('IGST',totals.igst);summary('Grand total',totals.grandTotal,true);if(data.showPaymentAmounts){summary('Amount recorded received',totals.amountReceived);summary('Balance due',totals.balanceDue,true);}
 if(totals.discountAmount)text(`Discount included in the above taxable values: ${money(totals.discountAmount)}`,8,'#666');if(data.shippingFee)text(`Shipping included: ${money(totals.shippingGross)} (tax: ${money(totals.shippingTax)})`,8,'#666');
 y+=10;if(data.notes.trim()){label('Notes');text(data.notes);}if(data.terms.trim()){label('Terms & Conditions');text(data.terms,8,'#555');}if(data.bankDetails.trim()){label('Bank Details');text(data.bankDetails,8,'#444');}
 const range=pdf.bufferedPageRange();for(let i=0;i<range.count;i++){pdf.switchToPage(i);pdf.page.margins.bottom=0;pdf.font('Latin').fontSize(8).fillColor('#888').text(`${data.invoiceNumber}  |  ${i+1} / ${range.count}`,left,805,{width,align:'right',lineBreak:false});}
 pdf.end();return result;
}
