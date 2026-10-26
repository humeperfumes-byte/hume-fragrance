import { config } from 'dotenv';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
config({path:'.env.local',quiet:true}); config({path:'.env',quiet:true});
if (process.env.DATABASE_URL) { const url=new URL(process.env.DATABASE_URL); if(url.port==='6543' && url.hostname.endsWith('.pooler.supabase.com')) url.port='5432'; process.env.DATABASE_URL=url.toString(); }
async function main() {
  const {db}=await import('../db');
  const {secureCheckoutSessions,checkoutDrafts,siteSettings}=await import('../db/schema');
  const {eq,inArray}=await import('drizzle-orm');
  const file='output/playwright/checkout-ui-fixtures.json';
  if(process.argv.includes('--cleanup')) {
    const fixtures=JSON.parse(await readFile(file,'utf8'));
    const ids=fixtures.cases.map((entry:{id:string})=>entry.id);
    if(!ids.every((id:string)=>id.startsWith('ui-audit-'))) throw Error('Unexpected fixture id');
    await db.delete(checkoutDrafts).where(inArray(checkoutDrafts.sessionId,ids));
    await db.delete(secureCheckoutSessions).where(inArray(secureCheckoutSessions.id,ids));
    console.log('Browser audit drafts removed.');return;
  }
  const {createCustomerToken}=await import('../lib/customer-access-token');
  const {freshResumeCatalogue}=await import('../lib/fresh-resume-catalogue');
  const {priceSecureCart}=await import('../lib/secure-checkout-pricing');
  const {normalizeAdminControls,ADMIN_CONTROLS_KEY}=await import('../lib/admin-settings');
  const product=(await freshResumeCatalogue()).find(p=>p.priceCurrency==='INR' && !p.badges?.soldOut && !p.badges?.comingSoon && p.price>=100 && p.price<=1400 && p.size.includes('50ml'));
  if(!product)throw Error('No eligible product');
  const cart=[{id:product.id,name:product.name,inspiration:product.inspiration,category:product.category,image:product.images[0]||'',price:product.price,size:product.size,quantity:1}];
  const [settings]=await db.select().from(siteSettings).where(eq(siteSettings.key,ADMIN_CONTROLS_KEY));
  const quote=priceSecureCart(cart,null,0,normalizeAdminControls(settings?.value));
  const owner=createCustomerToken();const cases=[];
  for(const baseTotal of [1500,1500.01]) {
    const token=createCustomerToken(),id='ui-audit-'+randomUUID();
    const session={id,tokenHash:token.hash,ownerHash:owner.hash,orderId:randomUUID(),orderNumber:'HF-UI-'+randomUUID().slice(0,8),cart,details:{},expiresAt:new Date(Date.now()+3600000)};
    await db.insert(secureCheckoutSessions).values(session);
    await db.insert(checkoutDrafts).values({id:randomUUID(),sessionId:id,status:'started',path:'/checkout',cartSnapshot:cart,subtotal:quote.subtotal.toFixed(2),shippingFee:quote.shippingFee.toFixed(2),grandTotal:baseTotal.toFixed(2),pricingBreakdown:{overrideTotal:baseTotal}});
    cases.push({id,token:token.token,baseTotal});
  }
  await writeFile(file,JSON.stringify({owner:owner.token,cases,cart}));
  console.log('Prepared two temporary browser audit drafts; no payment requests created.');
}
main().then(()=>process.exit(0)).catch(error=>{console.error(error.message);process.exit(1)});
