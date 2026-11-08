// Uses synthetic fixtures only. Physical purge is tested only against a disposable local database.
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { config } from "dotenv";
import { eq, inArray } from "drizzle-orm";
import { NextRequest } from "next/server";
import postgres from "postgres";
import { CHAT_RETENTION_MS } from "../lib/live-chat-retention";
import { purgeLiveChat } from "../lib/purge-live-chat";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

async function main() {
  const { db } = await import("../db");
  const { liveChatSessions, liveChatMessages } = await import("../db/schema");
  const admin = await import("../app/api/admin/live-chat/route");
  const customer = await import("../app/api/live-chat/messages/route");
  const id = "verify-inbox-" + randomUUID();
  const expiredId = id + "-expired";
  const emptyId = id + "-empty";
  const token = randomUUID() + randomUUID();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const now = Date.now();
  const expiredAt = new Date(now - CHAT_RETENTION_MS - 60_000);
  const earliest = "search-only-" + randomUUID();
  const makeRequest = (path: string, options: RequestInit = {}, chatToken = token) => new NextRequest("http://localhost" + path, {
    method: options.method,
    body: typeof options.body === "string" ? options.body : undefined,
    headers: { "x-admin-token": process.env.ADMIN_API_TOKEN || "", "x-chat-token": chatToken, "Content-Type": "application/json" },
  });
  const inbox = "/api/admin/live-chat";
  const chat = "/api/live-chat/messages?sessionId=";
  const ids = [id, expiredId, emptyId];
  const oldestMessage = randomUUID();
  const recent = Array.from({ length: 115 }, (_, i) => ({
    id: randomUUID(), sessionId: id, sender: i === 114 ? "ai" : "customer", message: i === 0 ? earliest : "Fixture " + i,
    createdAt: new Date(now - 200_000 + Math.floor(i / 2) * 1000 + (i === 114 ? 1000 : 0)),
  }));

  try {
    await db.insert(liveChatSessions).values([
      { id, visitorTokenHash: tokenHash, handlingMode: "manual", status: "waiting" },
      { id: expiredId, visitorTokenHash: tokenHash, createdAt: expiredAt, updatedAt: expiredAt },
      { id: emptyId, visitorTokenHash: tokenHash },
    ]);
    await db.insert(liveChatMessages).values([
      ...recent,
      { id: oldestMessage, sessionId: id, sender: "customer", message: "Expired message", createdAt: expiredAt },
      { id: randomUUID(), sessionId: expiredId, sender: "customer", message: "Expired conversation", createdAt: expiredAt },
    ]);

    const response = await admin.GET(makeRequest(inbox + "?session=" + id + "&q=" + earliest));
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.sessions.length, 1);
    assert.equal(data.sessions[0].id, id);
    assert.equal(data.selected.messageCount, 115);
    assert.equal(data.selected.lastMessage.message, "Fixture 114");
    assert.equal(data.messages.length, 100);
    const hidden = await admin.GET(makeRequest(inbox + "?session=" + expiredId + "&q=" + id));
    assert.equal((await hidden.json()).selected, null);
    const empty = await admin.GET(makeRequest(inbox + "?q=" + emptyId));
    assert.deepEqual((await empty.json()).sessions, []);

    const latest = await customer.GET(makeRequest(chat + id));
    assert.equal(latest.status, 200);
    const newest = await latest.json();
    assert.equal(newest.hasMore, true);
    assert.equal(newest.messages.at(-1).message, "Fixture 114");
    const before = "&before=" + newest.messages[0].id;
    const earlier = await (await customer.GET(makeRequest(chat + id + before))).json();
    const earlierAdmin = await (await admin.GET(makeRequest(inbox + "?session=" + id + before))).json();
    assert.equal(earlier.messages.length, 15);
    assert.equal(earlierAdmin.messages.length, 15);
    assert.equal(earlier.hasMore, false);
    assert.equal(new Set([...earlier.messages, ...newest.messages].map(m => m.id)).size, 115);
    assert.equal((await customer.GET(makeRequest(chat + id, {}, "wrong-token".repeat(4)))).status, 403);
    assert.deepEqual((await (await customer.GET(makeRequest(chat + expiredId))).json()).messages, []);

    const retry = recent[0];
    const duplicate = await customer.POST(makeRequest(chat + id, {
      method: "POST", body: JSON.stringify({ sessionId: id, token, messageId: retry.id, message: retry.message }),
    }));
    assert.equal(duplicate.status, 200);
    assert.equal((await duplicate.json()).message.id, retry.id);

    const patch = (patch: object) => admin.PATCH(makeRequest(inbox, { method: "PATCH", body: JSON.stringify({ sessionId: id, ...patch }) }));
    assert.equal((await (await patch({ handlingMode: "ai" })).json()).session.status, "open");
    assert.equal((await (await patch({ status: "closed" })).json()).session.handlingMode, "manual");

    if (process.env.TEST_CHAT_PURGE === "1") {
      const url = new URL(process.env.DATABASE_URL!);
      assert.equal(url.hostname, "127.0.0.1");
      assert.equal(url.pathname, "/hume_chat_test");
      const client = postgres(url.toString(), { max: 1, prepare: false });
      try {
        const result = await purgeLiveChat(client, now);
        assert.equal(result.messages, 2);
        assert.equal(result.sessions, 1);
        assert.deepEqual(await purgeLiveChat(client, now), { messages: 0, sessions: 0 });
        assert.equal((await db.select().from(liveChatSessions).where(eq(liveChatSessions.id, id))).length, 1);
        assert.equal((await db.select().from(liveChatMessages).where(eq(liveChatMessages.sessionId, id))).length, 115);
      } finally {
        await client.end();
      }
    }
    const sent = await admin.POST(makeRequest(inbox, {
      method: "POST", body: JSON.stringify({ sessionId: id, message: "Fixture team reply" }),
    }));
    assert.equal(sent.status, 200);
    const reply = await (await customer.GET(makeRequest(chat + id))).json();
    assert.equal(reply.handlingMode, "manual");
    assert.equal(reply.messages.at(-1).message, "Fixture team reply");
    console.log("Passed: inbox search, retained history, timestamp ties, session isolation, retry deduplication, handoff controls and reply delivery" + (process.env.TEST_CHAT_PURGE === "1" ? ", plus physical cleanup." : "."));
  } finally {
    await db.delete(liveChatSessions).where(inArray(liveChatSessions.id, ids));
  }
}

main().then(() => process.exit(0)).catch(error => { console.error(error); process.exit(1); });
