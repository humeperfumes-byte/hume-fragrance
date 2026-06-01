import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { ADMIN_CONTROLS_KEY, defaultAdminControls, normalizeAdminControls } from "@/lib/admin-settings";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const [row] = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, ADMIN_CONTROLS_KEY))
      .limit(1);

    return NextResponse.json(normalizeAdminControls(row?.value ?? defaultAdminControls));
  } catch (error) {
    console.error("Failed to load public settings:", error);
    return NextResponse.json(defaultAdminControls);
  }
}
