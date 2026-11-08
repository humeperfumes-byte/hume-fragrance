import { randomUUID } from "crypto";
import { and, desc, eq, gte, lt, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { liveChatMessages, liveChatSessions } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";
import { chatCutoff } from "@/lib/live-chat-retention";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  try {
    const params = request.nextUrl.searchParams;
    const selectedId = params.get("session");
    const beforeId = params.get("before");
    const query = (params.get("q") || "").trim().slice(0, 120);
    const status = params.get("status");
    const page = Number(params.get("page") ?? "1");
    if ((selectedId && selectedId.length > 255) || (beforeId && beforeId.length > 255) ||
        !Number.isInteger(page) || page < 1 || page > 1000000) {
      return NextResponse.json({ error: "Invalid inbox request" }, { status: 400 });
    }
    const cutoff = chatCutoff();
    const retained = sql`m.session_id = live_chat_sessions.id and m.created_at >= ${cutoff.toISOString()}::timestamp`;
    const hasMessages = sql`exists (select 1 from live_chat_messages m where ${retained})`;
    const columns = {
      id: liveChatSessions.id, status: liveChatSessions.status, handlingMode: liveChatSessions.handlingMode,
      page: liveChatSessions.page, createdAt: liveChatSessions.createdAt, updatedAt: liveChatSessions.updatedAt,
      lastMessage: sql`(select json_build_object('id', m.id, 'sessionId', m.session_id, 'sender', m.sender, 'message', m.message, 'createdAt', m.created_at at time zone 'UTC') from live_chat_messages m where ${retained} order by m.created_at desc, m.id desc limit 1)`,
      messageCount: sql<number>`(select count(*)::integer from live_chat_messages m where ${retained})`,
    };
    const pageSize = 40;
    const list = beforeId ? [] : await db.select(columns).from(liveChatSessions).where(and(
      hasMessages,
      status && status !== "all" ? eq(liveChatSessions.status, status) : undefined,
      query ? sql`(strpos(lower(live_chat_sessions.id), lower(${query})) > 0 or strpos(lower(coalesce(live_chat_sessions.page, '')), lower(${query})) > 0 or exists (select 1 from live_chat_messages m where ${retained} and strpos(lower(m.message), lower(${query})) > 0))` : undefined,
    )).orderBy(desc(liveChatSessions.updatedAt), desc(liveChatSessions.id)).limit(pageSize + 1).offset((page - 1) * pageSize);
    const sessions = list.slice(0, pageSize);
    const selected = selectedId ? sessions.find(row => row.id === selectedId) ??
      (await db.select(columns).from(liveChatSessions).where(and(eq(liveChatSessions.id, selectedId), hasMessages)).limit(1))[0] ?? null : null;
    let messages: Array<typeof liveChatMessages.$inferSelect> = [];
    if (selected) {
      const scope = and(eq(liveChatMessages.sessionId, selected.id), gte(liveChatMessages.createdAt, cutoff));
      const [cursor] = beforeId ? await db.select().from(liveChatMessages).where(and(scope, eq(liveChatMessages.id, beforeId))).limit(1) : [];
      if (!beforeId || cursor) {
        messages = await db.select().from(liveChatMessages).where(and(scope,
          cursor ? or(lt(liveChatMessages.createdAt, cursor.createdAt), and(eq(liveChatMessages.createdAt, cursor.createdAt), lt(liveChatMessages.id, cursor.id))) : undefined,
        )).orderBy(desc(liveChatMessages.createdAt), desc(liveChatMessages.id)).limit(101);
      }
    }
    return NextResponse.json({ sessions, selected, hasNextPage: list.length > pageSize, messages: messages.slice(0, 100).reverse(), hasMore: messages.length > 100 },
      { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Conversations could not be loaded" }, { status: 503 });
  }
}

const replySchema = z.object({ sessionId: z.string().min(1).max(255), message: z.string().trim().min(1).max(1200) });

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  try {
    const input = replySchema.parse(await request.json());
    const message = await db.transaction(async tx => {
      const [session] = await tx.select().from(liveChatSessions).where(eq(liveChatSessions.id, input.sessionId)).for("update");
      if (!session || session.updatedAt < chatCutoff()) return null;
      const createdAt = new Date(Math.max(Date.now(), session.updatedAt.getTime() + 1));
      const message = { id: randomUUID(), sessionId: input.sessionId, sender: "admin", message: input.message, createdAt };
      await tx.insert(liveChatMessages).values(message);
      await tx.update(liveChatSessions).set({ updatedAt: createdAt, handlingMode: "manual", status: "open" }).where(eq(liveChatSessions.id, input.sessionId));
      return message;
    });
    if (!message) return NextResponse.json({ error: "Conversation expired or not found" }, { status: 404 });
    return NextResponse.json({ message });
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
    const [session] = await db.update(liveChatSessions).set({ ...(input.status ? { status: input.status, ...(["waiting","resolved","closed"].includes(input.status) ? {handlingMode:"manual"} : {}) } : {}), ...(input.handlingMode ? { handlingMode: input.handlingMode, ...(input.handlingMode === "ai" ? {status:"open"} : {}) } : {}) }).where(and(eq(liveChatSessions.id, input.sessionId), gte(liveChatSessions.updatedAt, chatCutoff()))).returning({id:liveChatSessions.id,status:liveChatSessions.status,handlingMode:liveChatSessions.handlingMode,updatedAt:liveChatSessions.updatedAt});
    if (!session) return NextResponse.json({error:"Conversation not found"},{status:404});
    return NextResponse.json({ ok: true, session });
  } catch {
    return NextResponse.json({ error: "Status could not be updated" }, { status: 400 });
  }
}
