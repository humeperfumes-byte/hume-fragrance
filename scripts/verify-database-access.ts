import {config} from 'dotenv';
import postgres from 'postgres';
config({path:'.env.local',quiet:true});config({path:'.env',quiet:true});
async function main(){
 if(!process.env.DATABASE_URL)throw new Error('Database not configured');
 const url=new URL(process.env.DATABASE_URL);if(url.hostname.endsWith('.pooler.supabase.com')&&url.port==='6543')url.port='5432';
 const db=postgres(url.toString(),{max:1,prepare:false,connect_timeout:15,idle_timeout:2,onnotice:()=>{}});
 try{
  for(const role of ['anon','authenticated']){
   let blocked=false;
   try{await db.begin(async tx=>{await tx.unsafe(`SET LOCAL ROLE ${role}`);await tx.unsafe('SELECT 1 FROM public.orders LIMIT 0');});}catch(error){blocked=Boolean(error&&typeof error==='object'&&'code' in error&&error.code==='42501');}
   if(!blocked)throw new Error('Public-role blocking verification failed');
   console.log(`${role}: direct order read denied`);
  }
  await db.begin('read only',async tx=>{
   await tx.unsafe("SET LOCAL statement_timeout='10s'");
   for(const table of ['orders','saved_invoices','customer_account_sessions','products','coupons']){await tx.unsafe(`SELECT 1 FROM public.${table} LIMIT 1`);console.log(`Application role: ${table} read succeeds`);}
  });
 }finally{await db.end();}
 const checks=[{label:'Product catalog',path:'/api/products'},{label:'Site settings',path:'/api/settings'},{label:'Public coupons',path:'/api/coupons'},...(process.env.ADMIN_API_TOKEN?[{label:'Admin invoice register',path:'/api/admin/invoices?pageSize=1',admin:true}]:[])];
 await Promise.all(checks.map(async check=>{try{const response=await fetch(`https://www.humefragrance.com${check.path}`,{headers:check.admin?{'x-admin-token':process.env.ADMIN_API_TOKEN!}:{},signal:AbortSignal.timeout(15000)});console.log(`${check.label}: HTTP ${response.status}`);if(!response.ok)process.exitCode=1;await response.body?.cancel();}catch{console.log(`${check.label}: request could not complete`);process.exitCode=1;}}));
}
main().catch(()=>{console.error('Verification needs review. No data was changed by this check.');process.exitCode=1;});
