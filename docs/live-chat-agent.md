# HUME live-chat agent

The site uses `LiveChatWidget` and the `/api/live-chat/messages` endpoint. `AIChatBot.tsx` is not the mounted live-chat widget.

`lib/ai/hume-sales-playbook.ts` defines brand voice and verified shipping/returns/payment boundaries. Keep shipping and return wording synchronized with the published policy pages when those policies change. The assistant identifies as HUME's AI assistant rather than impersonating a named team member.

`lib/ai/live-chat-knowledge.ts` reads current catalogue names, inspiration, notes, listed performance estimates, INR prices, availability, sample eligibility, public coupon terms and admin shipping/gift/payment settings. Knowledge is cached for 60 seconds with catalogue/settings/coupon tags. Recommendations receive a relevant subset; checkout remains authoritative for final stock and pricing. Do not add private coupons or customer/order records to this context.

Recent conversation history is loaded newest-first then put in chronological order. Phone/email and labelled OTP/password/payment secrets are redacted before the provider request. No authenticated order lookup or financial action is exposed to the model.

Order-specific problems, ambiguous payments, complaints, explicit human requests, or AI/knowledge failures leave a concise reply and move the chat to manual handling with waiting status. Admin replies automatically pause AI. The team can explicitly enable AI again from the inbox. Generated replies are discarded if a newer message arrived, the conversation closed, or a human took over before the reply completed; database session-row locks serialize these decisions with message writes.

Telegram alerts still link to the admin inbox. They run independently of the AI reply; delivery failures are logged without including the alert body or bot token. Tests and manual synthetic provider checks must call the generator directly, not the public message API, to avoid notifying staff or sending test messages to customers.

The agent does not approve refunds, cancel orders, promise delivery dates, confirm payment from an order number, or invent stock counts. It never changes checkout, payments or product data.

Checks: `node --import tsx --test tests/live-chat.test.ts tests/ai-provider.test.ts`, TypeScript and focused ESLint. Synthetic live-model checks cover budget recommendations, COD and Discovery Set contents/price without creating chat sessions or sending notifications.

Admin inbox: search matches the customer ID, starting page, or any retained message. Status filters and paging apply to the entire retained inbox. Sessions with no retained messages are hidden. Direct links open a conversation independently of the selected filters or page. Admins can load earlier messages, take over, or re-enable AI. A new customer message in manual mode marks the conversation as needing a reply. Older chat records stored before AI and human sender labels were separated still display as HUME replies.

Customer history is tied to the chat credential saved in that browser, independently of cart and checkout IDs. Existing saved credentials continue to work. Chat history cannot be recovered from a browser that has lost or overwritten its credential. Legacy cart dashboard links still work when the old chat and cart IDs match; use the Support inbox for all new chats.

The website and AI context show messages from the last 120 hours. The Cloudflare Worker runs cleanup every hour at minute 15 UTC and removes expired message rows and inactive sessions with no remaining messages. Deploying the Worker enables the schedule and the first run will remove already-expired rows. This scope covers chat tables only; previously sent Telegram messages and existing database backups follow their own retention. No schema change is needed on databases already set up with `sql/add_live_chat.sql`.

Build the Cloudflare Worker with `npm run build:cf`. The OpenNext config pins Webpack because the Windows Turbopack build can pass bundling checks but fail to load server chunks at runtime. Before promoting a new Worker version, smoke-test the storefront, admin sign-in and chat endpoints in its preview.

Integration check: `node --conditions=react-server --require ./scripts/server-only-test-register.cjs --import tsx scripts/verify-admin-chat.ts`. It inserts and removes isolated fixtures and verifies admin search, customer history, identical timestamps, token isolation, retries, and handling controls. To exercise actual deletion, initialize a disposable localhost database named `hume_chat_test` with the chat schema, point `DATABASE_URL` at it, and set `TEST_CHAT_PURGE=1`. Never point the purge check at a shared database.
