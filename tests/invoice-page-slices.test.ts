import test from 'node:test';
import assert from 'node:assert/strict';
import {invoicePageSlices} from '../lib/invoice-page-slices';
test('one preview page stays one page without adding footer space',()=>{assert.deepEqual(invoicePageSlices(1122,1123,[]),[{top:0,height:1122}]);});
test('long previews break before a row and keep every pixel exactly once',()=>{const slices=invoicePageSlices(2400,1100,[{top:1000,bottom:1200}]);assert.deepEqual(slices,[{top:0,height:1000},{top:1000,height:1100},{top:2100,height:300}]);assert.equal(slices.reduce((sum,s)=>sum+s.height,0),2400);});
test('a paragraph taller than a page cannot create an empty page or infinite loop',()=>{const slices=invoicePageSlices(2400,1100,[{top:20,bottom:2300}]);assert.equal(slices.length,3);assert.equal(slices[0].height,1100);});
