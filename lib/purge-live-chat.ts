import type postgres from "postgres";
import { chatCutoff } from "./live-chat-retention";

export async function purgeLiveChat(client: postgres.Sql, now = Date.now()) {
  const cutoff = chatCutoff(now).toISOString();
  return client.begin(async tx => {
    const expired = await tx.unsafe("delete from live_chat_messages where created_at < $1::timestamp", [cutoff]);
    const empty = await tx.unsafe(`
      delete from live_chat_sessions s
      where s.updated_at < $1::timestamp
        and not exists (select 1 from live_chat_messages m where m.session_id = s.id)
    `, [cutoff]);
    return { messages: expired.count, sessions: empty.count };
  });
}
