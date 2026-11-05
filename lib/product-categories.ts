import { isVisibleNatureCategory } from "./nature-categories";

export type CategoryDefinition = {
  id: string;
  name: string;
  description: string;
  visible: boolean;
  sortOrder: number;
};
export type CategoryTag = {
  id: string;
  label?: string;
  visible?: boolean;
  sortOrder?: number;
  description?: string;
};
export type CategorizedProduct = {
  categoryId?: string;
  categoryIds?: string[];
  categoryTags?: CategoryTag[];
  dbCategoryIds?: string[];
  dbCategoryTags?: CategoryTag[];
};
export const normalizeCategoryId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
export const categoryNameFromId = (id: string) =>
  normalizeCategoryId(id)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export function productCategoryTags(
  product: CategorizedProduct,
  definitions?: CategoryDefinition[],
): CategoryTag[] {
  const tags = [
    ...(product.categoryTags ?? []),
    ...(product.dbCategoryTags ?? []),
  ];
  const ids = [
    ...new Set(
      [
        product.categoryId ?? "",
        ...(product.categoryIds ?? []),
        ...(product.dbCategoryIds ?? []),
        ...tags.map((tag) => tag.id),
      ]
        .map(normalizeCategoryId)
        .filter(Boolean),
    ),
  ];
  return ids.map((id) => {
    const definition = definitions?.find((c) => c.id === id);
    const tag =
      tags.find(
        (t) => normalizeCategoryId(t.id) === id && t.visible !== undefined,
      ) ?? tags.find((t) => normalizeCategoryId(t.id) === id);
    return {
      id,
      label:
        definition?.name ??
        (tag?.label &&
        (tag.visible !== undefined || normalizeCategoryId(tag.label) === id)
          ? tag.label
          : categoryNameFromId(id)),
      visible:
        definition?.visible ?? tag?.visible ?? isVisibleNatureCategory(id),
      sortOrder: definition?.sortOrder ?? tag?.sortOrder ?? 200,
      description: definition?.description ?? tag?.description ?? "",
    };
  });
}

export function categoryOptions(
  products: CategorizedProduct[],
  includeHidden = false,
) {
  const map = new Map<
    string,
    {
      id: string;
      label: string;
      count: number;
      sortOrder: number;
      description: string;
    }
  >();
  for (const product of products) {
    for (const tag of productCategoryTags(product)) {
      if (tag.visible === false && !includeHidden) continue;
      const existing = map.get(tag.id);
      if (existing) existing.count++;
      else
        map.set(tag.id, {
          id: tag.id,
          label: tag.label || categoryNameFromId(tag.id),
          count: 1,
          sortOrder: tag.sortOrder ?? 200,
          description: tag.description ?? "",
        });
    }
  }
  return [...map.values()].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label),
  );
}

export function matchesProductCategory(
  product: CategorizedProduct,
  selection: string,
) {
  const key = normalizeCategoryId(selection);
  return productCategoryTags(product).some(
    (tag) => tag.id === key || normalizeCategoryId(tag.label || "") === key,
  );
}
