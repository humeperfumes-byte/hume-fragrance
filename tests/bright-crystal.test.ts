import assert from "node:assert/strict";
import test from "node:test";
import { BRIGHT_CRYSTAL_PRODUCT } from "../lib/bright-crystal";
import { getProductSchema, getProductFaqItems, getProductFAQSchema } from "../lib/seo";
import { getProductPath } from "../lib/product-route";

test("Bright Crystal is a sold-out HUME product with no fabricated product photography or reviews", () => {
  const schema = getProductSchema(BRIGHT_CRYSTAL_PRODUCT);
  assert.equal(schema.brand.name, "HUME Fragrance");
  assert.equal(schema.offers.availability, "https://schema.org/OutOfStock");
  assert.equal(schema.offers.price, "799.00");
  assert.equal(schema.image, undefined);
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(BRIGHT_CRYSTAL_PRODUCT.size, "50ml");
  assert.equal(BRIGHT_CRYSTAL_PRODUCT.badges?.showInDiscoverySet, false);
  assert.equal(getProductPath(BRIGHT_CRYSTAL_PRODUCT), "/product/hume-bright-crystal-inspired-by-versace-bright-crystal");
  assert.ok(getProductSchema({ ...BRIGHT_CRYSTAL_PRODUCT, images: ["/images/bright-crystal.jpg"] }).image?.[0].endsWith("/images/bright-crystal.jpg"));
});

test("Bright Crystal FAQs match schema and disclose pending HUME performance evidence", () => {
  const faqs = getProductFaqItems(BRIGHT_CRYSTAL_PRODUCT);
  assert.deepEqual(getProductFAQSchema(BRIGHT_CRYSTAL_PRODUCT).mainEntity.map((question) => question.acceptedAnswer.text), faqs.map((faq) => faq.answer));
  assert.ok(faqs.some((faq) => faq.answer.includes("Versace")));
  assert.ok(faqs.some((faq) => faq.answer.includes("out of stock")));
  assert.ok(faqs.some((faq) => faq.answer.includes("not yet published")));
  assert.ok(!JSON.stringify(faqs).includes("7-9 hours"));
});
