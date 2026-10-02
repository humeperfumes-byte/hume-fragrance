import assert from "node:assert/strict";
import test from "node:test";
import { NIGHT_OUT_PRODUCT, NIGHT_OUT_IMAGE_PLACEHOLDER } from "../lib/night-out";
import { getProductSchema, getProductFAQSchema, getProductFaqItems } from "../lib/seo";
import { getProductPath } from "../lib/product-route";

test("Night Out is an out-of-stock 50ml HUME perfume, not the original Afnan bottle", () => {
  const schema = getProductSchema(NIGHT_OUT_PRODUCT);
  assert.equal(schema.offers.availability, "https://schema.org/OutOfStock");
  assert.equal(schema.offers.price, "799.00");
  assert.equal(schema.brand.name, "HUME Fragrance");
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(schema.image, undefined);
  assert.equal(NIGHT_OUT_PRODUCT.badges?.showInDiscoverySet, false);
  assert.equal(getProductPath(NIGHT_OUT_PRODUCT), "/product/hume-night-out-inspired-by-afnan-9-pm-night-out");
  const withPhotography = getProductSchema({ ...NIGHT_OUT_PRODUCT, images: ["/images/night-out.jpg"] });
  assert.ok(withPhotography.image?.[0].endsWith("/images/night-out.jpg"));
  assert.notEqual(withPhotography.image?.[0], NIGHT_OUT_IMAGE_PLACEHOLDER);
});

test("visible FAQs and FAQ schema agree and do not invent tested performance", () => {
  const faqs = getProductFaqItems(NIGHT_OUT_PRODUCT);
  const schema = getProductFAQSchema(NIGHT_OUT_PRODUCT);
  assert.deepEqual(schema.mainEntity.map((question) => question.acceptedAnswer.text), faqs.map((faq) => faq.answer));
  assert.ok(faqs.some((faq) => faq.answer.includes("out of stock")));
  assert.ok(faqs.some((faq) => faq.answer.includes("not yet published")));
  assert.ok(!JSON.stringify(faqs).includes("8-10 hours"));
});
