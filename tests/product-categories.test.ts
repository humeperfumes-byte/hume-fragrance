import assert from "node:assert/strict";
import { test } from "node:test";
import {
  categoryOptions,
  matchesProductCategory,
  normalizeCategoryId,
  productCategoryTags,
  type CategoryDefinition,
} from "../lib/product-categories";

test("legacy IDs match across whitespace, hyphens, case and underscores", () => {
  assert.equal(normalizeCategoryId(" Fresh_Spicy "), "fresh-spicy");
  assert.ok(
    matchesProductCategory({ categoryId: "fresh spicy" }, "Fresh-Spicy"),
  );
});
test("empty database arrays never hide the primary category", () => {
  const product = {
    categoryId: "fresh",
    dbCategoryIds: [],
    dbCategoryTags: [],
    categoryIds: [],
    categoryTags: [],
  };
  assert.ok(matchesProductCategory(product, "Fresh"));
  assert.equal(categoryOptions([product])[0].label, "Fresh");
});
test("incorrect legacy mapping labels cannot alias one scent family to another", () => {
  const product = {
    categoryId: "woody",
    categoryTags: [{ id: "citrus", label: "Woody" }],
  };
  assert.equal(
    productCategoryTags(product).find((c) => c.id === "citrus")?.label,
    "Citrus",
  );
  assert.ok(matchesProductCategory(product, "Citrus"));
});
test("each product is counted once per category, even with duplicate mappings", () => {
  const product = {
    categoryId: "citrus",
    categoryIds: ["citrus", "CITRUS"],
    dbCategoryIds: ["citrus"],
    categoryTags: [{ id: "citrus", label: "Citrus" }],
  };
  assert.equal(categoryOptions([product])[0].count, 1);
});
test("master labels, visibility and ordering survive storefront serialization", () => {
  const defs: CategoryDefinition[] = [
    {
      id: "fresh",
      name: "Fresh & Clean",
      description: "Crisp fragrances",
      visible: true,
      sortOrder: 10,
    },
    {
      id: "woody",
      name: "Woods",
      description: "",
      visible: false,
      sortOrder: 0,
    },
  ];
  const tags = productCategoryTags(
    { categoryId: "fresh", categoryIds: ["woody"] },
    defs,
  );
  const product = JSON.parse(JSON.stringify({ categoryTags: tags }));
  assert.equal(categoryOptions([product]).length, 1);
  assert.equal(categoryOptions([product])[0].label, "Fresh & Clean");
  assert.ok(matchesProductCategory(product, "Fresh & Clean"));
  assert.equal(categoryOptions([product], true).length, 2);
  assert.equal(categoryOptions([product], true)[0].id, "woody");
});
test("an explicit master setting can show previously hidden legacy categories", () => {
  assert.equal(categoryOptions([{ categoryId: "aromatic" }]).length, 0);
  assert.equal(
    categoryOptions([
      { categoryTags: [{ id: "aromatic", label: "Aromatic", visible: true }] },
    ]).length,
    1,
  );
});
