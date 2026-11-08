export const CHAT_RETENTION_MS = 5 * 24 * 60 * 60 * 1000;
export const chatCutoff = (now = Date.now()) => new Date(now - CHAT_RETENTION_MS);
