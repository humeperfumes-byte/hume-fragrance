# HUME live-chat agent

The site uses `LiveChatWidget` and the `/api/live-chat/messages` endpoint. `AIChatBot.tsx` is not the mounted live-chat widget.

`lib/ai/hume-sales-playbook.ts` defines brand voice and verified shipping/returns/payment boundaries. Keep shipping and return wording synchronized with the published policy pages when those policies change. The assistant identifies as HUME's AI assistant rather than impersonating a named team member.

`lib/ai/live-chat-knowledge.ts` reads current catalogue names, inspiration, notes, listed performance estimates, INR prices, availability, sample eligibility, public coupon terms and admin shipping/gift/payment settings. Knowledge is cached for 60 seconds with catalogue/settings/coupon tags. Recommendations receive a relevant subset; checkout remains authoritative for final stock and pricing. Do not add private coupons or customer/order records to this context.

Recent conversation history is loaded newest-first then put in chronological order. Phone/email and labelled OTP/password/payment secrets are redacted before the provider request. No authenticated order lookup or financial action is exposed to the model.

Order-specific problems, ambiguous payments, complaints, explicit human requests, or AI/knowledge failures leave a concise reply and move the chat to manual handling with waiting status. Admin replies automatically pause AI. The team can explicitly enable AI again from the inbox. Generated replies are discarded if a newer message arrived, the conversation closed, or a human took over before the reply completed; database session-row locks serialize these decisions with message writes.

The existing Telegram notification path is unchanged. Tests and manual synthetic provider checks must call the generator directly, not the public message API, to avoid notifying staff or sending test messages to customers.

The agent does not approve refunds, cancel orders, promise delivery dates, confirm payment from an order number, or invent stock counts. It never changes checkout, payments or product data.

Checks: `node --import tsx --test tests/live-chat.test.ts tests/ai-provider.test.ts`, TypeScript and focused ESLint. Synthetic live-model checks cover budget recommendations, COD and Discovery Set contents/price without creating chat sessions or sending notifications.
