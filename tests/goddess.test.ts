import assert from "node:assert/strict";
import test from "node:test";
import { GODDESS_PRODUCT } from "../lib/goddess";
import { getProductSchema, getProductFaqItems, getProductFAQSchema } from "../lib/seo";
import { getProductPath } from "../lib/product-route";

test("Goddess is a sold-out HUME product with no fabricated product photography or reviews", () => {
  const schema = getProductSchema(GODDESS_PRODUCT);
  assert.equal(schema.brand.name, "HUME Fragrance");
  assert.equal(schema.offers.availability, "https://schema.org/OutOfStock");
  assert.equal(schema.offers.price, "799.00");
  assert.equal(schema.image, undefined);
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(GODDESS_PRODUCT.size, "50ml");
  assert.equal(GODDESS_PRODUCT.badges?.showInDiscoverySet, false);
  assert.equal(getProductPath(GODDESS_PRODUCT), "/product/hume-goddess-inspired-by-burberry-goddess-eau-de-parfum");
  assert.ok(getProductSchema({ ...GODDESS_PRODUCT, images: ["/images/goddess.jpg"] }).image?.[0].endsWith("/images/goddess.jpg"));
});

test("Goddess FAQs match schema and disclose pending HUME performance evidence", () => {
  const faqs = getProductFaqItems(GODDESS_PRODUCT);
  assert.deepEqual(getProductFAQSchema(GODDESS_PRODUCT).mainEntity.map((question) => question.acceptedAnswer.text), faqs.map((faq) => faq.answer));
  assert.ok(faqs.some((faq) => faq.answer.includes("Burberry")));
  assert.ok(faqs.some((faq) => faq.answer.includes("out of stock")));
  assert.ok(faqs.some((faq) => faq.answer.includes("not yet published")));
  assert.ok(!JSON.stringify(faqs).includes("7-9 hours"));
});
