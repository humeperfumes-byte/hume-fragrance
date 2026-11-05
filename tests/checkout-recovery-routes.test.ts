import test from 'node:test';
import assert from 'node:assert/strict';
import Module from 'node:module';
import { NextRequest,NextResponse } from 'next/server';
import { getTableName } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import type { CheckoutDraft } from '../db/schema';

// These route tests have no database URL and stub the database before loading routes.
// Every mutation below is in memory; no application records or messages are touched.
delete process.env.DATABASE_URL;
let store:Record<string,Record<string,unknown>[]>={};let unavailable=false;let traces:string[]=[];let transactionTail=Promise.resolve();
const clock=new Date('2026-10-29T06:00:00Z');
const cart=[{id:'p',name:'Test perfume',inspiration:'Test',category:'Perfume',image:'',size:'50ml',price:799,quantity:1}];
function reset(){unavailable=false;traces=[];transactionTail=Promise.resolve();store={checkout_drafts:[{id:'draft',sessionId:'session',status:'partial',leadStatus:'new',fullName:'Local Fixture',phone:'9900000000',email:null,addressLine1:'Fixture address',city:'Kanpur',state:'Uttar Pradesh',pincode:'208012',country:'IN',cartSnapshot:cart,subtotal:'799.00',shippingFee:'0.00',grandTotal:'799.00',pricingBreakdown:{},createdAt:clock,updatedAt:clock}],orders:[],site_settings:[],coupons:[],secure_checkout_sessions:[{id:'session',orderId:'stable-order-id',orderNumber:'HF-FIXTURE'}],order_edit_audits:[]};}
function query(kind:string,table?:unknown,change?:unknown){let target=table;let data=change;let applied=false;let result:Record<string,unknown>[]=[];let max=Infinity;
 const run=()=>{if(applied)return result;applied=true;const name=getTableName(target as Parameters<typeof getTableName>[0]);const rows=store[name]||[];
 if(kind==='select')result=structuredClone(rows.slice(0,max));
 else if(kind==='insert'){const added=(Array.isArray(data)?data:[data]) as Record<string,unknown>[];store[name]=[...rows,...structuredClone(added)];traces.push('insert:'+name);result=added;}
 else {store[name]=rows.map(row=>({...row,...Object.fromEntries(Object.entries(data as Record<string,unknown>).filter(([,value])=>value!==undefined))}));traces.push('update:'+name);result=structuredClone(store[name]);}
 return result;
 };
 const builder={from(value:unknown){target=value;return builder;},where(){return builder;},limit(value:number){max=value;return builder;},for(){return builder;},values(value:unknown){data=value;return builder;},set(value:unknown){data=value;return builder;},returning(){return Promise.resolve(run());},then(resolve:(value:Record<string,unknown>[])=>unknown,reject?:(error:unknown)=>unknown){return Promise.resolve().then(run).then(resolve,reject);}};
 return builder;
}
interface FixtureDb {select:()=>ReturnType<typeof query>;insert:(table:unknown)=>ReturnType<typeof query>;update:(table:unknown)=>ReturnType<typeof query>;execute:(statement:Parameters<PgDialect['sqlToQuery']>[0])=>Promise<never[]>;transaction:<T>(work:(tx:FixtureDb)=>Promise<T>)=>Promise<T>};
const fakeDb:FixtureDb={select(){return query('select');},insert(table:unknown){return query('insert',table);},update(table:unknown){return query('update',table);},async execute(statement:Parameters<PgDialect['sqlToQuery']>[0]){traces.push(new PgDialect().sqlToQuery(statement).sql);return[];},async transaction<T>(work:(tx:FixtureDb)=>Promise<T>):Promise<T>{const previous=transactionTail;let release!:()=>void;transactionTail=new Promise<void>(resolve=>{release=resolve;});await previous;const before=structuredClone(store);try{return await work(fakeDb);}catch(error){store=before;throw error;}finally{release();}}};
class FixtureCheckoutError extends Error{constructor(message:string,public status=400){super(message);}}
const ready=(async()=>{
 const internal=Module as unknown as {_load:(request:string,parent:unknown,isMain:boolean)=>unknown};const original=internal._load;
 internal._load=function(request,parent,isMain){
  const normalized=request.replace(/\\/g,'/');
  if(request==='@/db'||/\/db\/index\.ts$/.test(normalized))return{db:fakeDb};
  if(request==='@/lib/admin-auth'||normalized.endsWith('/lib/admin-auth.ts'))return{requireAdminToken:(req:NextRequest)=>req.headers.get('x-test-admin')==='1'?null:NextResponse.json({error:'Unauthorized'},{status:401})};
  if(request==='@/lib/secure-checkout'||normalized.endsWith('/lib/secure-checkout.ts'))return{CheckoutRequestError:FixtureCheckoutError,canonicalCart:async()=>{if(unavailable)throw new FixtureCheckoutError('A fragrance is unavailable');return structuredClone(cart);}};
  return original.call(this,request,parent,isMain);
 };
 try{return{convert:await import('../app/api/admin/convert-to-order/route'),workflow:await import('../app/api/admin/checkout-drafts/route')};}finally{internal._load=original;}
})();
function request(path:string,body:unknown,admin=true,origin='http://localhost:3002'){return new NextRequest('http://localhost:3002'+path,{method:path.includes('checkout-drafts')?'PATCH':'POST',headers:{origin,'content-type':'application/json',...(admin?{'x-test-admin':'1'}:{})},body:JSON.stringify(body)});}
const input=()=>({draftId:'draft',expectedUpdatedAt:clock.toISOString()});
test('recovery endpoints reject unauthorized and cross-origin writes',async()=>{const {convert}=await ready;reset();assert.equal((await convert.POST(request('/convert',input(),false))).status,401);assert.equal((await convert.POST(request('/convert',input(),true,'https://example.com'))).status,403);assert.equal(store.orders.length,0);});
test('parallel conversion attempts create exactly one unpaid order and preserve checkout identity',async()=>{const {convert}=await ready;reset();const results=await Promise.all([convert.POST(request('/convert',input())),convert.POST(request('/convert',input()))]);assert.deepEqual(results.map(result=>result.status),[200,200]);assert.equal(store.orders.length,1);assert.equal(store.orders[0].id,'stable-order-id');assert.equal(store.orders[0].status,'payment_pending');assert.equal(store.orders[0].paymentCapturedAt,undefined);assert.equal(store.orders[0].checkoutChannel,'razorpay');assert.equal(store.secure_checkout_sessions[0].expectedPaymentMinor,79900);assert.equal(store.order_edit_audits.length,1);assert.ok(traces.some(trace=>trace.includes('pg_advisory_xact_lock')));});
test('stale prices, stale drafts, unavailable products and incomplete delivery details cannot create orders',async()=>{const {convert}=await ready;reset();store.checkout_drafts[0].grandTotal='700';assert.equal((await convert.POST(request('/convert',input()))).status,409);reset();assert.equal((await convert.POST(request('/convert',{...input(),expectedUpdatedAt:new Date(0).toISOString()}))).status,409);reset();unavailable=true;assert.equal((await convert.POST(request('/convert',input()))).status,400);reset();store.checkout_drafts[0].addressLine1='';assert.equal((await convert.POST(request('/convert',input()))).status,400);assert.equal(store.orders.length,0);});
test('contact button updates status while preserving customer activity and offer details',async()=>{const {workflow}=await ready;reset();store.checkout_drafts[0].pricingBreakdown={couponCode:'TEN'};const response=await workflow.PATCH(request('/checkout-drafts',{id:'draft',markContacted:true,leadStatus:'new',expectedWorkflowUpdatedAt:null}));assert.equal(response.status,200);assert.equal(store.checkout_drafts[0].leadStatus,'contacted');assert.equal((store.checkout_drafts[0].updatedAt as Date).getTime(),clock.getTime());assert.equal((store.checkout_drafts[0].pricingBreakdown as CheckoutDraft['pricingBreakdown']).couponCode,'TEN');assert.ok(store.checkout_drafts[0].lastContactedAt);});
