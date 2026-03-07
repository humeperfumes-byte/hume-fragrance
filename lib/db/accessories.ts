import { db } from "@/db";
import { accessories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { accessories as localAccessories, type AccessoryData } from "@/data/accessories";

type AccessoryRow = typeof accessories.$inferSelect;

function transformAccessory(row: AccessoryRow): AccessoryData {
  return {
    id: row.id,
    name: row.name,
    shortDescription: row.shortDescription,
    description: row.description,
    images: row.images as string[],
    price: parseFloat(row.price),
    priceCurrency: "INR",
    isComplementary: Boolean(row.isComplementary),
    giftTier: row.giftTier === 1 || row.giftTier === 2 ? row.giftTier : undefined,
  };
}

export async function getAllAccessories(): Promise<AccessoryData[]> {
  try {
    const rows = await db.select().from(accessories);
    return rows.map(transformAccessory);
  } catch (error) {
    console.error("Error loading accessories from DB, using local fallback:", error);
    return localAccessories;
  }
}

export async function getAccessoryById(id: string): Promise<AccessoryData | null> {
  try {
    const [row] = await db
      .select()
      .from(accessories)
      .where(eq(accessories.id, id))
      .limit(1);

    if (!row) return null;
    return transformAccessory(row);
  } catch (error) {
    console.error(`Error loading accessory ${id} from DB, using local fallback:`, error);
    return localAccessories.find((item) => item.id === id) ?? null;
  }
}
