import test from "node:test";
import assert from "node:assert/strict";
import DiscoverySetAlias from "../app/discovery-set/[slug]/page";
import {getDiscoverySetSeoSlugs} from "../lib/discovery-set-seo";
import {DISCOVERY_SET_PATH} from "../lib/discovery-set";
import {middleware} from "../middleware";
import {NextRequest} from "next/server";

test("every historical discovery keyword alias permanently redirects to the product",async()=>{
  const slugs=getDiscoverySetSeoSlugs();
  assert.ok(slugs.length>0);
  for(const slug of slugs){
    await assert.rejects(()=>DiscoverySetAlias({params:Promise.resolve({slug})}),error=>{
      const digest=(error as {digest?:string}).digest||"";
      return digest.includes("NEXT_REDIRECT")&&digest.includes(DISCOVERY_SET_PATH)&&digest.includes("308");
    },slug);
  }
});
test("unknown discovery URLs stay 404 rather than becoming soft product redirects",async()=>{
  await assert.rejects(()=>DiscoverySetAlias({params:Promise.resolve({slug:"not-a-real-discovery-kit"})}),error=>String((error as {digest?:string}).digest).includes("404"));
});
test("HTTP redirects precede streaming and preserve market prefix and attribution",()=>{
  for(const prefix of ["","/us"]){
    const response=middleware(new NextRequest(`https://www.humefragrance.com${prefix}/discovery-set/top-rated-perfume-discovery-box?utm_source=creator`));
    assert.equal(response.status,308);
    assert.equal(response.headers.get("location"),`https://www.humefragrance.com${prefix}${DISCOVERY_SET_PATH}?utm_source=creator`);
  }
  assert.equal(middleware(new NextRequest("https://www.humefragrance.com/discovery-set/not-real")).status,404);
  assert.equal(middleware(new NextRequest(`https://www.humefragrance.com${DISCOVERY_SET_PATH}`)).headers.get("location"),null);
});
