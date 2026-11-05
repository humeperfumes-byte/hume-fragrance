const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  dotenv = require("dotenv"),
  postgres = require("postgres"),
  crypto = require("node:crypto");
const env = {
  ...dotenv.parse(fs.readFileSync(".env")),
  ...dotenv.parse(fs.readFileSync(".env.local")),
};
const base = "http://localhost:3002",
  headers = {
    "Content-Type": "application/json",
    "x-admin-token": env.ADMIN_API_TOKEN,
  };
let categoryId, productId;
async function request(path, method = "GET", body) {
  const res = await fetch(base + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(90000),
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  return { status: res.status, data };
}
async function main() {
  assert.equal((await fetch(base + "/api/admin/categories")).status, 401);
  assert.equal(
    (
      await fetch(base + "/api/admin/categories", {
        method: "POST",
        headers: { ...headers, origin: "https://invalid.example" },
        body: "{}",
      })
    ).status,
    403,
  );
  const created = await request("/api/admin/categories", "POST", {
    name: "Verification family " + crypto.randomUUID().slice(0, 8),
    description: "Temporary verification category",
  });
  assert.equal(created.status, 201, JSON.stringify(created.data));
  categoryId = created.data.category.id;
  const duplicate = await request("/api/admin/categories", "POST", {
    name: created.data.category.name,
  });
  assert.equal(duplicate.status, 409);
  productId = "category-verification-" + crypto.randomUUID();
  const product = {
    id: productId,
    name: "Temporary category verification",
    inspiration: "Verification",
    inspirationBrand: "HUME",
    category: "Wrong legacy label",
    categoryId: categoryId,
    categoryIds: ["fresh", "citrus"],
    gender: "Unisex",
    images: ["/images/perfume-1.jpg"],
    price: 100,
    description: "Temporary",
    seoDescription: "Temporary",
    seoKeywords: [],
    notes: { top: [], heart: [], base: [] },
    longevity: {
      duration: "1 hour",
      sillage: "Soft",
      season: [],
      occasion: [],
    },
    size: "50ml",
    visibility: "seo_only",
  };
  const saved = await request("/api/products", "POST", product);
  assert.equal(saved.status, 201, JSON.stringify(saved.data));
  assert.equal(saved.data.category, created.data.category.name);
  let detail = await request("/api/products/" + productId);
  assert.deepEqual(
    new Set(detail.data.categoryIds),
    new Set([categoryId, "fresh", "citrus"]),
  );
  const sql = postgres(env.DATABASE_URL, {
    prepare: false,
    max: 1,
    connect_timeout: 10,
  });
  try {
    const mappings =
      await sql`select m.category_id,m.category_label,c.name from product_categories m join catalog_categories c on c.id=m.category_id where m.product_id=${productId}`;
    assert.ok(mappings.every((row) => row.category_label === row.name));
  } finally {
    await sql.end();
  }
  const partial = await request("/api/products/" + productId, "PUT", {
    name: "Temporary category verification renamed",
  });
  assert.equal(partial.status, 200);
  assert.equal(partial.data.categoryIds.length, 3);
  const invalid = await request("/api/products/" + productId, "PUT", {
    categoryId: "!!!",
    name: "Must not save",
  });
  assert.equal(invalid.status, 400);
  detail = await request("/api/products/" + productId);
  assert.equal(detail.data.name, "Temporary category verification renamed");
  const update = {
    ...created.data.category,
    name: "Verification family renamed " + categoryId.slice(-8),
    visible: false,
    productIds: [productId],
    expectedUpdatedAt: created.data.category.updatedAt,
  };
  const removal = await request("/api/admin/categories", "PATCH", {
    ...update,
    productIds: [],
  });
  assert.equal(removal.status, 400);
  const changed = await request("/api/admin/categories", "PATCH", update);
  assert.equal(changed.status, 200, JSON.stringify(changed.data));
  const conflict = await request("/api/admin/categories", "PATCH", update);
  assert.equal(conflict.status, 409);
  const hidden = await request("/api/products?includeHidden=1");
  assert.equal(hidden.status, 200);
  const row = hidden.data.find((p) => p.id === productId);
  assert.equal(
    row.categoryTags.find((t) => t.id === categoryId).visible,
    false,
  );
  assert.equal(row.categoryTags.find((t) => t.id === "citrus").label, "Citrus");
  const categoryList = await request("/api/admin/categories");
  const category = categoryList.data.categories.find(
    (c) => c.id === categoryId,
  );
  assert.equal(category.productCount, 1);
  assert.equal(category.publicProductCount, 0);
  const moved = await request("/api/products/" + productId, "PUT", {
    categoryId: "fresh",
  });
  assert.equal(moved.status, 200);
  assert.equal(moved.data.categoryIds.length, 3);
  const cleared = await request("/api/products/" + productId, "PUT", {
    categoryIds: [],
  });
  assert.equal(cleared.status, 200);
  assert.deepEqual(cleared.data.categoryIds, ["fresh"]);
  console.log(
    "PASS category auth, origin checks, duplicate protection, canonical labels, atomic product writes, membership retention, primary protection, stale edit conflict, hidden metadata, accurate counts and explicit clearing.",
  );
}
main()
  .catch((e) => {
    console.error("Category integration failed:", e.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (!productId && !categoryId) return;
    for (let attempt = 0; attempt < 3; attempt++) {
      const sql = postgres(env.DATABASE_URL, {
        prepare: false,
        max: 1,
        connect_timeout: 10,
      });
      try {
        await sql.begin(async (tx) => {
          if (productId) {
            await tx`delete from product_categories where product_id=${productId}`;
            await tx`delete from products where id=${productId}`;
          }
          if (categoryId)
            await tx`delete from catalog_categories where id=${categoryId}`;
        });
        console.log("Temporary category and product removed.");
        return;
      } catch (e) {
        if (attempt === 2) {
          console.error("Verification cleanup needs retry:", e.message);
          process.exitCode = 1;
        } else
          console.log(
            "Retrying cleanup after a database connection interruption.",
          );
      } finally {
        await sql.end();
      }
    }
  });
