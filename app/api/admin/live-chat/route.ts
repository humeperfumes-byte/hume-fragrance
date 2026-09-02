import { randomUUID } from "crypto";
import { asc, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { liveChatMessages, liveChatSessions } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  const selectedId = request.nextUrl.searchParams.get("session");
  const sessions = await db.select({ id: liveChatSessions.id, status: liveChatSessions.status, handlingMode: liveChatSessions.handlingMode, page: liveChatSessions.page, createdAt: liveChatSessions.createdAt, updatedAt: liveChatSessions.updatedAt }).from(liveChatSessions).orderBy(desc(liveChatSessions.updatedAt)).limit(100);
  const allMessages = await db.select({ id: liveChatMessages.id, sessionId: liveChatMessages.sessionId, sender: liveChatMessages.sender, message: liveChatMessages.message, createdAt: liveChatMessages.createdAt }).from(liveChatMessages).orderBy(asc(liveChatMessages.createdAt)).limit(2000);
  const grouped = new Map<string, typeof allMessages>();
  for (const message of allMessages) grouped.set(message.sessionId, [...(grouped.get(message.sessionId) ?? []), message]);
  const rows = sessions.map(session => {
    const messages = grouped.get(session.id) ?? [];
    return { ...session, lastMessage: messages.at(-1) ?? null, messageCount: messages.length };
  });
  return NextResponse.json({ sessions: rows, messages: selectedId ? grouped.get(selectedId) ?? [] : [] }, { headers: { "Cache-Control": "private, no-store" } });
}

const replySchema = z.object({ sessionId: z.string().min(1).max(255), message: z.string().trim().min(1).max(1200) });

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  try {
    const input = replySchema.parse(await request.json());
    const [session] = await db.select().from(liveChatSessions).where(eq(liveChatSessions.id, input.sessionId)).limit(1);
    if (!session) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    const createdAt = new Date();
    const message = { id: randomUUID(), sessionId: input.sessionId, sender: "admin", message: input.message, createdAt };
    await db.insert(liveChatMessages).values(message);
    await db.update(liveChatSessions).set({ updatedAt: createdAt }).where(eq(liveChatSessions.id, input.sessionId));
    return NextResponse.json({ message: { ...message, createdAt: createdAt.toISOString() } });
  } catch (error) {
    console.error("Admin live chat reply failed:", error);
    return NextResponse.json({ error: "Reply could not be sent" }, { status: 500 });
  }
}

const statusSchema = z.object({ sessionId: z.string().min(1).max(255), status: z.enum(["open", "waiting", "resolved", "closed"]).optional(), handlingMode: z.enum(["ai", "manual"]).optional() }).refine(input => input.status || input.handlingMode);

export async function PATCH(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  try {
    const input = statusSchema.parse(await request.json());
    await db.update(liveChatSessions).set({ ...(input.status ? { status: input.status } : {}), ...(input.handlingMode ? { handlingMode: input.handlingMode } : {}), updatedAt: new Date() }).where(eq(liveChatSessions.id, input.sessionId));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Status could not be updated" }, { status: 400 });
  }
}
