import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const KIT_AVAILABILITY_SETTING_KEY = "kit_availability";

type KitAvailabilityValue = {
  outOfStock?: unknown;
};

function normalizeKitAvailability(value: unknown) {
  const record = (value ?? {}) as KitAvailabilityValue;
  return {
    outOfStock: record.outOfStock === true,
  };
}

function isMissingSiteSettingsTable(error: unknown) {
  const maybeError = error as { code?: unknown; message?: unknown; cause?: { code?: unknown; message?: unknown } };
  const code = String(maybeError?.code ?? maybeError?.cause?.code ?? "");
  const message = String(maybeError?.message ?? maybeError?.cause?.message ?? "").toLowerCase();
  return code === "42P01" || message.includes("relation") && message.includes("site_settings");
}

async function ensureSiteSettingsTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      key VARCHAR(120) PRIMARY KEY,
      value JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES ('kit_availability', '{"outOfStock": false}'::jsonb, now())
    ON CONFLICT (key) DO NOTHING
  `);
}

async function readKitAvailability() {
  const [setting] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, KIT_AVAILABILITY_SETTING_KEY))
    .limit(1);

  return normalizeKitAvailability(setting?.value);
}

export async function getKitAvailability() {
  try {
    return await readKitAvailability();
  } catch (error) {
    if (isMissingSiteSettingsTable(error)) {
      try {
        await ensureSiteSettingsTable();
        return await readKitAvailability();
      } catch (ensureError) {
        console.error("Failed to create kit availability setting:", ensureError);
        return { outOfStock: false };
      }
    }

    console.error("Failed to load kit availability:", error);
    return { outOfStock: false };
  }
}

export async function setKitAvailability(outOfStock: boolean) {
  const value = { outOfStock };

  try {
    await db
      .insert(siteSettings)
      .values({
        key: KIT_AVAILABILITY_SETTING_KEY,
        value,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    if (!isMissingSiteSettingsTable(error)) throw error;
    await ensureSiteSettingsTable();
    await db
      .insert(siteSettings)
      .values({
        key: KIT_AVAILABILITY_SETTING_KEY,
        value,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value,
          updatedAt: new Date(),
        },
      });
  }

  return value;
}
