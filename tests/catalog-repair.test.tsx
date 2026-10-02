import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd } from "../components/JsonLd";
import { getUnavailableProduct, UNAVAILABLE_PRODUCTS } from "../lib/unavailable-products";
import { getProductSeoSlug } from "../lib/product-route";
import { PRODUCT_ROUTE_ALIASES } from "../lib/product-route-aliases";

test("structured data exists in initial HTML and cannot close its script", () => {
  const html = renderToStaticMarkup(<JsonLd data={{ "@type": "Product", name: "</script><script>alert(1)</script>" }} />);
  assert.match(html, /type="application\/ld\+json"/);
  const json = html.match(/<script[^>]*>(.*?)<\/script>/)?.[1];
  assert.ok(json);
  assert.equal(JSON.parse(json).name, "</script><script>alert(1)</script>");
  assert.equal((html.match(/<script/g) ?? []).length, 1);
});

test("removed IDs and historical SEO URLs resolve without inventing sale records", () => {
  for (const product of UNAVAILABLE_PRODUCTS) {
    assert.equal(getUnavailableProduct(product.id)?.id, product.id);
    assert.equal(getUnavailableProduct(getProductSeoSlug(product))?.id, product.id);
  }
  assert.equal(getUnavailableProduct("sauvage-noir"), undefined);
  assert.equal(getUnavailableProduct("creed-aventus"), undefined);
  assert.equal(getUnavailableProduct("unknown"), undefined);
  assert.equal(getUnavailableProduct("hume-althair-inspired-by-parfums-de-marly-althair")?.id, "althair");
  assert.equal(PRODUCT_ROUTE_ALIASES["hume-aqua-inspired-by-giorgio-armani-acqua-di-gio-profondo"], "acqua-di-gio-profondo");
});
