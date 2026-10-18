import test from 'node:test';
import assert from 'node:assert/strict';
import {invoiceSuggestions} from '../lib/invoice-suggestions';
import {customInvoiceSuggestionSchema,invoiceSuggestionKey,savedInvoiceSuggestion} from '../lib/invoice-suggestions';
import {calculateInvoice,validateForIssue} from '../lib/invoice-calculations';
import {fixture} from './invoice-accounting.test';

test('invoice suggestions use real INR catalogue names and prices plus unpriced machine presets',()=>{
 const rows=invoiceSuggestions([{id:'aventus',name:'Aventus',inspiration:'Creed Aventus',size:'50ml',price:'799.00',category:'Perfume',priceCurrency:'INR'},{id:'export',name:'Export',price:20,priceCurrency:'USD'}]);
 assert.equal(rows.find(row=>row.id==='aventus')?.price,799);
 assert.ok(rows.find(row=>row.id==='aventus')?.search.includes('creed'));
 assert.equal(rows.some(row=>row.id==='export'),false);
 for(const name of ['Fragrance oil','Diffuser machine','400 mL diffuser machine','800 mL diffuser machine','200 mL tower diffuser','800 mL tower diffuser'])assert.equal(rows.find(row=>row.name===name)?.price,null);
});
test('explicit no-GST mode charges no tax even with saved exclusive item and shipping rates',()=>{
 const document={...fixture,taxMode:'none' as const,priceMode:'exclusive' as const,sellerGstin:'',buyerGstin:'',placeOfSupply:'',placeOfSupplyCode:'',shippingFee:50,shippingGstPercent:18,items:[{...fixture.items[0],price:200,hsnSac:undefined,gstPercent:18}],amountReceived:0};
 const result=calculateInvoice(document);
 assert.equal(result.grandTotal,250);assert.equal(result.totalGst,0);assert.equal(result.cgst,0);assert.equal(result.sgst,0);assert.equal(result.igst,0);assert.equal(result.shippingTax,0);
 assert.deepEqual(validateForIssue(document),[]);
 assert.equal(calculateInvoice({...document,items:[{...document.items[0],price:0}],shippingFee:0}).grandTotal,0);
});
test('custom item names preserve sizes and deduplicate only equivalent name/unit combinations',()=>{
 const item=customInvoiceSuggestionSchema.parse({name:' White tea fragrance oil(100gm) ',category:'oil',unit:'pcs',price:200});
 const saved=savedInvoiceSuggestion({...item,id:'fixture'});
 assert.equal(saved?.name,'White tea fragrance oil(100gm)');assert.equal(saved?.price,200);
 assert.equal(invoiceSuggestionKey(' White   Tea (100gm) ','pcs'),invoiceSuggestionKey('white tea (100gm)','pcs'));
 assert.notEqual(invoiceSuggestionKey('White tea (100gm)','pcs'),invoiceSuggestionKey('White tea (200gm)','pcs'));
 assert.equal(customInvoiceSuggestionSchema.safeParse({...item,price:-1}).success,false);
 assert.equal(customInvoiceSuggestionSchema.safeParse({...item,name:''}).success,false);
});
