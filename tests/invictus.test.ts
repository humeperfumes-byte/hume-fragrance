import assert from "node:assert/strict";
import test from "node:test";
import { INVICTUS_PRODUCT } from "../lib/invictus";
import { getProductSchema, getProductFaqItems, getProductFAQSchema } from "../lib/seo";
import { getProductPath } from "../lib/product-route";

test("Invictus is a sold-out HUME product with no fabricated product photography or reviews", () => {
  const schema = getProductSchema(INVICTUS_PRODUCT);
  assert.equal(schema.brand.name, "HUME Fragrance");
  assert.equal(schema.offers.availability, "https://schema.org/OutOfStock");
  assert.equal(schema.offers.price, "799.00");
  assert.equal(schema.image, undefined);
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(INVICTUS_PRODUCT.size, "50ml");
  assert.equal(INVICTUS_PRODUCT.badges?.showInDiscoverySet, false);
  assert.equal(getProductPath(INVICTUS_PRODUCT), "/product/hume-invictus-inspired-by-rabanne-invictus-eau-de-toilette");
  assert.ok(getProductSchema({ ...INVICTUS_PRODUCT, images: ["/images/invictus.jpg"] }).image?.[0].endsWith("/images/invictus.jpg"));
});

test("Invictus FAQs match schema and disclose pending HUME performance evidence", () => {
  const faqs = getProductFaqItems(INVICTUS_PRODUCT);
  assert.deepEqual(getProductFAQSchema(INVICTUS_PRODUCT).mainEntity.map((question) => question.acceptedAnswer.text), faqs.map((faq) => faq.answer));
  assert.ok(faqs.some((faq) => faq.answer.includes("Rabanne")));
  assert.ok(faqs.some((faq) => faq.answer.includes("out of stock")));
  assert.ok(faqs.some((faq) => faq.answer.includes("not yet published")));
  assert.ok(!JSON.stringify(faqs).includes("7-9 hours"));
});
