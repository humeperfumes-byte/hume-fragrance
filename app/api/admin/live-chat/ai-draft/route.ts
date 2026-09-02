import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { liveChatMessages, liveChatSessions } from "@/db/schema";
import { generatePrakharChatReply } from "@/lib/ai/live-chat";
import { requireAdminToken } from "@/lib/admin-auth";

const schema = z.object({ sessionId: z.string().min(1).max(255) });

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  try {
    const { sessionId } = schema.parse(await request.json());
    const [session] = await db.select({ id: liveChatSessions.id }).from(liveChatSessions).where(eq(liveChatSessions.id, sessionId)).limit(1);
    if (!session) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    const messages = await db.select({ sender: liveChatMessages.sender, message: liveChatMessages.message }).from(liveChatMessages).where(eq(liveChatMessages.sessionId, sessionId)).orderBy(asc(liveChatMessages.createdAt)).limit(30);
    const draftMessages = await generatePrakharChatReply(messages, "draft");
    if (!draftMessages) return NextResponse.json({ error: "AI is unavailable. Check the Gemini configuration." }, { status: 503 });
    return NextResponse.json({ draft: draftMessages.join("\n\n") });
  } catch (error) {
    console.error("Live chat AI draft failed:", error);
    return NextResponse.json({ error: "AI draft could not be generated" }, { status: 500 });
  }
}
