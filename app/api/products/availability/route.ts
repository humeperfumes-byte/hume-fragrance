import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAllProducts } from "@/lib/db/products";
import {
  DETAIL_UPCOMING_PRODUCTS,
  getUpcomingProductAsPerfume,
} from "@/lib/upcoming-products";
import { NATURALS_PRODUCTS } from "@/lib/naturals-data";

const availabilitySchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1).max(255),
        quantity: z.number().int().positive().default(1),
      }),
    )
    .min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = availabilitySchema.parse(body);
    const products = [
      ...(await getAllProducts()),
      ...DETAIL_UPCOMING_PRODUCTS.map(getUpcomingProductAsPerfume),
      ...NATURALS_PRODUCTS.map((n) => ({
        id: n.id,
        name: n.name,
        price: n.price,
        size: n.size,
        categoryId: "naturals",
        category: "Naturals",
        images: [n.image],
        badges: { soldOut: false },
      })),
    ];
    const productMap = new Map(products.map((product) => [product.id, product]));

    const issues = data.items
      .map((item) => {
        const lookupId = item.id.startsWith("discovery-set-") ? "hume-discovery-set" : item.id;
        const product = productMap.get(lookupId);
        if (!product) {
          return {
            id: item.id,
            reason: "not_found",
            message: "This product is no longer available.",
          };
        }
        if (product.badges?.soldOut) {
          return {
            id: item.id,
            name: product.name,
            reason: "sold_out",
            message: `${product.name} is currently sold out.`,
          };
        }
        return null;
      })
      .filter(Boolean);

    return NextResponse.json({ ok: issues.length === 0, issues });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid availability request" }, { status: 400 });
    }
    console.error("availability check error:", error);
    return NextResponse.json({ ok: false, error: "Unable to check availability" }, { status: 500 });
  }
}
