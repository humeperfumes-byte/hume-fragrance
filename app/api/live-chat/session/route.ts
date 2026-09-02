import { createHash } from "crypto";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { liveChatSessions } from "@/db/schema";

export const dynamic = "force-dynamic";

const schema = z.object({
  sessionId: z.string().min(1).max(255),
  token: z.string().min(32).max(255),
  page: z.string().max(2048).optional(),
});

const hash = (value: string) => createHash("sha256").update(value).digest("hex");

export async function POST(request: NextRequest) {
  try {
    const input = schema.parse(await request.json());
    const tokenHash = hash(input.token);
    const [existing] = await db.select().from(liveChatSessions).where(eq(liveChatSessions.id, input.sessionId)).limit(1);

    if (existing) {
      if (existing.visitorTokenHash !== tokenHash) {
        return NextResponse.json({ error: "Invalid chat session" }, { status: 403 });
      }
      return NextResponse.json({ ok: true });
    }

    await db.insert(liveChatSessions).values({
      id: input.sessionId,
      visitorTokenHash: tokenHash,
      page: input.page,
    }).onConflictDoNothing();
    const [registered] = await db.select().from(liveChatSessions).where(eq(liveChatSessions.id, input.sessionId)).limit(1);
    if (!registered || registered.visitorTokenHash !== tokenHash) {
      return NextResponse.json({ error: "Invalid chat session" }, { status: 403 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Live chat registration failed:", error);
    return NextResponse.json({ error: "Chat could not be connected" }, { status: 500 });
  }
}
