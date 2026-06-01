import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";
import { ADMIN_CONTROLS_KEY, defaultAdminControls, normalizeAdminControls } from "@/lib/admin-settings";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const [row] = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, ADMIN_CONTROLS_KEY))
      .limit(1);

    return NextResponse.json(normalizeAdminControls(row?.value ?? defaultAdminControls));
  } catch (error) {
    console.error("Failed to load admin settings:", error);
    return NextResponse.json(defaultAdminControls);
  }
}

export async function PATCH(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const settings = normalizeAdminControls(body);

    await db
      .insert(siteSettings)
      .values({
        key: ADMIN_CONTROLS_KEY,
        value: { ...settings },
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [siteSettings.key],
        set: {
          value: { ...settings },
          updatedAt: new Date(),
        },
      });

    await db
      .insert(siteSettings)
      .values({
        key: "behavioral_intelligence",
        value: { enabled: settings.behavioralIntelligenceEnabled },
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [siteSettings.key],
        set: {
          value: { enabled: settings.behavioralIntelligenceEnabled },
          updatedAt: new Date(),
        },
      });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to save admin settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
