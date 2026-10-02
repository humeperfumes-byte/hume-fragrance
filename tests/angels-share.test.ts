import assert from "node:assert/strict";
import test from "node:test";
import { ANGELS_SHARE_PRODUCT } from "../lib/angels-share";
import { getProductSchema, getProductFaqItems, getProductFAQSchema } from "../lib/seo";
import { getProductPath } from "../lib/product-route";

test("Angels Share is a sold-out HUME product with no fabricated product photography or reviews", () => {
  const schema = getProductSchema(ANGELS_SHARE_PRODUCT);
  assert.equal(schema.brand.name, "HUME Fragrance");
  assert.equal(schema.offers.availability, "https://schema.org/OutOfStock");
  assert.equal(schema.offers.price, "799.00");
  assert.equal(schema.image, undefined);
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(ANGELS_SHARE_PRODUCT.size, "50ml");
  assert.equal(ANGELS_SHARE_PRODUCT.badges?.showInDiscoverySet, false);
  assert.equal(getProductPath(ANGELS_SHARE_PRODUCT), "/product/hume-angels-share-inspired-by-kilian-angels-share");
  assert.ok(getProductSchema({ ...ANGELS_SHARE_PRODUCT, images: ["/images/angels-share.jpg"] }).image?.[0].endsWith("/images/angels-share.jpg"));
});

test("Angels Share FAQs match schema and disclose pending HUME performance evidence", () => {
  const faqs = getProductFaqItems(ANGELS_SHARE_PRODUCT);
  assert.deepEqual(getProductFAQSchema(ANGELS_SHARE_PRODUCT).mainEntity.map((question) => question.acceptedAnswer.text), faqs.map((faq) => faq.answer));
  assert.ok(faqs.some((faq) => faq.answer.includes("Kilian")));
  assert.ok(faqs.some((faq) => faq.answer.includes("out of stock")));
  assert.ok(faqs.some((faq) => faq.answer.includes("not yet published")));
  assert.ok(!JSON.stringify(faqs).includes("7-9 hours"));
});
