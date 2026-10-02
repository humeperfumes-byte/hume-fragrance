import assert from "node:assert/strict";
import test from "node:test";
import { HER_PRODUCT } from "../lib/her";
import { getProductSchema, getProductFaqItems, getProductFAQSchema } from "../lib/seo";
import { getProductPath } from "../lib/product-route";

test("Her is a sold-out HUME product with no fabricated product photography or reviews", () => {
  const schema = getProductSchema(HER_PRODUCT);
  assert.equal(schema.brand.name, "HUME Fragrance");
  assert.equal(schema.offers.availability, "https://schema.org/OutOfStock");
  assert.equal(schema.offers.price, "799.00");
  assert.equal(schema.image, undefined);
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(HER_PRODUCT.size, "50ml");
  assert.equal(HER_PRODUCT.badges?.showInDiscoverySet, false);
  assert.equal(getProductPath(HER_PRODUCT), "/product/hume-her-inspired-by-burberry-burberry-her");
  assert.ok(getProductSchema({ ...HER_PRODUCT, images: ["/images/her.jpg"] }).image?.[0].endsWith("/images/her.jpg"));
});

test("Her FAQs match schema and disclose pending HUME performance evidence", () => {
  const faqs = getProductFaqItems(HER_PRODUCT);
  assert.deepEqual(getProductFAQSchema(HER_PRODUCT).mainEntity.map((question) => question.acceptedAnswer.text), faqs.map((faq) => faq.answer));
  assert.ok(faqs.some((faq) => faq.answer.includes("Burberry")));
  assert.ok(faqs.some((faq) => faq.answer.includes("out of stock")));
  assert.ok(faqs.some((faq) => faq.answer.includes("not yet published")));
  assert.ok(!JSON.stringify(faqs).includes("7-9 hours"));
});
