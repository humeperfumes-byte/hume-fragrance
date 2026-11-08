import { createHash, randomUUID } from "crypto";
import { and, asc, desc, eq, gt, gte, lt, or } from "drizzle-orm";
import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { liveChatMessages as messages, liveChatSessions as sessions } from "@/db/schema";
import { generateHumeChatReply } from "@/lib/ai/live-chat";
import { chatCutoff } from "@/lib/live-chat-retention";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
const credentials = z.object({ sessionId: z.string().min(1).max(255), token: z.string().min(32).max(255) });
const bodySchema = credentials.extend({ messageId: z.string().uuid().optional(), message: z.string().trim().min(1).max(1200), page: z.string().max(2048).optional() });
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const noCache = { headers: { "Cache-Control": "private, no-store" } };
const publicMessage = ({ id, sender, message, createdAt }: typeof messages.$inferSelect) => ({ id, sender, message, createdAt });

async function answer(sessionId: string, messageId: string) {
  const cutoff = chatCutoff();
  const historyFilter = and(eq(messages.sessionId, sessionId), gte(messages.createdAt, cutoff));
  const [current] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
  if (current?.handlingMode !== "ai" || current.status !== "open") return;
  const recent = await db.select().from(messages).where(historyFilter).orderBy(desc(messages.createdAt), desc(messages.id)).limit(30);
  if (recent[0]?.id !== messageId) return;
  let reply: Awaited<ReturnType<typeof generateHumeChatReply>>;
  try {
    reply = await generateHumeChatReply(recent.reverse());
  } catch {
    reply = { messages: ["I couldn’t answer that just now. I’ve passed your message to the HUME team."], handoff: true };
  }
  await db.transaction(async tx => {
    const [session] = await tx.select().from(sessions).where(eq(sessions.id, sessionId)).for("update");
    if (session?.handlingMode !== "ai" || session.status !== "open") return;
    const [latest] = await tx.select().from(messages).where(historyFilter).orderBy(desc(messages.createdAt), desc(messages.id)).limit(1);
    if (latest?.id !== messageId) return;
    const start = Math.max(Date.now(), latest.createdAt.getTime() + 1);
    await tx.insert(messages).values(reply.messages.map((message, index) => ({ id: randomUUID(), sessionId, sender: "ai", message, createdAt: new Date(start + index) })));
    await tx.update(sessions).set({ updatedAt: new Date(start + reply.messages.length - 1), ...(reply.handoff ? { handlingMode: "manual", status: "waiting" } : {}) }).where(eq(sessions.id, sessionId));
  });
}

const escapeHtml = (value: string) => value.replace(/[&<>]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[character] ?? character));
async function notify(sessionId: string, message: string) {
  const botToken = process.env.ADMIN_TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID?.trim();
  if (!botToken || !chatId) return;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://humefragrance.com").replace(/\/$/, "");
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(5000), body: JSON.stringify({ chat_id: chatId, text: `<b>New website chat</b>\n\n${escapeHtml(message)}\n\n<i>Open the admin inbox to continue the conversation.</i>`, parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "Open admin chat", url: `${siteUrl}/admin/live-chat?session=${encodeURIComponent(sessionId)}` }]] } }) });
  if (!response.ok) throw new Error("Chat notification rejected");
}

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid chat message" }, { status: 400 });
  const { sessionId, token, message, page, messageId = randomUUID() } = parsed.data;
  try {
    const result = await db.transaction(async tx => {
      await tx.insert(sessions).values({ id: sessionId, visitorTokenHash: hash(token), page }).onConflictDoNothing();
      const [session] = await tx.select().from(sessions).where(eq(sessions.id, sessionId)).for("update");
      if (session?.visitorTokenHash !== hash(token)) return { error: 403 } as const;
      const [existing] = await tx.select().from(messages).where(eq(messages.id, messageId));
      if (existing) return existing.sessionId === sessionId && existing.sender === "customer" && existing.message === message
        ? { row: existing, created: false, mode: session.handlingMode } : { error: 409 } as const;
      const active = session.updatedAt >= chatCutoff();
      const mode = active ? session.handlingMode : "ai";
      const createdAt = new Date(Math.max(Date.now(), session.updatedAt.getTime() + 1));
      const [row] = await tx.insert(messages).values({ id: messageId, sessionId, sender: "customer", message, createdAt }).returning();
      await tx.update(sessions).set({ updatedAt: createdAt, handlingMode: mode, status: mode === "manual" ? "waiting" : "open", page: page ?? session.page }).where(eq(sessions.id, sessionId));
      return { row, created: true, mode };
    });
    if (!result.row) return NextResponse.json({ error: "Chat message could not be accepted" }, { status: result.error });
    if (result.created) after(async () => {
      const jobs = [notify(sessionId, message)];
      if (result.mode === "ai") jobs.push(answer(sessionId, messageId));
      const results = await Promise.allSettled(jobs);
      if (results[0].status === "rejected") console.error("Live chat notification failed");
      if (results[1]?.status === "rejected") console.error("Live chat automatic reply failed");
    });
    return NextResponse.json({ message: publicMessage(result.row), handlingMode: result.mode }, noCache);
  } catch {
    console.error("Live chat send failed");
    return NextResponse.json({ error: "Message could not be sent" }, { status: 503 });
  }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const parsed = credentials.safeParse({ sessionId: query.get("sessionId"), token: request.headers.get("x-chat-token") ?? query.get("token") });
  const before = query.get("before");
  const legacyAfter = query.get("after");
  const afterTime = legacyAfter ? new Date(legacyAfter) : null;
  if (!parsed.success || (before && before.length > 255) || (afterTime && !Number.isFinite(afterTime.getTime()))) {
    return NextResponse.json({ error: "Invalid chat request" }, { status: 400 });
  }
  try {
    const { sessionId, token } = parsed.data;
    const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
    if (!session) return NextResponse.json({ messages: [], hasMore: false, handlingMode: "ai" }, noCache);
    if (session.visitorTokenHash !== hash(token)) return NextResponse.json({ error: "Invalid chat session" }, { status: 403 });
    const scope = and(eq(messages.sessionId, sessionId), gte(messages.createdAt, chatCutoff()));
    const [cursor] = before ? await db.select().from(messages).where(and(scope, eq(messages.id, before))) : [];
    if (before && !cursor) return NextResponse.json({ messages: [], hasMore: false, handlingMode: session.handlingMode }, noCache);
    const rows = await db.select().from(messages).where(and(scope,
      cursor ? or(lt(messages.createdAt, cursor.createdAt), and(eq(messages.createdAt, cursor.createdAt), lt(messages.id, cursor.id))) : undefined,
      afterTime ? gt(messages.createdAt, afterTime) : undefined,
    )).orderBy(afterTime ? asc(messages.createdAt) : desc(messages.createdAt), afterTime ? asc(messages.id) : desc(messages.id)).limit(101);
    const page = rows.slice(0, 100);
    if (!afterTime) page.reverse();
    const active = session.updatedAt >= chatCutoff();
    return NextResponse.json({ messages: page.map(publicMessage), hasMore: rows.length > 100, handlingMode: active ? session.handlingMode : "ai", status: active ? session.status : "open" }, noCache);
  } catch {
    return NextResponse.json({ error: "Chat history is temporarily unavailable" }, { status: 503, ...noCache });
  }
}
