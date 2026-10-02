import assert from "node:assert/strict";
import test from "node:test";
import { HUGO_BOSS_PRODUCT } from "../lib/hugo-boss";
import { getProductSchema, getProductFaqItems, getProductFAQSchema } from "../lib/seo";
import { getProductPath } from "../lib/product-route";

test("Hugo Boss Man is a sold-out HUME product with no fabricated product photography or reviews", () => {
  const schema = getProductSchema(HUGO_BOSS_PRODUCT);
  assert.equal(schema.brand.name, "HUME Fragrance");
  assert.equal(schema.offers.availability, "https://schema.org/OutOfStock");
  assert.equal(schema.offers.price, "799.00");
  assert.equal(schema.image, undefined);
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(HUGO_BOSS_PRODUCT.size, "50ml");
  assert.equal(HUGO_BOSS_PRODUCT.badges?.showInDiscoverySet, false);
  assert.equal(getProductPath(HUGO_BOSS_PRODUCT), "/product/hume-hugo-boss-man-inspired-by-hugo-boss-hugo-man");
  assert.ok(getProductSchema({ ...HUGO_BOSS_PRODUCT, images: ["/images/hugo-boss.jpg"] }).image?.[0].endsWith("/images/hugo-boss.jpg"));
});

test("Hugo Boss Man FAQs match schema and disclose pending HUME performance evidence", () => {
  const faqs = getProductFaqItems(HUGO_BOSS_PRODUCT);
  assert.deepEqual(getProductFAQSchema(HUGO_BOSS_PRODUCT).mainEntity.map((question) => question.acceptedAnswer.text), faqs.map((faq) => faq.answer));
  assert.ok(faqs.some((faq) => faq.answer.includes("Hugo Boss")));
  assert.ok(faqs.some((faq) => faq.answer.includes("out of stock")));
  assert.ok(faqs.some((faq) => faq.answer.includes("not yet published")));
  assert.ok(!JSON.stringify(faqs).includes("7-9 hours"));
});
