import 'server-only';
import { unstable_cache } from 'next/cache';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { products, coupons, siteSettings } from '@/db/schema';
import { ADMIN_CONTROLS_KEY, normalizeAdminControls } from '@/lib/admin-settings';
import { getProductPath } from '@/lib/product-route';
import { DISCOVERY_SET_PATH, DISCOVERY_SET_PRICE, DISCOVERY_SET_SAMPLE_COUNT, isEligibleDiscoverySample } from '@/lib/discovery-set';
import type { ChatTurn } from './live-chat-core';
export async function readChatKnowledge(){
  const [catalogue,offers,settings]=await Promise.all([
    db.select({id:products.id,name:products.name,inspiration:products.inspiration,inspirationBrand:products.inspirationBrand,category:products.category,categoryId:products.categoryId,gender:products.gender,price:products.price,priceCurrency:products.priceCurrency,notes:products.notes,longevity:products.longevity,badges:products.badges,visibility:products.visibility}).from(products).limit(2000),
    db.select({code:coupons.code,description:coupons.description,type:coupons.type,value:coupons.value,minSubtotal:coupons.minSubtotal}).from(coupons).where(and(eq(coupons.active,true),eq(coupons.displayInCart,true),isNull(coupons.archivedAt))).limit(30),
    db.select({value:siteSettings.value}).from(siteSettings).where(eq(siteSettings.key,ADMIN_CONTROLS_KEY)).limit(1),
  ]);
  const controls=normalizeAdminControls(settings[0]?.value);
  return {catalogue:catalogue.filter(p=>p.visibility==='public'||p.badges.showInDiscoverySet).map(p=>({...p,path:getProductPath(p),sampleEligible:isEligibleDiscoverySample(p)})),offers,controls:{onlinePaymentEnabled:controls.razorpayEnabled,whatsappCheckoutEnabled:controls.whatsappCheckoutEnabled,freeDeliveryThreshold:controls.freeDeliveryThreshold,shippingChargeBelowThreshold:controls.shippingChargeBelowThreshold,giftOneThreshold:controls.giftOneThreshold,giftTwoThreshold:controls.giftTwoThreshold,supportWhatsApp:`https://wa.me/${controls.whatsappNumber}`},discovery:{path:DISCOVERY_SET_PATH,price:DISCOVERY_SET_PRICE,samples:DISCOVERY_SET_SAMPLE_COUNT,status:'pre-order'}};
}
export const loadChatKnowledge = unstable_cache(readChatKnowledge,['hume-chat-knowledge-v2'],{revalidate:60,tags:['products','settings','coupons']});
export async function chatKnowledgeFor(turns:ChatTurn[]) {
  const data=await loadChatKnowledge();
  const words=turns.slice(-6).map(t=>t.message.toLowerCase()).join(' ').split(/[^a-z0-9]+/).filter(w=>w.length>3);
  const score=(p:typeof data.catalogue[number])=>words.reduce((n,w)=>n+(JSON.stringify([p.name,p.inspiration,p.notes,p.gender,p.category]).toLowerCase().includes(w)?1:0),0)+(p.badges.soldOut||p.badges.comingSoon?0:2);
  return {...data,asOf:new Date().toISOString(),catalogue:[...data.catalogue].sort((a,b)=>score(b)-score(a)).slice(0,24),catalogueNote:'Relevant subset; absence is not proof a product does not exist. Availability is checked again at checkout.'};
}
