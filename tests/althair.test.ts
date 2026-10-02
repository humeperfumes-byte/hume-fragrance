import assert from "node:assert/strict";
import test from "node:test";
import { ALTHAIR_PRODUCT } from "../lib/althair";
import { getProductSchema, getProductFaqItems, getProductFAQSchema } from "../lib/seo";
import { getProductPath } from "../lib/product-route";

test("Althair is a sold-out HUME product with no fabricated product photography or reviews", () => {
  const schema = getProductSchema(ALTHAIR_PRODUCT);
  assert.equal(schema.brand.name, "HUME Fragrance");
  assert.equal(schema.offers.availability, "https://schema.org/OutOfStock");
  assert.equal(schema.offers.price, "799.00");
  assert.equal(schema.image, undefined);
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(ALTHAIR_PRODUCT.size, "50ml");
  assert.equal(ALTHAIR_PRODUCT.badges?.showInDiscoverySet, false);
  assert.equal(getProductPath(ALTHAIR_PRODUCT), "/product/hume-althair-inspired-by-parfums-de-marly-althair");
  assert.ok(getProductSchema({ ...ALTHAIR_PRODUCT, images: ["/images/althair.jpg"] }).image?.[0].endsWith("/images/althair.jpg"));
});

test("Althair FAQs match schema and disclose pending HUME performance evidence", () => {
  const faqs = getProductFaqItems(ALTHAIR_PRODUCT);
  assert.deepEqual(getProductFAQSchema(ALTHAIR_PRODUCT).mainEntity.map((question) => question.acceptedAnswer.text), faqs.map((faq) => faq.answer));
  assert.ok(faqs.some((faq) => faq.answer.includes("Parfums de Marly")));
  assert.ok(faqs.some((faq) => faq.answer.includes("out of stock")));
  assert.ok(faqs.some((faq) => faq.answer.includes("not yet published")));
  assert.ok(!JSON.stringify(faqs).includes("7-9 hours"));
});
