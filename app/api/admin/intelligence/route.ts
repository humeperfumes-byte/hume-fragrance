import { NextResponse } from "next/server";
import { db } from "@/db";
import { sessionIntelligence, sectionAttribution } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [sessions, sections] = await Promise.all([
      db
        .select()
        .from(sessionIntelligence)
        .orderBy(desc(sessionIntelligence.updatedAt))
        .limit(50),
      db
        .select()
        .from(sectionAttribution)
        .orderBy(desc(sectionAttribution.attributionScore))
        .limit(10),
    ]);

    return NextResponse.json({ sessions, sections });
  } catch (error) {
    console.error("Intelligence API Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
