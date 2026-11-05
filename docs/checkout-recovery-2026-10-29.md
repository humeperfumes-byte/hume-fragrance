# Checkout recovery review — 29 October 2026

Implemented locally in the checkout admin panel.

- Queues for open, due, payment issues, recently active, missing contact, recovered and lost checkouts, with search, sorting and pages of 25 rows.
- Orders match the exact checkout session and the newest matching order. A payment authorization is not presented as a completed recovery.
- Older overdue follow-ups remain visible outside the default date window. A visible notice explains the 500-record cap.
- Notes, next follow-up, explicit contact recording, and bounded workflow history are stored in existing draft metadata. Admin saves preserve customer activity time and offer metadata.
- Approved price changes require a reason and cannot change a checkout that already has an order. Stale admin edits are rejected.
- Order creation checks current products, pricing and delivery details, locks the session, and reuses the existing secure checkout identity. It creates an unpaid order, records an audit entry, and does not send a customer notification.
- Recovery messages can be reviewed, copied, or opened in WhatsApp/email. Opening a composer never sends a message or marks the lead contacted.
- Recovery links use the existing scoped, revocable capabilities. The separate original-browser owner cookie is still required to restore private checkout details. Another browser does not receive the customer's saved address from possession of the link alone.
- Saved billing data that does not reconcile is labelled as inferred; approved total adjustments are shown separately when applicable.

Validation: 24 focused tests passed, including in-memory endpoint concurrency, price changes, contact recording, ownership, expiry and revocation cases. TypeScript and targeted ESLint passed. Browser review covered the queue, details and message preview at desktop and 390px mobile widths. The browser link-generation response was mocked; no real link was generated or customer contacted during UI review.

The existing production-mode localhost server on port 3002 was left running. A separate development preview runs on port 3003. No deployment, push or database migration was performed for this work. Earlier diagnostic logging changes remain separate local work.
