import { and, desc, eq, gte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { liveChatMessages, liveChatSessions } from "@/db/schema";
import { generateHumeChatDraft } from "@/lib/ai/live-chat";
import { requireAdminToken } from "@/lib/admin-auth";

import { chatCutoff } from "@/lib/live-chat-retention";

const schema = z.object({ sessionId: z.string().min(1).max(255) });

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  try {
    const { sessionId } = schema.parse(await request.json());
    const [session] = await db.select({ id: liveChatSessions.id }).from(liveChatSessions).where(eq(liveChatSessions.id, sessionId)).limit(1);
    if (!session) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    const messages = await db.select({ sender: liveChatMessages.sender, message: liveChatMessages.message }).from(liveChatMessages).where(and(eq(liveChatMessages.sessionId, sessionId), gte(liveChatMessages.createdAt, chatCutoff()))).orderBy(desc(liveChatMessages.createdAt), desc(liveChatMessages.id)).limit(30);
    if (!messages.length) return NextResponse.json({ error: "No retained messages" }, { status: 404 });
    messages.reverse();
    const draftMessages = await generateHumeChatDraft(messages);
    if (!draftMessages) return NextResponse.json({ error: "An AI draft is unavailable right now. You can still write and send a reply." }, { status: 503 });
    return NextResponse.json({ draft: draftMessages.join("\n\n") });
  } catch (error) {
    console.error("Live chat AI draft failed:", error);
    return NextResponse.json({ error: "AI draft could not be generated" }, { status: 500 });
  }
}
