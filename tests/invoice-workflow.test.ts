import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './invoice-accounting.test';
import {invoiceCompletionIssues,invoiceDefaults} from '../lib/invoice-workflow';
import {duplicateInvoice} from '../lib/invoice-document';
test('completion checks point at missing inputs and clear after corrections',()=>{
 const draft={...fixture,taxMode:'none' as const,buyerName:'',buyerAddress:'',separateShipping:true,shippingName:'',shippingAddress:''};
 const paths=invoiceCompletionIssues(draft).map(issue=>issue.path);
 for(const path of ['buyerName','buyerAddress','shippingName','shippingAddress'])assert.ok(paths.includes(path));
 assert.deepEqual(invoiceCompletionIssues({...draft,buyerName:'Customer',buyerAddress:'Billing',shippingName:'Recipient',shippingAddress:'Delivery'}),[]);
});
test('GST checks identify actual GST inputs and exclude optional no-GST fields',()=>{
 const invalid={...fixture,sellerGstin:'',buyerGstin:'bad',shippingFee:100,shippingGstPercent:null,items:[{...fixture.items[0],hsnSac:''}]};
 const paths=invoiceCompletionIssues(invalid).map(issue=>issue.path);
 for(const path of ['sellerGstin','buyerGstin','shippingGstPercent','items.0.hsnSac'])assert.ok(paths.includes(path),path);
 assert.deepEqual(invoiceCompletionIssues({...invalid,taxMode:'none'}),[]);
});
test('usual settings exclude customer, items and payment amounts',()=>{
 const defaults=invoiceDefaults({...fixture,amountReceived:100});
 assert.equal(defaults.sellerName,fixture.sellerName);assert.equal(defaults.taxMode,fixture.taxMode);
 for(const key of ['buyerName','buyerAddress','shippingAddress','items','amountReceived','invoiceNumber','targetGrandTotal'])assert.ok(!(key in defaults));
});
test('repeat invoice retains delivery and items but resets financial identity',()=>{
 const original={...fixture,lifecycle:'issued' as const,issuedAt:new Date().toISOString(),separateShipping:true,shippingName:'Recipient',shippingAddress:'Delivery'};
 const copy=duplicateInvoice(original);
 assert.equal(copy.lifecycle,'draft');assert.equal(copy.amountReceived,0);assert.equal(copy.paymentStatus,'Unpaid');assert.equal(copy.issuedAt,undefined);
 assert.notEqual(copy.invoiceNumber,original.invoiceNumber);assert.notEqual(copy.items[0].id,original.items[0].id);
 assert.equal(copy.shippingAddress,'Delivery');assert.equal(copy.buyerName,original.buyerName);
});
