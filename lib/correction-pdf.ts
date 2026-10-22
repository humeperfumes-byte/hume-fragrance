import PDFDocument from "pdfkit";
import path from "node:path";
import type { Correction } from "./invoice-ledger";

export async function renderCorrectionPdf(correction: Correction): Promise<Buffer> {
  const font=(name:string)=>path.join(process.cwd(),"public/fonts",name);
  const pdf=new PDFDocument({size:"A4",margin:40,font:font("NotoSans-Regular.ttf"),info:{Title:correction.number,Author:"HUME Fragrance"}});
  pdf.registerFont("Regular",font("NotoSans-Regular.ttf"));pdf.registerFont("Bold",font("NotoSans-Bold.ttf"));pdf.registerFont("Hindi",font("NotoSansDevanagari-Regular.ttf"));
  const chunks:Buffer[]=[];
  const result=new Promise<Buffer>((resolve,reject)=>{pdf.on("data",chunk=>chunks.push(chunk));pdf.on("end",()=>resolve(Buffer.concat(chunks)));pdf.on("error",reject);});
  const money=(minor:number)=>`₹${(minor/100).toFixed(2)}`;
  function text(value:string,size=10,bold=false){pdf.font(/[\u0900-\u097f]/.test(value)?"Hindi":bold?"Bold":"Regular").fontSize(size).fillColor("#222").text(value,{width:515,lineGap:3});}
  function rule(){pdf.moveTo(40,pdf.y+8).lineTo(555,pdf.y+8).strokeColor("#ddd").stroke();pdf.y+=20;}
  try {
    pdf.image(path.join(process.cwd(),"public/images/logo/invoice-hume-black.png"),40,40,{fit:[125,50]});pdf.y=110;
    text(correction.kind==="refund"?"REFUND RECORD":correction.kind==="cancel"?"CANCELLATION CREDIT NOTE":"CREDIT NOTE",17,true);
    text(`${correction.number}  |  ${correction.date}`,10);
    text(`Original invoice: ${correction.source.invoiceNumber}  |  ${correction.source.invoiceDate}`,10);
    rule();text(correction.source.sellerName,11,true);text(correction.source.sellerAddress);
    if(correction.source.sellerGstin&&correction.source.taxMode!=="none")text(`Seller GSTIN: ${correction.source.sellerGstin}`);
    pdf.moveDown();text("BILLED TO",9,true);text(correction.source.buyerName,11,true);text(correction.source.buyerAddress);
    if(correction.source.buyerGstin&&correction.source.taxMode!=="none")text(`Buyer GSTIN: ${correction.source.buyerGstin}`);
    if(correction.source.taxMode!=="none")text(`Place of supply: ${correction.source.placeOfSupply||""} (${correction.source.placeOfSupplyCode||""})`);
    rule();text(`Reason: ${correction.reason}`);if(correction.reference)text(`Payment method / reference: ${correction.reference}`);pdf.moveDown();
    for(const line of correction.lines){
      pdf.font("Regular").fontSize(10);
      const description=`${line.description}  |  Qty ${line.quantity}`;
      const height=pdf.heightOfString(description,{width:515})+80;
      if(pdf.y+height>790)pdf.addPage();
      text(description,10,true);
      text(`Taxable value ${money(line.taxableMinor)}  |  Credit ${money(line.grossMinor)}`,9);
      if(correction.source.taxMode!=="none"){
        const original=correction.source.items.find(item=>item.id===line.itemId);
        if(original?.hsnSac)text(`HSN/SAC ${original.hsnSac}  |  GST ${original.gstPercent}%`,8);
        text(`CGST ${money(line.cgstMinor)}  |  SGST ${money(line.sgstMinor)}  |  IGST ${money(line.igstMinor)}`,9);
      }
      rule();
    }
    if(pdf.y>680)pdf.addPage();
    if(correction.kind!=="refund"){
      const total=(key:"taxableMinor"|"cgstMinor"|"sgstMinor"|"igstMinor")=>correction.lines.reduce((sum,line)=>sum+line[key],0);
      text(`Taxable value: ${money(total("taxableMinor"))}`,10);
      if(correction.source.taxMode!=="none")text(`CGST ${money(total("cgstMinor"))}  |  SGST ${money(total("sgstMinor"))}  |  IGST ${money(total("igstMinor"))}`,10);
    }
    text(`${correction.kind==="refund"?"Amount returned":"Total credit"}: ${money(correction.amountMinor)}`,14,true);
    pdf.moveDown();text(correction.kind==="refund"?"This document records a completed manual refund. It does not initiate a payment.":"This credit note references the original invoice. The issued invoice and number remain in the register.",8);
    pdf.end();return await result;
  }catch(error){pdf.destroy(error instanceof Error?error:new Error("PDF generation failed"));await result.catch(()=>{});throw error;}
}
