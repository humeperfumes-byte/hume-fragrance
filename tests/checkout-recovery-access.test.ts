import test from 'node:test';
import assert from 'node:assert/strict';
import Module from 'node:module';
import { NextRequest } from 'next/server';
import { getTableName } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import { createCustomerToken } from '../lib/customer-access-token';

delete process.env.DATABASE_URL;
process.env.ENABLE_SECURE_CHECKOUT='true';
const owner=createCustomerToken(),primary=createCustomerToken(),alias=createCustomerToken();
const session={id:'session',orderId:'order',ownerHash:owner.hash,tokenHash:primary.hash,expiresAt:new Date(Date.now()+60000),details:{fullName:'PRIVATE FIXTURE'},cart:[]};
let revoked=false,expired=false,scope='checkout';let aliasQuery='';
const fakeDb={select(){let tableName='';let condition:Parameters<PgDialect['sqlToQuery']>[0];const joins:string[]=[];
 const builder={from(table:Parameters<typeof getTableName>[0]){tableName=getTableName(table);return builder;},where(value:typeof condition){condition=value;return builder;},innerJoin(table:Parameters<typeof getTableName>[0]){joins.push(getTableName(table));return builder;},limit(){const query=new PgDialect().sqlToQuery(condition);if(tableName==='secure_checkout_sessions')return Promise.resolve(query.params.includes(primary.hash)?[session]:[]);aliasQuery=query.sql;assert.ok(joins.includes('checkout_drafts')&&joins.includes('secure_checkout_sessions'));assert.ok(query.sql.includes('revoked_at')&&query.sql.includes('expires_at'));assert.ok(query.params.includes('checkout'));return Promise.resolve(query.params.includes(alias.hash)&&!revoked&&!expired&&scope==='checkout'?[{session}]:[]);}};return builder;
}};
const ready=(async()=>{const internal=Module as unknown as {_load:(request:string,parent:unknown,isMain:boolean)=>unknown};const original=internal._load;internal._load=function(request,parent,isMain){if(request==='server-only')return {};if(/(?:^|\/)db(?:\/index(?:\.ts)?)?$/.test(request.replace(/\\/g,'/')))return{db:fakeDb};return original.call(this,request,parent,isMain);};try{return await import('../lib/secure-checkout');}finally{internal._load=original;}})();
function request(cookie?:string){return new NextRequest('http://localhost:3002/api/checkout-session',{method:'POST',headers:{origin:'http://localhost:3002','x-hume-checkout-token':alias.token,...(cookie?{cookie:`hume_checkout_owner=${cookie}`}:{})}});}
test('a valid recovery alias restores the same checkout only with its independent owner cookie',async()=>{const api=await ready;assert.equal((await api.secureSessionByToken(primary.token))?.id,'session');assert.equal((await api.secureSessionByToken(alias.token))?.id,'session');assert.ok(aliasQuery.includes('scope'));await assert.rejects(api.requireCheckoutSession(request()),{status:401});await assert.rejects(api.requireCheckoutSession(request(createCustomerToken().token)),{status:401});assert.equal((await api.requireCheckoutSession(request(owner.token))).session.id,'session');});
test('revoked, expired and order-scope aliases cannot authorize checkout APIs',async()=>{const api=await ready;revoked=true;assert.equal(await api.secureSessionByToken(alias.token),null);revoked=false;expired=true;assert.equal(await api.secureSessionByToken(alias.token),null);expired=false;scope='order';assert.equal(await api.secureSessionByToken(alias.token),null);scope='checkout';assert.equal(await api.secureSessionByToken('invalid-token'),null);});
