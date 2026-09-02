import "server-only";
import { HUME_SALES_PLAYBOOK } from "@/lib/ai/hume-sales-playbook";

type ChatTurn = { sender: string; message: string };

function getVerifiedIntentReply(turns: ChatTurn[]): string[] | null {
  const latestCustomer = [...turns].reverse().find(turn => turn.sender === "customer")?.message.trim().toLowerCase() ?? "";
  const previousPrakhar = [...turns].reverse().find(turn => turn.sender !== "customer")?.message.trim().toLowerCase() ?? "";
  const recentConversation = turns.slice(-8).map(turn => turn.message.toLowerCase()).join(" ");

  if (/\b(cod|cash on delivery)\b/.test(latestCustomer)) {
    return ["Yes, we have partial COD. You pay 20% now and the remaining 80% on delivery."];
  }

  if (/\b(any other|other option|more option|something else|different option)/.test(latestCustomer)
    && /aventus|hugo boss men|most wanted|pacific chill/.test(recentConversation)) {
    return [
      "Yes, here are four more options with different styles:",
      "1. Viking Spirit — dark and woody\n2. Bleu EDP — fresh\n3. Stronger With You — sweet\n4. Imagine — unique",
    ];
  }

  const acceptsRecommendation = /\b(recommend|suggest)\b/.test(latestCustomer)
    || /^(yes|yeah|ya|sure|okay|ok)(\s|$)/.test(latestCustomer)
    || previousPrakhar.includes("is it for men or women");

  if (acceptsRecommendation) {
    if (previousPrakhar.includes("layer")) {
      return ["Which perfume have you selected? I’ll suggest the best one to layer with it."];
    }

    const mentionsMen = /\b(men|man|male|mens|men's)\b/.test(latestCustomer);
    const mentionsWomen = /\b(women|woman|female|womens|women's|girl|girls)\b/.test(latestCustomer);
    const mentionsQuantity = /\b(one|two|three|four|1|2|3|4)\b/.test(latestCustomer);

    if (mentionsMen && /\b(four|4)\b/.test(latestCustomer)) {
      return [
        "I’m suggesting four different kinds of perfumes, so you get the best variety.",
        "1. Aventus — dark and woody\n2. Hugo Boss Men — fresh\n3. Most Wanted — sweet\n4. Pacific Chill — unique",
      ];
    }

    if (!mentionsMen && !mentionsWomen && !mentionsQuantity) {
      return ["Sure. Is it for men or women, and how many perfumes would you like?"];
    }
  }

  return null;
}

export async function generatePrakharChatReply(turns: ChatTurn[], mode: "first" | "draft" = "first"): Promise<string[] | null> {
  const verifiedIntentReply = getVerifiedIntentReply(turns);
  if (verifiedIntentReply) return verifiedIntentReply;

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const conversation = turns.slice(-16).map(turn => `${turn.sender === "customer" ? "Customer" : "Prakhar"}: ${turn.message}`).join("\n");
  const latestCustomerMessage = [...turns].reverse().find(turn => turn.sender === "customer")?.message ?? "";
  const prompt = [
    mode === "first" ? "You help Prakhar answer the first message in HUME Fragrance website live chat." : "You draft Prakhar's next reply in an ongoing HUME Fragrance website live chat.",
    "Write as Prakhar in first person. Match the wording, brevity, and tone of Prakhar's previous replies in the conversation.",
    "Sound like a helpful Indian store owner chatting personally, not a support bot. Use simple, warm English and address the customer as sir only when it feels natural.",
    "Keep each chat bubble short. A simple answer should be one bubble. If an answer needs more detail, split it into 2 or at most 3 natural bubbles, each normally under 22 words.",
    "Separate chat bubbles with the exact marker |||. Never use that marker inside a bubble.",
    "Do not put every sentence on a new line and do not send a long paragraph. Each bubble must contain one clear thought and the sequence should feel human.",
    "Do not add empty greetings, filler, or generic sales language unless the customer has just started the conversation.",
    "The LATEST CUSTOMER MESSAGE is authoritative. Answer it directly and use earlier messages only as context.",
    "Move the conversation forward. Never repeat a reply, question, offer, or explanation Prakhar already gave unless the customer explicitly asks for it again.",
    "When the customer accepts an offer to recommend, begin the recommendation flow. Do not interpret 'recommend me some' as a request to repeat discounts.",
    "Do not say you are AI. Do not claim an order status, stock level, offer, delivery date, price, similarity, longevity, or policy unless supported by the verified playbook or conversation.",
    "For order questions, ask for the order number. For recommendations, ask one useful preference question if needed.",
    "Never request passwords, OTPs, card details, or sensitive payment information.",
    HUME_SALES_PLAYBOOK,
    "Return plain text only.",
    `Conversation:\n${conversation}`,
    `LATEST CUSTOMER MESSAGE TO ANSWER:\n${latestCustomerMessage}`,
  ].join("\n\n");

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      signal: AbortSignal.timeout(12_000),
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 180 } }),
    });
    if (!response.ok) return null;
    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const raw = data.candidates?.[0]?.content?.parts?.map(part => part.text ?? "").join("").trim();
    if (!raw) return null;
    const replies = raw
      .split("|||")
      .map(reply => reply.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 3);
    return replies.length ? replies : null;
  } catch {
    return null;
  }
}
