import assert from "node:assert/strict";
import test from "node:test";
import { NOIR_EXTREME_PRODUCT } from "../lib/noir-extreme";
import { getProductSchema, getProductFaqItems, getProductFAQSchema } from "../lib/seo";
import { getProductPath } from "../lib/product-route";

test("Noir Extreme is a sold-out HUME product with no fabricated product photography or reviews", () => {
  const schema = getProductSchema(NOIR_EXTREME_PRODUCT);
  assert.equal(schema.brand.name, "HUME Fragrance");
  assert.equal(schema.offers.availability, "https://schema.org/OutOfStock");
  assert.equal(schema.offers.price, "799.00");
  assert.equal(schema.image, undefined);
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(NOIR_EXTREME_PRODUCT.size, "50ml");
  assert.equal(NOIR_EXTREME_PRODUCT.badges?.showInDiscoverySet, false);
  assert.equal(getProductPath(NOIR_EXTREME_PRODUCT), "/product/hume-noir-extreme-inspired-by-tom-ford-noir-extreme");
  assert.ok(getProductSchema({ ...NOIR_EXTREME_PRODUCT, images: ["/images/noir-extreme.jpg"] }).image?.[0].endsWith("/images/noir-extreme.jpg"));
});

test("Noir Extreme FAQs match schema and disclose pending HUME performance evidence", () => {
  const faqs = getProductFaqItems(NOIR_EXTREME_PRODUCT);
  assert.deepEqual(getProductFAQSchema(NOIR_EXTREME_PRODUCT).mainEntity.map((question) => question.acceptedAnswer.text), faqs.map((faq) => faq.answer));
  assert.ok(faqs.some((faq) => faq.answer.includes("Tom Ford")));
  assert.ok(faqs.some((faq) => faq.answer.includes("out of stock")));
  assert.ok(faqs.some((faq) => faq.answer.includes("not yet published")));
  assert.ok(!JSON.stringify(faqs).includes("7-9 hours"));
});
