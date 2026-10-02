import assert from "node:assert/strict";
import test from "node:test";
import { JADORE_PRODUCT } from "../lib/jadore";
import { getProductSchema, getProductFaqItems, getProductFAQSchema } from "../lib/seo";
import { getProductPath } from "../lib/product-route";

test("Jadore is a sold-out HUME product with no fabricated product photography or reviews", () => {
  const schema = getProductSchema(JADORE_PRODUCT);
  assert.equal(schema.brand.name, "HUME Fragrance");
  assert.equal(schema.offers.availability, "https://schema.org/OutOfStock");
  assert.equal(schema.offers.price, "799.00");
  assert.equal(schema.image, undefined);
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(JADORE_PRODUCT.size, "50ml");
  assert.equal(JADORE_PRODUCT.badges?.showInDiscoverySet, false);
  assert.equal(getProductPath(JADORE_PRODUCT), "/product/hume-j-adore-inspired-by-dior-j-adore-eau-de-parfum");
  assert.ok(getProductSchema({ ...JADORE_PRODUCT, images: ["/images/jadore.jpg"] }).image?.[0].endsWith("/images/jadore.jpg"));
});

test("Jadore FAQs match schema and disclose pending HUME performance evidence", () => {
  const faqs = getProductFaqItems(JADORE_PRODUCT);
  assert.deepEqual(getProductFAQSchema(JADORE_PRODUCT).mainEntity.map((question) => question.acceptedAnswer.text), faqs.map((faq) => faq.answer));
  assert.ok(faqs.some((faq) => faq.answer.includes("Dior")));
  assert.ok(faqs.some((faq) => faq.answer.includes("out of stock")));
  assert.ok(faqs.some((faq) => faq.answer.includes("not yet published")));
  assert.ok(!JSON.stringify(faqs).includes("7-9 hours"));
});
