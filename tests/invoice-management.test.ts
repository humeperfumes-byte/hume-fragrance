import test from "node:test";
import assert from "node:assert/strict";
import { buildCorrection, correctionSchema, invoiceBalance, type Correction } from "../lib/invoice-ledger";
import type { InvoiceDocument } from "../lib/invoice-document";

const document:InvoiceDocument={sellerName:"HUME",sellerAddress:"Kanpur",sellerEmail:"",sellerPhone:"",sellerGstin:"09ABCDE1234F1Z5",buyerName:"Customer",buyerAddress:"Kanpur",buyerEmail:"",buyerPhone:"",buyerGstin:"",invoiceNumber:"HF/2627/000001",invoiceDate:"2026-10-01",lifecycle:"issued",paymentStatus:"Partially Paid",showPaymentStatus:false,items:[{id:"oil",name:"Fragrance oil",category:"oil",unit:"ml",quantity:3,price:118,gstPercent:18,hsnSac:"3303"}],targetGrandTotal:"",shippingFee:118,shippingGstPercent:18,bankDetails:"",terms:"",notes:"",amountReceived:236,showPaymentAmounts:true};
const input=(patch:Record<string,unknown>={})=>correctionSchema.parse({id:crypto.randomUUID(),invoiceId:crypto.randomUUID(),expectedUpdatedAt:"2026-10-01T00:00:00.000Z",date:"2026-10-22",kind:"credit",reason:"Returned goods",lines:[{itemId:"oil",quantity:1}],...patch});
const recorded=(data:ReturnType<typeof buildCorrection>,kind:Correction["kind"]="credit"):Correction=>({id:crypto.randomUUID(),invoiceId:"test",kind,number:"CN/2627/000001",date:"2026-10-22",reason:"Return",reference:"",source:document,createdAt:"2026-10-22T00:00:00Z",...data});

test("partial credit retains original discount and tax and caps quantities",()=>{
  const value=buildCorrection(document,[],input());assert.equal(value.amountMinor,11800);assert.equal(value.lines[0].taxableMinor,10000);assert.equal(value.lines[0].cgstMinor,900);
  const first=recorded(value);assert.throws(()=>buildCorrection(document,[first],input({lines:[{itemId:"oil",quantity:3}]})),/remaining quantity/);
  const discounted={...document,targetGrandTotal:"413"};const discountCredit=buildCorrection(discounted,[],input({lines:[{itemId:"oil",quantity:3}]}));assert.equal(discountCredit.amountMinor,29500);
});
test("cumulative partial credits reverse every paise without negative taxable values",()=>{
  for(let cents=1;cents<140;cents++){
    const source={...document,shippingFee:0,items:[{...document.items[0],price:cents/300}]};const rows:Correction[]=[];
    for(let i=0;i<3;i++){const value=buildCorrection(source,rows,input());assert.ok(value.lines[0].taxableMinor>=0);rows.push(recorded(value));}
    const balance=invoiceBalance(source,rows);assert.equal(balance.creditMinor,balance.totalMinor);
    const sum=(key:"cgstMinor"|"sgstMinor"|"taxableMinor")=>rows.flatMap(row=>row.lines).reduce((sum,row)=>sum+row[key],0);
    assert.equal(sum("cgstMinor")+sum("sgstMinor")+sum("taxableMinor"),balance.totalMinor);
  }
});
test("refund is limited to credit owed from real recorded receipts and cannot repeat",()=>{
  const credit=recorded(buildCorrection(document,[],input({lines:[{itemId:"oil",quantity:3}],includeShipping:true})));
  assert.equal(invoiceBalance(document,[credit]).customerCreditMinor,23600);
  const refundInput=input({kind:"refund",lines:[],amount:236,reference:"UPI transaction test"});
  const refund=recorded(buildCorrection(document,[credit],refundInput),"refund");
  assert.equal(invoiceBalance(document,[credit,refund]).customerCreditMinor,0);
  assert.throws(()=>buildCorrection(document,[credit,refund],refundInput),/exceeds/);
  assert.throws(()=>buildCorrection(document,[],refundInput),/exceeds/);
});
test("manual Paid labels without received amounts produce unknown balances",()=>{
  const source={...document,amountReceived:0,showPaymentAmounts:false,paymentStatus:"Paid" as const};
  assert.equal(invoiceBalance(source,[]).balanceMinor,null);
  assert.throws(()=>buildCorrection(source,[],input({kind:"refund",lines:[],amount:1,reference:"cash"})),/actual amount/);
});
test("cancellation retains full invoice value as a credit and locks further corrections",()=>{
  const unpaid={...document,amountReceived:0,paymentStatus:"Unpaid" as const};
  const cancelled=recorded(buildCorrection(unpaid,[],input({kind:"cancel",lines:[]})),"cancel");
  assert.equal(cancelled.amountMinor,47200);assert.equal(invoiceBalance(unpaid,[cancelled]).balanceMinor,0);
  assert.throws(()=>buildCorrection(unpaid,[cancelled],input()),/cancelled/);
  assert.throws(()=>buildCorrection(document,[],input({kind:"cancel",lines:[]})),/unpaid/);
});
test("shipping cannot be credited twice; duplicate lines and backdating are blocked",()=>{
  const shipping=recorded(buildCorrection(document,[],input({lines:[],includeShipping:true})));
  assert.throws(()=>buildCorrection(document,[shipping],input({lines:[],includeShipping:true})),/already/);
  assert.throws(()=>buildCorrection(document,[],input({lines:[{itemId:"oil",quantity:1},{itemId:"oil",quantity:1}]})),/only once/);
  assert.throws(()=>buildCorrection(document,[],input({date:"2026-09-01"})),/precede/);
  assert.throws(()=>buildCorrection(document,[],input({lines:[{itemId:"missing",quantity:1}]})),/does not exist/);
});
