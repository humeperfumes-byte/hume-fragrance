import {mkdir,writeFile} from "node:fs/promises";
import {renderCorrectionPdf} from "../lib/correction-pdf";
import {buildCorrection,correctionSchema,type Correction} from "../lib/invoice-ledger";
import {invoiceDocumentSchema} from "../lib/invoice-document";
async function main(){
  const source=invoiceDocumentSchema.parse({sellerName:"HUME FRAGRANCE",sellerAddress:"Vijay Tower, P Rd, Gandhinagar, Kanpur, Uttar Pradesh, 208012",sellerEmail:"support@humefragrance.com",sellerPhone:"",sellerGstin:"09ABCDE1234F1Z5",buyerName:"Verification Customer",buyerAddress:"Test address, Kanpur, Uttar Pradesh",buyerEmail:"",buyerPhone:"",buyerGstin:"",invoiceNumber:"HF/2627/000001",invoiceDate:"2026-10-01",paymentStatus:"Paid",showPaymentStatus:false,items:[{id:"perfume",name:"Fragrance oil with diffuser installation",category:"oil",unit:"pcs",quantity:2,price:1180,gstPercent:18,hsnSac:"3303"}],targetGrandTotal:"",shippingFee:118,shippingGstPercent:18,bankDetails:"",terms:"",notes:"",amountReceived:2478,showPaymentAmounts:true,placeOfSupply:"Uttar Pradesh",placeOfSupplyCode:"09"});
  const input=correctionSchema.parse({id:crypto.randomUUID(),invoiceId:crypto.randomUUID(),expectedUpdatedAt:"2026-10-01T00:00:00.000Z",kind:"credit",date:"2026-10-22",reason:"Returned unopened fragrance oil; original price and tax reversed.",lines:[{itemId:"perfume",quantity:1}]});
  const credit:Correction={...input,...buildCorrection(source,[],input),source,number:"CN/2627/000001",createdAt:"2026-10-22T00:00:00Z"};
  const refundInput=correctionSchema.parse({...input,id:crypto.randomUUID(),kind:"refund",lines:[],amount:1180,reference:"UPI verification reference",reason:"Refund completed for returned item"});
  const refund:Correction={...refundInput,...buildCorrection(source,[credit],refundInput),source,number:"RF/2627/000002",createdAt:"2026-10-22T00:00:00Z"};
  await mkdir("output/pdf",{recursive:true});
  await writeFile("output/pdf/credit-note-fixture.pdf",await renderCorrectionPdf(credit));
  await writeFile("output/pdf/refund-record-fixture.pdf",await renderCorrectionPdf(refund));
  const long={...credit,source:{...source,buyerName:"परीक्षण ग्राहक"},reason:"Returned goods. ".repeat(110),lines:Array.from({length:12},(_,i)=>({...credit.lines[0],itemId:`line-${i}`,description:`Long description ${i+1}: ${"Fragrance oil and diffuser installation. ".repeat(10)}`})),amountMinor:credit.amountMinor*12};
  await writeFile("output/pdf/credit-note-long-fixture.pdf",await renderCorrectionPdf(long));
  console.log("Synthetic credit, refund and long-document PDF fixtures rendered; no database writes.");
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
