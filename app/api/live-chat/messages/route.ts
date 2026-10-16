import { createHash, randomUUID } from "crypto";
import { and, asc, desc, eq, gt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { liveChatMessages, liveChatSessions } from "@/db/schema";
import { generateHumeChatReply } from "@/lib/ai/live-chat";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
const bodySchema = z.object({ sessionId: z.string().max(255), token: z.string().min(32).max(255), message: z.string().trim().min(1).max(1200), page: z.string().max(2048).optional() });
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const escapeHtml = (value: string) => value.replace(/[&<>]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[character] ?? character));

async function authorized(sessionId: string, token: string) {
  const [session] = await db.select().from(liveChatSessions).where(eq(liveChatSessions.id, sessionId)).limit(1);
  return session?.visitorTokenHash === hash(token) ? session : null;
}

export async function POST(request: NextRequest) {
  try {
    const data = bodySchema.parse(await request.json());
    let session = await authorized(data.sessionId, data.token);
    if (!session) {
      const [existing] = await db.select().from(liveChatSessions).where(eq(liveChatSessions.id, data.sessionId)).limit(1);
      if (existing) return NextResponse.json({ error: "Invalid chat session" }, { status: 403 });
      [session] = await db.insert(liveChatSessions).values({ id: data.sessionId, visitorTokenHash: hash(data.token), page: data.page }).returning();
    }

    const id = randomUUID();
    const createdAt = new Date();
    await db.transaction(async tx => {
      await tx.select({id:liveChatSessions.id}).from(liveChatSessions).where(eq(liveChatSessions.id,session.id)).for("update");
      await tx.insert(liveChatMessages).values({ id, sessionId: session.id, sender: "customer", message: data.message, createdAt });
      await tx.update(liveChatSessions).set({ updatedAt: new Date(), status: "open", page: data.page ?? session.page }).where(eq(liveChatSessions.id, session.id));
    });

    after(async () => {
      const botToken = process.env.ADMIN_TELEGRAM_BOT_TOKEN?.trim();
      const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID?.trim();
      if (botToken && chatId) {
        const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(5000), body: JSON.stringify({ chat_id: chatId, text: `<b>New website chat</b>\n\n${escapeHtml(data.message)}\n\n<i>Open the admin inbox to continue the conversation.</i>`, parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "Open admin chat", url: `${siteUrl}/admin/live-chat?session=${encodeURIComponent(session.id)}` }]] } }) }).catch(() => null);
      }

      if (session.handlingMode === "ai") {
        const [before] = await db.select({mode:liveChatSessions.handlingMode}).from(liveChatSessions).where(eq(liveChatSessions.id,session.id)).limit(1);
        if (before?.mode !== "ai") return;
        const recent = await db.select({sender:liveChatMessages.sender,message:liveChatMessages.message}).from(liveChatMessages).where(eq(liveChatMessages.sessionId,session.id)).orderBy(desc(liveChatMessages.createdAt)).limit(30);
        const reply = await generateHumeChatReply(recent.reverse());
        await db.transaction(async tx => {
          const [current] = await tx.select().from(liveChatSessions).where(eq(liveChatSessions.id,session.id)).for("update");
          const [latest] = await tx.select({id:liveChatMessages.id,sender:liveChatMessages.sender}).from(liveChatMessages).where(eq(liveChatMessages.sessionId,session.id)).orderBy(desc(liveChatMessages.createdAt)).limit(1);
          if (!current || current.handlingMode !== "ai" || current.status === "closed" || current.status === "resolved" || latest?.id !== id) return;
          const replyStartedAt = Date.now();
          await tx.insert(liveChatMessages).values(reply.messages.map((message,index)=>({id:randomUUID(),sessionId:session.id,sender:"admin",message,createdAt:new Date(replyStartedAt+index)})));
          await tx.update(liveChatSessions).set({updatedAt:new Date(),...(reply.handoff?{handlingMode:"manual",status:"waiting"}:{})}).where(eq(liveChatSessions.id,session.id));
        });
      }
    });
    return NextResponse.json({ ok: true, message: { id, sender: "customer", message: data.message, createdAt: createdAt.toISOString() } });
  } catch (error) {
    console.error("Live chat send failed:", error);
    return NextResponse.json({ error: "Message could not be sent" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId") || "";
    const token = request.nextUrl.searchParams.get("token") || "";
    const after = request.nextUrl.searchParams.get("after");
    const session = await authorized(sessionId, token);
    if (!session) return NextResponse.json({ error: "Invalid chat session" }, { status: 403 });
    const condition = after ? and(eq(liveChatMessages.sessionId, sessionId), gt(liveChatMessages.createdAt, new Date(after))) : eq(liveChatMessages.sessionId, sessionId);
    const rows = await db.select({ id: liveChatMessages.id, sender: liveChatMessages.sender, message: liveChatMessages.message, createdAt: liveChatMessages.createdAt }).from(liveChatMessages).where(condition).orderBy(asc(liveChatMessages.createdAt)).limit(100);
    return NextResponse.json({ messages: rows, handlingMode: session.handlingMode, status: session.status }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return NextResponse.json({ messages: [] }); }
}
