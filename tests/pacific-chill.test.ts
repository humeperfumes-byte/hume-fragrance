import assert from "node:assert/strict";
import test from "node:test";
import { PACIFIC_CHILL_PRODUCT } from "../lib/pacific-chill";
import { getProductSchema, getProductFaqItems, getProductFAQSchema } from "../lib/seo";
import { getProductPath } from "../lib/product-route";

test("Pacific Chill is a sold-out HUME product with no fabricated product photography or reviews", () => {
  const schema = getProductSchema(PACIFIC_CHILL_PRODUCT);
  assert.equal(schema.brand.name, "HUME Fragrance");
  assert.equal(schema.offers.availability, "https://schema.org/OutOfStock");
  assert.equal(schema.offers.price, "799.00");
  assert.equal(schema.image, undefined);
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(PACIFIC_CHILL_PRODUCT.size, "50ml");
  assert.equal(PACIFIC_CHILL_PRODUCT.badges?.showInDiscoverySet, false);
  assert.equal(getProductPath(PACIFIC_CHILL_PRODUCT), "/product/hume-pacific-chill-inspired-by-louis-vuitton-pacific-chill");
  assert.ok(getProductSchema({ ...PACIFIC_CHILL_PRODUCT, images: ["/images/pacific-chill.jpg"] }).image?.[0].endsWith("/images/pacific-chill.jpg"));
});

test("Pacific Chill FAQs match schema and disclose pending HUME performance evidence", () => {
  const faqs = getProductFaqItems(PACIFIC_CHILL_PRODUCT);
  assert.deepEqual(getProductFAQSchema(PACIFIC_CHILL_PRODUCT).mainEntity.map((question) => question.acceptedAnswer.text), faqs.map((faq) => faq.answer));
  assert.ok(faqs.some((faq) => faq.answer.includes("Louis Vuitton")));
  assert.ok(faqs.some((faq) => faq.answer.includes("out of stock")));
  assert.ok(faqs.some((faq) => faq.answer.includes("not yet published")));
  assert.ok(!JSON.stringify(faqs).includes("7-9 hours"));
});
