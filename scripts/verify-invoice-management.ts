import {config} from "dotenv";
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {invoiceDocumentSchema} from "../lib/invoice-document";
config({path:".env.local",quiet:true});config({path:".env",quiet:true});

async function main(){
  const {db}=await import("../db");
  const schema=await import("../db/schema");
  const {eq}=await import("drizzle-orm");
  const invoices=await import("../app/api/admin/invoices/route");
  const customers=await import("../app/api/admin/invoices/customers/route");
  const customer=await import("../app/api/admin/invoices/customers/[id]/route");
  const corrections=await import("../app/api/admin/invoices/corrections/route");
  const {NextRequest}=await import("next/server");
  const token=process.env.ADMIN_API_TOKEN||"";
  const request=(url:string,body?:unknown,authenticated=true)=>new NextRequest(`http://localhost:3002${url}`,{method:body?"POST":"GET",headers:{...(authenticated?{"x-admin-token":token}:{}),"Content-Type":"application/json"},...(body?{body:JSON.stringify(body)}:{})});
  const parse=async(response:Response)=>{assert.equal(response.status,200,await response.clone().text());return response.json();};
  const real=db.transaction.bind(db),rollback=new Error("verification rollback");
  try{await real(async tx=>{
    const original=db.transaction;
    db.transaction=(async callback=>tx.transaction(callback)) as typeof db.transaction;
    try{
      if(token){assert.equal((await customers.GET(request("/api/admin/invoices/customers",undefined,false))).status,401);assert.equal((await corrections.POST(request("/api/admin/invoices/corrections",{},false))).status,401);}
      const tag=`VERIFY-${randomUUID()}`;
      const document=invoiceDocumentSchema.parse({sellerName:"HUME",sellerAddress:"Kanpur",sellerEmail:"",sellerPhone:"",sellerGstin:"",buyerName:tag,buyerAddress:"Test address",buyerEmail:"",buyerPhone:"",buyerGstin:"",invoiceNumber:"DRAFT-TEST",invoiceDate:"2026-10-01",paymentStatus:"Unpaid",showPaymentStatus:false,items:[{id:"line",name:"Verification fragrance",category:"perfume",unit:"pcs",quantity:2,price:100,gstPercent:18}],shippingFee:0,targetGrandTotal:"",bankDetails:"",terms:"",notes:"",taxMode:"none",amountReceived:0,showPaymentAmounts:true});
      const automaticInput={id:randomUUID(),title:tag+" automatic",document:{...document,buyerName:tag+" Automatic",buyerEmail:"auto@example.invalid",buyerPhone:"9559024822",bankDetails:"Automatic bank",terms:"Automatic terms",items:[{...document.items[0],name:tag+" reusable item",hsnSac:"3303"}]}};
      const automatic=(await parse(await invoices.POST(request("/api/admin/invoices",automaticInput)))).invoice;
      assert.ok(automatic.document.customerId,"Saving creates and links the customer automatically");
      const autoId=automatic.document.customerId;
      const automaticRetry=(await parse(await invoices.POST(request("/api/admin/invoices",automaticInput)))).invoice;
      assert.equal(automaticRetry.id,automatic.id,"Save retries retain the same invoice and customer");
      const automaticAgain=(await parse(await invoices.POST(request("/api/admin/invoices",{...automaticInput,id:randomUUID(),document:{...automaticInput.document,buyerName:tag+"   Automatic",buyerPhone:"+91 95590 24822"}})))).invoice;
      assert.equal(automaticAgain.document.customerId,autoId,"Repeated manual entry matches the existing customer");
      const suggestions=await tx.select().from(schema.invoiceItemSuggestions).where(eq(schema.invoiceItemSuggestions.name,tag+" reusable item"));
      assert.equal(suggestions.length,1);assert.equal(suggestions[0].details.hsnSac,"3303");assert.equal(suggestions[0].details.gstPercent,18);
      const [defaults]=await tx.select().from(schema.invoiceReusableDefaults).where(eq(schema.invoiceReusableDefaults.id,"business"));
      assert.equal(defaults.document.bankDetails,"Automatic bank");assert.equal(defaults.document.terms,"Automatic terms");assert.equal(defaults.document.amountReceived,undefined);assert.equal(defaults.document.buyerName,undefined);
      const customerId=randomUUID();
      const customerInput={id:customerId,name:tag,address:"Test billing address",email:"verify@example.invalid",phone:"",gstin:""};
      const firstCustomer=(await parse(await customers.POST(request("/api/admin/invoices/customers",customerInput)))).customer;
      assert.equal((await parse(await customers.POST(request("/api/admin/invoices/customers",customerInput)))).customer.id,customerId,"Customer create retries are idempotent");
      assert.equal((await customers.POST(request("/api/admin/invoices/customers",{...customerInput,name:"Changed",expectedUpdatedAt:"2000-01-01T00:00:00.000Z"}))).status,409);
      const editedCustomer=(await parse(await customers.POST(request("/api/admin/invoices/customers",{...customerInput,address:"Updated billing address",expectedUpdatedAt:firstCustomer.updatedAt})))).customer;
      assert.equal(editedCustomer.address,"Updated billing address");
      assert.notEqual(editedCustomer.updatedAt,firstCustomer.updatedAt);
      const context={params:Promise.resolve({id:customerId})};
      const id=randomUUID();
      let saved=(await parse(await invoices.POST(request("/api/admin/invoices",{id,title:tag,document:{...document,customerId}})))).invoice;
      saved=(await parse(await invoices.POST(request("/api/admin/invoices",{id,title:tag,document:saved.document,expectedUpdatedAt:saved.updatedAt,action:"issue"})))).invoice;
      const originalSnapshot=(await tx.select().from(schema.issuedInvoices).where(eq(schema.issuedInvoices.invoiceId,id)))[0].document;
      const cancelledInput={id:randomUUID(),invoiceId:id,expectedUpdatedAt:saved.updatedAt,kind:"cancel",date:"2026-10-22",reason:"Verification cancellation"};
      const cancellation=(await parse(await corrections.POST(request("/api/admin/invoices/corrections",cancelledInput)))).correction;
      assert.equal(cancellation.amountMinor,20000);
      assert.equal((await parse(await corrections.POST(request("/api/admin/invoices/corrections",cancelledInput)))).correction.id,cancellation.id,"Retries do not create duplicate corrections");
      assert.equal((await corrections.POST(request("/api/admin/invoices/corrections",{...cancelledInput,reason:"Different details"}))).status,409);
      const cancelled=(await parse(await corrections.GET(request(`/api/admin/invoices/corrections?invoiceId=${id}`)))).invoice;
      const reopened=(await parse(await invoices.GET(request(`/api/admin/invoices?invoiceId=${id}`)))).invoice;assert.equal(reopened.ledger.cancelled,true);
      assert.equal(cancelled.ledger.balanceMinor,0);assert.equal(cancelled.ledger.cancelled,true);
      assert.equal((await invoices.POST(request("/api/admin/invoices",{id,title:tag,document:{...saved.document,amountReceived:10},expectedUpdatedAt:cancelled.updatedAt}))).status,409);
      assert.deepEqual((await tx.select().from(schema.issuedInvoices).where(eq(schema.issuedInvoices.invoiceId,id)))[0].document,originalSnapshot);
      let statement=await parse(await customer.GET(request(`/api/admin/invoices/customers/${customerId}`),context));
      assert.equal(statement.totals.balanceMinor,0);assert.equal(statement.totals.creditedMinor,20000);
      const id2=randomUUID();
      let paid=(await parse(await invoices.POST(request("/api/admin/invoices",{id:id2,title:tag,document:{...document,customerId,amountReceived:200,paymentStatus:"Paid"}})))).invoice;
      paid=(await parse(await invoices.POST(request("/api/admin/invoices",{id:id2,title:tag,document:paid.document,expectedUpdatedAt:paid.updatedAt,action:"issue"})))).invoice;
      const creditInput={id:randomUUID(),invoiceId:id2,expectedUpdatedAt:paid.updatedAt,kind:"credit",date:"2026-10-22",reason:"Verification return",lines:[{itemId:"line",quantity:1}]};
      const credit=(await parse(await corrections.POST(request("/api/admin/invoices/corrections",creditInput)))).correction;assert.equal(credit.amountMinor,10000);
      const credited=await parse(await corrections.GET(request(`/api/admin/invoices/corrections?invoiceId=${id2}`)));
      assert.equal((await corrections.POST(request("/api/admin/invoices/corrections",{...creditInput,id:randomUUID(),lines:[{itemId:"line",quantity:2}]}))).status,409,"Stale correction is rejected");
      const refundInput={id:randomUUID(),invoiceId:id2,expectedUpdatedAt:credited.invoice.updatedAt,kind:"refund",date:"2026-10-22",reason:"Verification refund",amount:100,reference:"Synthetic cash receipt"};
      await parse(await corrections.POST(request("/api/admin/invoices/corrections",refundInput)));
      const refunded=await parse(await corrections.GET(request(`/api/admin/invoices/corrections?invoiceId=${id2}`)));
      assert.equal(refunded.balance.customerCreditMinor,0);
      assert.equal((await corrections.POST(request("/api/admin/invoices/corrections",{...refundInput,id:randomUUID(),expectedUpdatedAt:refunded.invoice.updatedAt,amount:1}))).status,409);
      assert.equal((await invoices.POST(request("/api/admin/invoices",{id:id2,title:tag,document:{...paid.document,amountReceived:50},expectedUpdatedAt:refunded.invoice.updatedAt}))).status,409,"Receipt cannot fall below completed refunds");
      statement=await parse(await customer.GET(request(`/api/admin/invoices/customers/${customerId}`),context));assert.equal(statement.totals.refundedMinor,10000);
      const csv=await customer.GET(request(`/api/admin/invoices/customers/${customerId}?format=csv`),context);assert.equal(csv.status,200);assert.match(await csv.text(),/Net customer balance/);
      // Search and pagination must include records older than the former latest-500 cap.
      const rows=Array.from({length:550},(_,i)=>({id:randomUUID(),title:`${tag}-PAGED-${i}`,document:{...document,invoiceNumber:`DRAFT-${i}`,items:[{...document.items[0],price:i+1}]},createdAt:new Date(1700000000000+i*1000),updatedAt:new Date(1700000000000+i*1000)}));
      await tx.insert(schema.savedInvoices).values(rows);
      const page=await parse(await invoices.GET(request(`/api/admin/invoices?q=${tag}-PAGED&page=22&pageSize=25`)));assert.equal(page.total,550);assert.equal(page.invoices.length,25);assert.ok(page.invoices.some((row:{id:string})=>row.id===rows[0].id));
      const search=await parse(await invoices.GET(request(`/api/admin/invoices?q=${tag}-PAGED-0`)));assert.equal(search.total,1);assert.equal(search.invoices[0].id,rows[0].id);
      const sorted=await parse(await invoices.GET(request(`/api/admin/invoices?q=${tag}-PAGED&sort=amount`)));assert.equal(sorted.invoices[0].id,rows[549].id);
      const linked=await parse(await customer.POST(request(`/api/admin/invoices/customers/${customerId}`,{invoiceId:rows[0].id,expectedUpdatedAt:rows[0].updatedAt.toISOString()}),context));assert.equal(linked.invoice.id,rows[0].id);assert.equal(linked.invoice.document.customerId,customerId);
      assert.equal((await customer.POST(request(`/api/admin/invoices/customers/${customerId}`,{invoiceId:rows[0].id,expectedUpdatedAt:rows[0].updatedAt.toISOString()}),context)).status,409);
      const unlinked=await parse(await invoices.GET(request(`/api/admin/invoices?q=${tag}-PAGED&unlinked=true`)));assert.equal(unlinked.total,549);
      await parse(await invoices.POST(request("/api/admin/invoices",{id:linked.invoice.id,title:linked.invoice.title,document:{...linked.invoice.document,customerId:undefined},expectedUpdatedAt:linked.invoice.updatedAt})));
      const detached=await parse(await invoices.GET(request(`/api/admin/invoices?q=${tag}-PAGED&unlinked=true`)));assert.equal(detached.total,549,"Saving a draft automatically restores its reusable customer link");
      assert.equal(firstCustomer.name,tag);
      console.log("Passed: authenticated customer directory, safe retries, stale updates, statements/CSV, linking, search/pagination beyond 500, amount sorting, immutable cancellation, credit limits and refunds.");
    }finally{db.transaction=original;}
    throw rollback;
  });}catch(error){if(error!==rollback)throw error;}
  console.log("All verification customers, 550 synthetic invoices, corrections, links and number allocations rolled back. Existing records untouched.");
}
main().then(()=>process.exit(0)).catch(error=>{console.error(error.message);process.exit(1);});
