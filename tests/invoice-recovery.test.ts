import test from "node:test";
import assert from "node:assert/strict";
import { recoverableInvoiceSchema } from "../lib/invoice-recovery";
import { invoiceDocumentSchema } from "../lib/invoice-document";

const unfinished = {
  sellerName:"HUME",sellerAddress:"",sellerEmail:"",sellerPhone:"",sellerGstin:"",
  buyerName:"",buyerAddress:"",buyerEmail:"",buyerPhone:"",buyerGstin:"",
  invoiceNumber:"DRAFT-TEST",invoiceDate:"2026-10-22",paymentStatus:"Unpaid",showPaymentStatus:false,
  items:[{id:"line-1",name:"",category:"other",unit:"pcs",quantity:1,price:0,gstPercent:18}],
  targetGrandTotal:"",shippingFee:0,bankDetails:"",terms:"",notes:"Draft note",
};
test("recovery preserves incomplete work without weakening server save validation",()=>{
  assert.equal(recoverableInvoiceSchema.parse(unfinished).notes,"Draft note");
  assert.equal(invoiceDocumentSchema.safeParse(unfinished).success,false);
});
test("recovery rejects malformed or unexpected stored invoice data",()=>{
  assert.equal(recoverableInvoiceSchema.safeParse({...unfinished,items:[{...unfinished.items[0],quantity:-1}]}).success,false);
  assert.equal(recoverableInvoiceSchema.safeParse({...unfinished,invoiceDate:"2026-02-30"}).success,false);
  assert.equal(recoverableInvoiceSchema.safeParse({...unfinished,unexpected:"value"}).success,false);
});
