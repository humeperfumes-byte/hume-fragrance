import {config} from 'dotenv';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
config({path:'.env.local',quiet:true});config({path:'.env',quiet:true});
async function main(){
 const {db}=await import('../db');const {GET,POST}=await import('../app/api/admin/invoices/item-suggestions/route');const {NextRequest}=await import('next/server');
 const {invoiceItemSuggestions}=await import('../db/schema');const {eq}=await import('drizzle-orm');
 const realInsert=db.insert.bind(db),realSelect=db.select.bind(db),rollback=new Error('verification rollback');
 try{await db.transaction(async tx=>{
  db.insert=tx.insert.bind(tx) as typeof db.insert;db.select=tx.select.bind(tx) as typeof db.select;
  try{
   const item={name:`White tea fragrance oil (100gm) verification ${randomUUID()}`,category:'oil',unit:'pcs',price:200};
   const request=(body:unknown,token=process.env.ADMIN_API_TOKEN||'')=>new NextRequest('http://localhost/api/admin/invoices/item-suggestions',{method:'POST',headers:{'x-admin-token':token,'Content-Type':'application/json'},body:JSON.stringify(body)});
   assert.equal((await POST(request(item,'wrong-token'))).status,401);
   const response=await POST(request(item));assert.equal(response.status,200,await response.clone().text());const saved=(await response.json()).suggestion;assert.equal(saved.name,item.name);assert.equal(saved.price,200);
   const revised=await POST(request({...item,name:item.name.toUpperCase(),price:300}));assert.equal(revised.status,200);assert.equal((await revised.json()).suggestion.id,saved.id);
   const [row]=await tx.select().from(invoiceItemSuggestions).where(eq(invoiceItemSuggestions.id,saved.id.replace(/^custom-/,'')));assert.equal(row.price,'300.00');
   const library=await GET(new NextRequest('http://localhost/api/admin/invoices/item-suggestions',{headers:{'x-admin-token':process.env.ADMIN_API_TOKEN||''}}));assert.equal(library.status,200);assert.ok((await library.json()).suggestions.some((entry:{id:string})=>entry.id===saved.id));
   assert.equal((await POST(request({...item,price:-1}))).status,400);
   console.log('Suggestion API checks passed: saved name/size/price, duplicate upsert, reload, input validation and admin authorization.');
  }finally{db.insert=realInsert;db.select=realSelect;}
  throw rollback;
 });}catch(error){if(error!==rollback)throw error;}
 console.log('All test suggestions rolled back. Existing invoices and catalogue unchanged.');
}
main().then(()=>process.exit(0)).catch(error=>{console.error(error.message);process.exit(1);});
