import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { images } from "@/db/schema";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import { DISCOVERY_SET_PATH } from "@/lib/discovery-set";

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
        link: images.link,
      })
      .from(images)
      .where(eq(images.usage, usage));
    return rows.map((row) => {
      const normalizedLabel = row.label.trim().toLowerCase();
      const savedLink = row.link?.trim();
      const link = savedLink?.includes("/discovery-set/")
        ? DISCOVERY_SET_PATH
        : normalizedLabel.includes("buy 3 get 1")
          ? "/buy-3-get-1"
          : savedLink || "/shop";

      return {
        url: withCloudinaryTransforms(row.url),
        label: row.label || "HUME offer",
        link,
      };
    });
  },
  ["images-by-usage-v2"],
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
