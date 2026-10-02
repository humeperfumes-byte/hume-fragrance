import assert from "node:assert/strict";
import test from "node:test";
import { TOBACCO_VANILLE_PRODUCT } from "../lib/tobacco-vanille";
import { getProductSchema, getProductFaqItems, getProductFAQSchema } from "../lib/seo";
import { getProductPath } from "../lib/product-route";

test("Tobacco Vanille is a sold-out HUME product with no fabricated product photography or reviews", () => {
  const schema = getProductSchema(TOBACCO_VANILLE_PRODUCT);
  assert.equal(schema.brand.name, "HUME Fragrance");
  assert.equal(schema.offers.availability, "https://schema.org/OutOfStock");
  assert.equal(schema.offers.price, "799.00");
  assert.equal(schema.image, undefined);
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(TOBACCO_VANILLE_PRODUCT.size, "50ml");
  assert.equal(TOBACCO_VANILLE_PRODUCT.badges?.showInDiscoverySet, false);
  assert.equal(getProductPath(TOBACCO_VANILLE_PRODUCT), "/product/hume-tobacco-vanille-inspired-by-tom-ford-tobacco-vanille");
  assert.ok(getProductSchema({ ...TOBACCO_VANILLE_PRODUCT, images: ["/images/tobacco-vanille.jpg"] }).image?.[0].endsWith("/images/tobacco-vanille.jpg"));
});

test("Tobacco Vanille FAQs match schema and disclose pending HUME performance evidence", () => {
  const faqs = getProductFaqItems(TOBACCO_VANILLE_PRODUCT);
  assert.deepEqual(getProductFAQSchema(TOBACCO_VANILLE_PRODUCT).mainEntity.map((question) => question.acceptedAnswer.text), faqs.map((faq) => faq.answer));
  assert.ok(faqs.some((faq) => faq.answer.includes("Tom Ford")));
  assert.ok(faqs.some((faq) => faq.answer.includes("out of stock")));
  assert.ok(faqs.some((faq) => faq.answer.includes("not yet published")));
  assert.ok(!JSON.stringify(faqs).includes("7-9 hours"));
});
