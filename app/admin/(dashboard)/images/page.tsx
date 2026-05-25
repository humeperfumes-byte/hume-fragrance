import { desc } from "drizzle-orm";

import { db } from "@/db";
import { images } from "@/db/schema";
import AdminImagesClient, { type AdminImageAsset } from "./AdminImagesClient";

export const dynamic = "force-dynamic";

const imageColumns = {
  id: images.id,
  label: images.label,
  url: images.url,
  link: images.link,
  usage: images.usage,
  tags: images.tags,
  mimeType: images.mimeType,
  sizeBytes: images.sizeBytes,
  createdAt: images.createdAt,
  updatedAt: images.updatedAt,
};

export default async function AdminImagesPage() {
  let imageAssets: AdminImageAsset[] = [];
  let dbError = false;

  try {
    const rows = await db
      .select(imageColumns)
      .from(images)
      .orderBy(desc(images.updatedAt));

    imageAssets = rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Admin images page DB error:", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl text-white">Image Library</h1>
          <p className="mt-1 text-sm text-white/45">Reusable customer update and offer images.</p>
        </div>
        <div className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/[0.04] p-10 text-center">
          <h3 className="text-lg font-medium text-amber-300">Database Sync Required</h3>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/50">
            The images table needs the latest upload columns. Run the image migration, then refresh this page.
          </p>
        </div>
      </div>
    );
  }

  return <AdminImagesClient initialImages={imageAssets} />;
}
