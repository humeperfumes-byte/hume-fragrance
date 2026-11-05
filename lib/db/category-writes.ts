import { inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { catalogCategories } from "@/db/schema";
import {
  categoryNameFromId,
  normalizeCategoryId,
} from "@/lib/product-categories";
import { isVisibleNatureCategory } from "@/lib/nature-categories";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function resolveCategorySelection(
  tx: Transaction,
  primary: string,
  requested: string[],
) {
  const primaryId = normalizeCategoryId(primary);
  const ids = [
    ...new Set(
      [primaryId, ...requested.map(normalizeCategoryId)].filter(Boolean),
    ),
  ];
  if (!primaryId || ids.some((id) => id.length > 100))
    throw new z.ZodError([
      {
        code: "custom",
        path: ["categoryIds"],
        message:
          "Choose a valid primary category and category names up to 100 characters.",
      },
    ]);
  // Older API clients can still supply a new family. Register it once with its own label.
  await tx
    .insert(catalogCategories)
    .values(
      ids.map((id) => ({
        id,
        name: categoryNameFromId(id),
        visible: isVisibleNatureCategory(id),
      })),
    )
    .onConflictDoNothing();
  const definitions = await tx
    .select()
    .from(catalogCategories)
    .where(inArray(catalogCategories.id, ids));
  if (definitions.length !== ids.length)
    throw new z.ZodError([
      {
        code: "custom",
        path: ["categoryIds"],
        message:
          "A category name is already in use. Choose an existing category from the category manager.",
      },
    ]);
  return {
    primaryId,
    primaryName: definitions.find((c) => c.id === primaryId)!.name,
    categories: ids.map((id) => ({
      id,
      label: definitions.find((c) => c.id === id)!.name,
    })),
  };
}
