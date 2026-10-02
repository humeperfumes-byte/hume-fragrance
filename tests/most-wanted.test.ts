import assert from "node:assert/strict";
import test from "node:test";
import { MOST_WANTED_PRODUCT } from "../lib/most-wanted";
import { getProductSchema, getProductFaqItems, getProductFAQSchema } from "../lib/seo";
import { getProductPath } from "../lib/product-route";

test("Most Wanted is a sold-out HUME product with no fabricated product photography or reviews", () => {
  const schema = getProductSchema(MOST_WANTED_PRODUCT);
  assert.equal(schema.brand.name, "HUME Fragrance");
  assert.equal(schema.offers.availability, "https://schema.org/OutOfStock");
  assert.equal(schema.offers.price, "799.00");
  assert.equal(schema.image, undefined);
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(MOST_WANTED_PRODUCT.size, "50ml");
  assert.equal(MOST_WANTED_PRODUCT.badges?.showInDiscoverySet, false);
  assert.equal(getProductPath(MOST_WANTED_PRODUCT), "/product/hume-most-wanted-inspired-by-azzaro-the-most-wanted-parfum");
  assert.ok(getProductSchema({ ...MOST_WANTED_PRODUCT, images: ["/images/most-wanted.jpg"] }).image?.[0].endsWith("/images/most-wanted.jpg"));
});

test("Most Wanted FAQs match schema and disclose pending HUME performance evidence", () => {
  const faqs = getProductFaqItems(MOST_WANTED_PRODUCT);
  assert.deepEqual(getProductFAQSchema(MOST_WANTED_PRODUCT).mainEntity.map((question) => question.acceptedAnswer.text), faqs.map((faq) => faq.answer));
  assert.ok(faqs.some((faq) => faq.answer.includes("Azzaro")));
  assert.ok(faqs.some((faq) => faq.answer.includes("out of stock")));
  assert.ok(faqs.some((faq) => faq.answer.includes("not yet published")));
  assert.ok(!JSON.stringify(faqs).includes("7-9 hours"));
});
