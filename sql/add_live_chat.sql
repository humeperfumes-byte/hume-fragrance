CREATE TABLE IF NOT EXISTS live_chat_sessions (
  id VARCHAR(255) PRIMARY KEY,
  visitor_token_hash VARCHAR(64) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  handling_mode VARCHAR(20) NOT NULL DEFAULT 'ai',
  page VARCHAR(2048),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS live_chat_sessions_updated_idx ON live_chat_sessions(updated_at);
ALTER TABLE live_chat_sessions ADD COLUMN IF NOT EXISTS handling_mode VARCHAR(20) NOT NULL DEFAULT 'ai';

CREATE TABLE IF NOT EXISTS live_chat_messages (
  id VARCHAR(255) PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL REFERENCES live_chat_sessions(id) ON DELETE CASCADE,
  sender VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  telegram_message_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS live_chat_messages_session_created_idx ON live_chat_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS live_chat_messages_telegram_idx ON live_chat_messages(telegram_message_id);
