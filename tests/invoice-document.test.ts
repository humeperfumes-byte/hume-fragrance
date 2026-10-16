import test from "node:test";
import assert from "node:assert/strict";
import { invoiceDocumentSchema, duplicateInvoice, type InvoiceDocument } from "../lib/invoice-document";
const invoice: InvoiceDocument = {
  sellerName: "HUME", sellerAddress: "Seller address", sellerEmail: "", sellerPhone: "", sellerGstin: "",
  buyerName: "Test business", buyerAddress: "Buyer address", buyerEmail: "", buyerPhone: "", buyerGstin: "",
  invoiceNumber: "HF-TEST", invoiceDate: "2026-10-03", paymentStatus: "Paid", showPaymentStatus: true,
  items: [{ id: "machine", category: "machine", unit: "pcs", name: "400ml diffuser", quantity: 1, price: 4000, gstPercent: 18 }, { id: "samples", category: "sample", unit: "set", name: "Three samples", quantity: 1, price: 0, gstPercent: 18 }],
  shippingFee: 350, targetGrandTotal: "", bankDetails: "Bank details", terms: "Terms", notes: "Note",
};
test("invoice saving preserves custom machine and free sample details with all editor fields", () => {
  assert.deepEqual(invoiceDocumentSchema.parse(JSON.parse(JSON.stringify(invoice))), invoice);
});
test("reuse creates a new identity, resets payment status and does not mutate the saved invoice", () => {
  const copy = duplicateInvoice(invoice);
  assert.notEqual(copy.invoiceNumber, invoice.invoiceNumber);
  assert.notEqual(copy.items[0].id, invoice.items[0].id);
  assert.equal(copy.paymentStatus, "Unpaid");
  assert.equal(copy.buyerName, invoice.buyerName);
  assert.equal(copy.items[0].price, 4000);
  copy.items[0].name = "Changed";
  assert.equal(invoice.items[0].name, "400ml diffuser");
});
test("saved invoices reject missing buyers, item descriptions and invalid numeric input", () => {
  assert.equal(invoiceDocumentSchema.safeParse({ ...invoice, buyerName: "" }).success, false);
  assert.equal(invoiceDocumentSchema.safeParse({ ...invoice, items: [{ ...invoice.items[0], quantity: -1 }] }).success, false);
  assert.equal(invoiceDocumentSchema.safeParse({ ...invoice, items: [{ ...invoice.items[0], name: "" }] }).success, false);
  assert.equal(invoiceDocumentSchema.safeParse({ ...invoice, shippingFee: -1 }).success, false);
});
test("payment status visibility persists in saved copies and defaults to hidden when visibility is unspecified", () => {
  assert.equal(invoiceDocumentSchema.parse({ ...invoice, showPaymentStatus: undefined }).showPaymentStatus, false);
  const hidden = invoiceDocumentSchema.parse({ ...invoice, showPaymentStatus: false });
  assert.equal(hidden.showPaymentStatus, false);
  assert.equal(duplicateInvoice(hidden).showPaymentStatus, false);
  assert.equal(hidden.paymentStatus, "Paid");
});
