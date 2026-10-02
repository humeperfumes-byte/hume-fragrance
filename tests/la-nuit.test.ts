import assert from "node:assert/strict";
import test from "node:test";
import { LA_NUIT_PRODUCT } from "../lib/la-nuit";
import { getProductSchema, getProductFaqItems, getProductFAQSchema } from "../lib/seo";
import { getProductPath } from "../lib/product-route";

test("La Nuit is a sold-out HUME product with no fabricated product photography or reviews", () => {
  const schema = getProductSchema(LA_NUIT_PRODUCT);
  assert.equal(schema.brand.name, "HUME Fragrance");
  assert.equal(schema.offers.availability, "https://schema.org/OutOfStock");
  assert.equal(schema.offers.price, "799.00");
  assert.equal(schema.image, undefined);
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(LA_NUIT_PRODUCT.size, "50ml");
  assert.equal(LA_NUIT_PRODUCT.badges?.showInDiscoverySet, false);
  assert.equal(getProductPath(LA_NUIT_PRODUCT), "/product/hume-la-nuit-inspired-by-yves-saint-laurent-la-nuit-de-l-homme-eau-de-toilette");
  assert.ok(getProductSchema({ ...LA_NUIT_PRODUCT, images: ["/images/la-nuit.jpg"] }).image?.[0].endsWith("/images/la-nuit.jpg"));
});

test("La Nuit FAQs match schema and disclose pending HUME performance evidence", () => {
  const faqs = getProductFaqItems(LA_NUIT_PRODUCT);
  assert.deepEqual(getProductFAQSchema(LA_NUIT_PRODUCT).mainEntity.map((question) => question.acceptedAnswer.text), faqs.map((faq) => faq.answer));
  assert.ok(faqs.some((faq) => faq.answer.includes("Yves Saint Laurent")));
  assert.ok(faqs.some((faq) => faq.answer.includes("out of stock")));
  assert.ok(faqs.some((faq) => faq.answer.includes("not yet published")));
  assert.ok(!JSON.stringify(faqs).includes("7-9 hours"));
});
