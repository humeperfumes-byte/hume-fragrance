import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  console.log("Updating admin settings...");
  try {
    const { db } = await import("./db");
    const { siteSettings } = await import("./db/schema");
    const { ADMIN_CONTROLS_KEY } = await import("./lib/admin-settings");
    const { eq } = await import("drizzle-orm");

    const [row] = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, ADMIN_CONTROLS_KEY))
      .limit(1);

    const currentSettings = (row?.value || {}) as Record<string, any>;
    console.log("Current Settings:", currentSettings);

    const updatedSettings = {
      ...currentSettings,
      enableTenTesterOption: false,
    };

    await db
      .insert(siteSettings)
      .values({
        key: ADMIN_CONTROLS_KEY,
        value: updatedSettings,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [siteSettings.key],
        set: {
          value: updatedSettings,
          updatedAt: new Date(),
        },
      });

    console.log("Success! Updated Settings:", updatedSettings);
  } catch (err) {
    console.error("Failed to update settings:", err);
  }
}

main();
