import "server-only";
import { buildChatPrompt, humanSupportReply, parseChatReply, type ChatTurn } from "./live-chat-core";
import { chatKnowledgeFor } from "./live-chat-knowledge";

async function requestReply(turns: ChatTurn[], knowledgeProvider: typeof chatKnowledgeFor, draft = false) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  try {
    const prompt = buildChatPrompt(turns, await knowledgeProvider(turns));
    const instruction = draft
      ? "Draft a reply for a HUME support team member to review and send. Do not say you are handing the chat off. Ask for the minimum information the team needs, such as an order number. Do not claim the team has investigated, changed or approved anything.\n\n"
      : "";
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instruction + prompt.system }] },
        contents: [{ role: "user", parts: [{ text: prompt.conversation }] }],
        generationConfig: { temperature: 0.25, maxOutputTokens: 600 },
      }),
    });
    if (!response.ok) return null;
    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }> };
    const text = data.candidates?.[0]?.content?.parts?.filter(part => !part.thought).map(part => part.text || "").join("") || "";
    return parseChatReply(text);
  } catch {
    return null;
  }
}

export async function generateHumeChatReply(turns: ChatTurn[], knowledgeProvider = chatKnowledgeFor): Promise<{ messages: string[]; handoff: boolean }> {
  const handoff = humanSupportReply(turns);
  if (handoff) return { messages: handoff, handoff: true };
  const messages = await requestReply(turns, knowledgeProvider);
  if (messages) return { messages, handoff: false };
  return { messages: ["I can’t confirm that accurately right now. I’ll leave your message for the HUME team to help."], handoff: true };
}

export async function generateHumeChatDraft(turns: ChatTurn[]) {
  return requestReply(turns, chatKnowledgeFor, true);
}
