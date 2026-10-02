import assert from "node:assert/strict";
import test from "node:test";
import { ONE_MILLION_PRODUCT } from "../lib/one-million";
import { getProductSchema, getProductFaqItems, getProductFAQSchema } from "../lib/seo";
import { getProductPath } from "../lib/product-route";

test("1 Million is a sold-out HUME product with no fabricated product photography or reviews", () => {
  const schema = getProductSchema(ONE_MILLION_PRODUCT);
  assert.equal(schema.brand.name, "HUME Fragrance");
  assert.equal(schema.offers.availability, "https://schema.org/OutOfStock");
  assert.equal(schema.offers.price, "799.00");
  assert.equal(schema.image, undefined);
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(ONE_MILLION_PRODUCT.size, "50ml");
  assert.equal(ONE_MILLION_PRODUCT.badges?.showInDiscoverySet, false);
  assert.equal(getProductPath(ONE_MILLION_PRODUCT), "/product/hume-1-million-inspired-by-rabanne-1-million-eau-de-toilette");
  assert.ok(getProductSchema({ ...ONE_MILLION_PRODUCT, images: ["/images/one-million.jpg"] }).image?.[0].endsWith("/images/one-million.jpg"));
});

test("1 Million FAQs match schema and disclose pending HUME performance evidence", () => {
  const faqs = getProductFaqItems(ONE_MILLION_PRODUCT);
  assert.deepEqual(getProductFAQSchema(ONE_MILLION_PRODUCT).mainEntity.map((question) => question.acceptedAnswer.text), faqs.map((faq) => faq.answer));
  assert.ok(faqs.some((faq) => faq.answer.includes("Rabanne")));
  assert.ok(faqs.some((faq) => faq.answer.includes("out of stock")));
  assert.ok(faqs.some((faq) => faq.answer.includes("not yet published")));
  assert.ok(!JSON.stringify(faqs).includes("7-9 hours"));
});
