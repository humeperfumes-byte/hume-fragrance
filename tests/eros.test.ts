import assert from "node:assert/strict";
import test from "node:test";
import { EROS_PRODUCT } from "../lib/eros";
import { getProductSchema, getProductFaqItems, getProductFAQSchema } from "../lib/seo";
import { getProductPath } from "../lib/product-route";

test("Eros is a sold-out HUME product with no fabricated product photography or reviews", () => {
  const schema = getProductSchema(EROS_PRODUCT);
  assert.equal(schema.brand.name, "HUME Fragrance");
  assert.equal(schema.offers.availability, "https://schema.org/OutOfStock");
  assert.equal(schema.offers.price, "799.00");
  assert.equal(schema.image, undefined);
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(EROS_PRODUCT.size, "50ml");
  assert.equal(EROS_PRODUCT.badges?.showInDiscoverySet, false);
  assert.equal(getProductPath(EROS_PRODUCT), "/product/hume-eros-inspired-by-versace-eros-eau-de-parfum");
  assert.ok(getProductSchema({ ...EROS_PRODUCT, images: ["/images/eros.jpg"] }).image?.[0].endsWith("/images/eros.jpg"));
});

test("Eros FAQs match schema and disclose pending HUME performance evidence", () => {
  const faqs = getProductFaqItems(EROS_PRODUCT);
  assert.deepEqual(getProductFAQSchema(EROS_PRODUCT).mainEntity.map((question) => question.acceptedAnswer.text), faqs.map((faq) => faq.answer));
  assert.ok(faqs.some((faq) => faq.answer.includes("Versace")));
  assert.ok(faqs.some((faq) => faq.answer.includes("out of stock")));
  assert.ok(faqs.some((faq) => faq.answer.includes("not yet published")));
  assert.ok(!JSON.stringify(faqs).includes("7-9 hours"));
});
