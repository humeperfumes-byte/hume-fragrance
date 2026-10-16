import { randomUUID } from "crypto";
import { and, desc, eq, lt, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { liveChatMessages, liveChatSessions } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  try {
    const selectedId = request.nextUrl.searchParams.get("session");
    const beforeId = request.nextUrl.searchParams.get("before");
    if (selectedId && selectedId.length > 255 || beforeId && beforeId.length > 255) return NextResponse.json({error:"Invalid conversation"},{status:400});
    const columns = { id: liveChatSessions.id, status: liveChatSessions.status, handlingMode: liveChatSessions.handlingMode, page: liveChatSessions.page, createdAt: liveChatSessions.createdAt, updatedAt: liveChatSessions.updatedAt,
      lastMessage: sql`(select json_build_object('id',m.id,'sessionId',m.session_id,'sender',m.sender,'message',m.message,'createdAt',m.created_at) from live_chat_messages m where m.session_id = live_chat_sessions.id order by m.created_at desc,m.id desc limit 1)`,
      messageCount: sql<number>`(select count(*)::integer from live_chat_messages m where m.session_id = live_chat_sessions.id)` };
    const sessions = await db.select(columns).from(liveChatSessions).orderBy(desc(liveChatSessions.updatedAt)).limit(100);
    if (selectedId && !sessions.some(row=>row.id===selectedId)) {
      const [selected] = await db.select(columns).from(liveChatSessions).where(eq(liveChatSessions.id,selectedId)).limit(1);
      if (!selected) return NextResponse.json({error:"Conversation not found"},{status:404});
      sessions.push(selected);
    }
    let messages: Array<typeof liveChatMessages.$inferSelect> = [];
    if (selectedId) {
      const [cursor] = beforeId ? await db.select().from(liveChatMessages).where(and(eq(liveChatMessages.id,beforeId),eq(liveChatMessages.sessionId,selectedId))).limit(1) : [];
      if (beforeId && !cursor) return NextResponse.json({error:"Invalid message cursor"},{status:400});
      messages = await db.select().from(liveChatMessages).where(and(eq(liveChatMessages.sessionId,selectedId),cursor ? or(lt(liveChatMessages.createdAt,cursor.createdAt),and(eq(liveChatMessages.createdAt,cursor.createdAt),lt(liveChatMessages.id,cursor.id))) : undefined)).orderBy(desc(liveChatMessages.createdAt),desc(liveChatMessages.id)).limit(101);
    }
    return NextResponse.json({sessions,messages:messages.slice(0,100).reverse(),hasMore:messages.length>100},{headers:{"Cache-Control":"private, no-store"}});
  } catch { return NextResponse.json({error:"Conversations could not be loaded"},{status:503}); }
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
    await db.transaction(async tx => {
      await tx.select({id:liveChatSessions.id}).from(liveChatSessions).where(eq(liveChatSessions.id,input.sessionId)).for("update");
      await tx.insert(liveChatMessages).values(message);
      await tx.update(liveChatSessions).set({ updatedAt: createdAt, handlingMode: "manual", status: "open" }).where(eq(liveChatSessions.id, input.sessionId));
    });
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
    const [session] = await db.update(liveChatSessions).set({ ...(input.status ? { status: input.status, ...(["waiting","resolved","closed"].includes(input.status) ? {handlingMode:"manual"} : {}) } : {}), ...(input.handlingMode ? { handlingMode: input.handlingMode, ...(input.handlingMode === "ai" ? {status:"open"} : {}) } : {}), updatedAt: new Date() }).where(eq(liveChatSessions.id, input.sessionId)).returning({id:liveChatSessions.id,status:liveChatSessions.status,handlingMode:liveChatSessions.handlingMode,updatedAt:liveChatSessions.updatedAt});
    if (!session) return NextResponse.json({error:"Conversation not found"},{status:404});
    return NextResponse.json({ ok: true, session });
  } catch {
    return NextResponse.json({ error: "Status could not be updated" }, { status: 400 });
  }
}
