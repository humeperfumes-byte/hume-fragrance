import test from "node:test";
import assert from "node:assert/strict";
import {sameInvoiceCustomer} from "../lib/invoice-reuse";
const customer={name:"Acme Stores",address:"Kanpur",email:"buyer@example.com",phone:"9559024822",gstin:""};
test("customer matching normalizes names, contacts and Indian phone country codes",()=>{
  assert.ok(sameInvoiceCustomer(customer,{...customer,name:"  ACME   stores ",phone:"+91 95590 24822"}));
  assert.ok(sameInvoiceCustomer({...customer,email:"",phone:""},{...customer,email:"",phone:""}));
  assert.ok(sameInvoiceCustomer(customer,{...customer,email:"",phone:""}));
  assert.ok(sameInvoiceCustomer({...customer,gstin:"09ABCDE1234F1Z5"},{...customer,name:"New legal name",gstin:"09ABCDE1234F1Z5"}));
});
test("different identities are not merged by name alone",()=>{
  assert.equal(sameInvoiceCustomer(customer,{...customer,email:"different@example.com",phone:"9999999999",address:"Delhi"}),false);
  assert.equal(sameInvoiceCustomer({...customer,gstin:"09ABCDE1234F1Z5"},{...customer,gstin:"27ABCDE1234F1Z5"}),false);
  assert.equal(sameInvoiceCustomer({...customer,email:"",phone:""},{...customer,email:"",phone:"",address:"Delhi"}),false);
});
