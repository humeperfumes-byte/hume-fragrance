import test from 'node:test';
import assert from 'node:assert/strict';
import { NextResponse } from 'next/server';
import { checkoutRequestTiming } from '../lib/checkout-request-timing';
import { classifySafeFailure, deliverSafeError, makeSafeErrorEvent, safeErrorDetails, shouldRecordSafeError, persistSafeErrorWithLegacyFallback, type SafeErrorContext } from '../lib/safe-error-monitoring';

test('request reference links response and stage without accepting customer fields', () => {
  const timing=checkoutRequestTiming('order');
  timing.mark('prepare');timing.mark('transaction');
  const context=timing.failureContext();
  const event=makeSafeErrorEvent('ORDER_SAVE_FAILED',{...context,...classifySafeFailure({cause:{code:'55P03',message:'private database payload'}})});
  const response=timing.finish(new NextResponse(null,{status:200}));
  assert.equal(response.headers.get('X-Hume-Request-Reference'),event.reference);
  assert.deepEqual(event.details,{operation:'order',stage:'transaction',category:'database_lock',sqlState:'55P03'});
  assert.ok(!JSON.stringify(event).includes('private'));
});

test('only known diagnostic enums survive runtime metadata sanitization', () => {
  const unsafe={operation:'phone-9900000000',stage:'customer@example.com',category:'raw exception',sqlState:'PHONE',requestReference:'secret-checkout-token',phone:'9900000000',body:{address:'private'}};
  assert.deepEqual(safeErrorDetails(unsafe),{});
  const event=makeSafeErrorEvent('ORDER_SAVE_FAILED',unsafe as unknown as SafeErrorContext);
  assert.deepEqual(Object.keys(event).sort(),['code','occurredAt','reference']);
  assert.ok(!JSON.stringify(event).includes('secret'));
});

test('failure categories never depend on raw error messages or expose unknown codes', () => {
  assert.deepEqual(classifySafeFailure({cause:{cause:{code:'57014',message:'private SQL'}}}),{category:'database_timeout',sqlState:'57014'});
  assert.deepEqual(classifySafeFailure({code:'23505'}),{category:'database_conflict',sqlState:'23505'});
  assert.deepEqual(classifySafeFailure({code:'08006'}),{category:'database_unavailable',sqlState:'08006'});
  assert.deepEqual(classifySafeFailure({code:'ECONNRESET'}),{category:'connection_error'});
  assert.deepEqual(classifySafeFailure({status:503,message:'private credentials'}),{category:'service_unavailable'});
  assert.deepEqual(classifySafeFailure(new Error('password and customer data')),{category:'unexpected_error'});
  const circular:{cause?:unknown}={};circular.cause=circular;
  assert.deepEqual(classifySafeFailure(circular),{category:'unexpected_error'});
});

test('distinct requests are counted while duplicate reports for a request are suppressed', () => {
  const recent=new Map<string,number>();
  const a={requestReference:crypto.randomUUID()},b={requestReference:crypto.randomUUID()};
  assert.equal(shouldRecordSafeError(recent,'ORDER_SAVE_FAILED',a,10000),true);
  assert.equal(shouldRecordSafeError(recent,'ORDER_SAVE_FAILED',a,10001),false);
  assert.equal(shouldRecordSafeError(recent,'ORDER_SAVE_FAILED',b,10001),true);
  assert.equal(shouldRecordSafeError(recent,'ORDER_SAVE_FAILED',undefined,10001),true);
  assert.equal(shouldRecordSafeError(recent,'ORDER_SAVE_FAILED',undefined,10002),false);
  for(let i=0;i<1100;i++)shouldRecordSafeError(recent,'ORDER_SAVE_FAILED',{requestReference:crypto.randomUUID()},10002);
  assert.ok(recent.size<=1000);
});

test('missing optional database column falls back once using the original reference',async()=>{
  const event=makeSafeErrorEvent('ORDER_SAVE_FAILED',{operation:'order',stage:'persist'});
  let attempts=0;
  await persistSafeErrorWithLegacyFallback(event,async()=>{attempts++;throw {cause:{code:'42703'}}},async saved=>{attempts++;assert.equal(saved.reference,event.reference)});
  assert.equal(attempts,2);
  let legacyCalled=false;
  await assert.rejects(persistSafeErrorWithLegacyFallback(event,async()=>{throw new Error('offline')},async()=>{legacyCalled=true}));
  assert.equal(legacyCalled,false);
});

test('failure storms have a bounded database and webhook rate',()=>{
  const recent=new Map<string,number>();
  for(let i=0;i<20;i++)assert.equal(shouldRecordSafeError(recent,'ORDER_SAVE_FAILED',{requestReference:crypto.randomUUID()},10000),true);
  assert.equal(shouldRecordSafeError(recent,'ORDER_SAVE_FAILED',{requestReference:crypto.randomUUID()},10001),false);
  assert.equal(shouldRecordSafeError(recent,'ORDER_SAVE_FAILED',{requestReference:crypto.randomUUID()},15000),true);
});

test('disabled monitoring does not write and a broken sink never breaks checkout',async()=>{
  let calls=0;
  const context={requestReference:crypto.randomUUID(),operation:'order' as const,stage:'transaction' as const};
  await deliverSafeError('ORDER_SAVE_FAILED',false,async()=>{calls++},context);
  assert.equal(calls,0);
  await assert.doesNotReject(deliverSafeError('ORDER_SAVE_FAILED',true,async event=>{assert.equal(event.reference,context.requestReference);throw Error('sink offline')},context));
});
