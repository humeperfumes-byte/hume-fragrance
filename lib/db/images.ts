import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { images } from "@/db/schema";
import { withCloudinaryTransforms } from "@/lib/cloudinary";

export type HeroSlide = {
  url: string;
  label: string;
  link?: string;
};

const getImagesByUsageCached = unstable_cache(
  async (usage: string) => {
    const rows = await db
      .select({
        url: images.url,
        label: images.label,
      })
      .from(images)
      .where(eq(images.usage, usage));
    return rows.map((row) => ({
      url: withCloudinaryTransforms(row.url),
      label: row.label || "HUME offer",
    }));
  },
  ["images-by-usage"],
  { revalidate: 300, tags: ["images"] }
);

export async function getImagesByUsage(usage: string): Promise<HeroSlide[]> {
  try {
    return await getImagesByUsageCached(usage);
  } catch (error) {
    console.error(`Error loading images for usage ${usage}:`, error);
    return [];
  }
}
