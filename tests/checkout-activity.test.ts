import assert from "node:assert/strict";
import test from "node:test";
import { appendCheckoutActivity, readCheckoutActivity } from "../lib/checkout-activity";
test("activity is bounded, duplicate exits deduplicated and existing history preserved", () => {
  const first = { event: "page_hidden" as const, at: "2026-10-11T12:00:00Z" };
  assert.equal(appendCheckoutActivity([first], { ...first, at: "2026-10-11T12:00:01Z" }).length, 1);
  const history = Array.from({ length: 80 }, (_, index) => ({ event: "opened" as const, at: new Date(index * 10000).toISOString() }));
  const next = appendCheckoutActivity(history, { event: "reason_given", at: first.at, reason: "full_cod" });
  assert.equal(next.length, 80);
  assert.equal(next.at(-1)?.reason, "full_cod");
});
test("activity reader excludes unknown events, arbitrary reasons, invalid dates and customer metadata", () => {
  const valid = { event: "opened", at: "2026-10-11T12:00:00Z" };
  assert.deepEqual(readCheckoutActivity([{ ...valid, phone: "private", url: "private" }, { ...valid, event: "fake" }, { ...valid, reason: "private customer text" }, { ...valid, at: "invalid" }]), [valid]);
  assert.deepEqual(readCheckoutActivity(null), []);
});
