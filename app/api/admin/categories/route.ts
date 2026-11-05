import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { catalogCategories, productCategories, products } from "@/db/schema";
import { and, asc, eq, notInArray } from "drizzle-orm";
import { z } from "zod";
import { requireAdminToken } from "@/lib/admin-auth";
import {
  categoryNameFromId,
  normalizeCategoryId,
} from "@/lib/product-categories";
import { revalidatePath, revalidateTag } from "next/cache";
export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
const input = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).default(""),
  visible: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(10000).default(200),
  productIds: z.array(z.string().min(1).max(255)).max(10000).optional(),
  expectedUpdatedAt: z.string().datetime().optional(),
});
function authorize(req: NextRequest) {
  const denied = requireAdminToken(req);
  if (denied) return denied;
  const origin = req.headers.get("origin");
  if (req.method !== "GET" && origin && origin !== req.nextUrl.origin)
    return json({ error: "Invalid origin" }, 403);
  return null;
}
function invalidate() {
  revalidateTag("products", { expire: 0 });
  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
}
export async function GET(req: NextRequest) {
  const denied = authorize(req);
  if (denied) return denied;
  try {
    if (req.nextUrl.searchParams.get("definitions") === "1") {
      const categories = await db
        .select()
        .from(catalogCategories)
        .orderBy(asc(catalogCategories.sortOrder), asc(catalogCategories.name));
      return json({ categories });
    }
    const [categories, items, mappings] = await Promise.all([
      db
        .select()
        .from(catalogCategories)
        .orderBy(asc(catalogCategories.sortOrder), asc(catalogCategories.name)),
      db
        .select({
          id: products.id,
          name: products.name,
          gender: products.gender,
          visibility: products.visibility,
          categoryId: products.categoryId,
          category: products.category,
        })
        .from(products)
        .orderBy(asc(products.name)),
      db
        .select({
          productId: productCategories.productId,
          categoryId: productCategories.categoryId,
        })
        .from(productCategories),
    ]);
    const enriched = items.map((p) => ({
      ...p,
      categoryIds: [
        ...new Set([
          p.categoryId,
          ...mappings
            .filter((m) => m.productId === p.id)
            .map((m) => m.categoryId),
        ]),
      ],
    }));
    return json({
      categories: categories.map((c) => ({
        ...c,
        productCount: enriched.filter((p) => p.categoryIds.includes(c.id))
          .length,
        publicProductCount: enriched.filter(
          (p) => p.visibility === "public" && p.categoryIds.includes(c.id),
        ).length,
      })),
      products: enriched,
    });
  } catch {
    return json(
      {
        error:
          "Could not load categories. Check database connectivity and apply the category migration.",
      },
      503,
    );
  }
}
export async function POST(req: NextRequest) {
  const denied = authorize(req);
  if (denied) return denied;
  try {
    const body = input.parse(await req.json());
    const id = normalizeCategoryId(body.name);
    if (!id || id.length > 100)
      return json(
        {
          error:
            "Choose a name containing letters or numbers, up to 100 characters.",
        },
        400,
      );
    const [created] = await db
      .insert(catalogCategories)
      .values({
        id,
        name: body.name || categoryNameFromId(id),
        description: body.description,
        visible: body.visible,
        sortOrder: body.sortOrder,
      })
      .onConflictDoNothing()
      .returning();
    if (!created)
      return json({ error: "A category with this name already exists." }, 409);
    invalidate();
    return json({ category: created }, 201);
  } catch (e) {
    if (e instanceof z.ZodError)
      return json({ error: e.errors[0]?.message || "Invalid category" }, 400);
    return json({ error: "Could not create category." }, 500);
  }
}
export async function PATCH(req: NextRequest) {
  const denied = authorize(req);
  if (denied) return denied;
  try {
    const body = z
      .object({ id: z.string().min(1).max(100) })
      .merge(input.partial())
      .parse(await req.json());
    const result = await db.transaction(async (tx) => {
      // Serialize membership changes with ordinary product updates.
      const items = await tx
        .select({ id: products.id, categoryId: products.categoryId })
        .from(products)
        .orderBy(asc(products.id))
        .for("update");
      const [current] = await tx
        .select()
        .from(catalogCategories)
        .where(eq(catalogCategories.id, body.id))
        .for("update");
      if (!current) return { error: "Category not found", status: 404 };
      const nextName = body.name ?? current.name;
      if (
        body.expectedUpdatedAt &&
        current.updatedAt.toISOString() !== body.expectedUpdatedAt
      )
        return {
          error: "This category changed elsewhere. Refresh before saving.",
          status: 409,
        };
      const duplicate = await tx
        .select({ id: catalogCategories.id, name: catalogCategories.name })
        .from(catalogCategories);
      if (
        duplicate.some(
          (c) =>
            c.id !== body.id &&
            (c.id === normalizeCategoryId(nextName) ||
              normalizeCategoryId(c.name) === normalizeCategoryId(nextName)),
        )
      )
        return { error: "That category name is already in use.", status: 409 };
      const selected = [...new Set(body.productIds ?? [])];
      if (body.productIds) {
        if (selected.some((id) => !items.some((p) => p.id === id)))
          return {
            error: "A selected product no longer exists. Refresh the page.",
            status: 409,
          };
        if (
          items.some(
            (p) => p.categoryId === body.id && !selected.includes(p.id),
          )
        )
          return {
            error:
              "A primary category cannot be removed here. Change the product’s primary category in its editor first.",
            status: 400,
          };
      }
      const [category] = await tx
        .update(catalogCategories)
        .set({
          name: nextName,
          description: body.description ?? current.description,
          visible: body.visible ?? current.visible,
          sortOrder: body.sortOrder ?? current.sortOrder,
          updatedAt: new Date(),
        })
        .where(eq(catalogCategories.id, body.id))
        .returning();
      await tx
        .update(productCategories)
        .set({ categoryLabel: nextName })
        .where(eq(productCategories.categoryId, body.id));
      await tx
        .update(products)
        .set({ category: nextName, updatedAt: new Date() })
        .where(eq(products.categoryId, body.id));
      if (body.productIds) {
        await tx
          .delete(productCategories)
          .where(
            selected.length
              ? and(
                  eq(productCategories.categoryId, body.id),
                  notInArray(productCategories.productId, selected),
                )
              : eq(productCategories.categoryId, body.id),
          );
        if (selected.length)
          await tx
            .insert(productCategories)
            .values(
              selected.map((id) => ({
                productId: id,
                categoryId: body.id,
                categoryLabel: nextName,
              })),
            )
            .onConflictDoNothing();
      }
      return { category };
    });
    if ("error" in result) return json({ error: result.error }, result.status);
    invalidate();
    return json(result);
  } catch (e) {
    if (e instanceof z.ZodError)
      return json({ error: e.errors[0]?.message || "Invalid category" }, 400);
    console.error("Category update failed", e);
    return json(
      { error: "Could not update category. No changes were saved." },
      500,
    );
  }
}
