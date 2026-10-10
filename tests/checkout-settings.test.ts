import assert from "node:assert/strict";
import test from "node:test";
import { secureCheckoutConfigured, errorMonitoringConfigured } from "../lib/checkout-settings";
import { checkoutSigningSecret } from "../lib/checkout-signing-secret";
test("default settings and stable domain-separated signing reuse existing server configuration", () => {
  const names = ["ENABLE_SECURE_CHECKOUT", "ENABLE_ERROR_MONITORING", "CHECKOUT_SESSION_SIGNING_SECRET", "RAZORPAY_KEY_SECRET"] as const;
  const original = names.map(name => process.env[name]);
  try {
    for (const name of names) delete process.env[name];
    assert.equal(secureCheckoutConfigured(), true);
    assert.equal(errorMonitoringConfigured(), true);
    assert.equal(checkoutSigningSecret(), undefined);
    process.env.RAZORPAY_KEY_SECRET = "fixture-payment-secret";
    const derived = checkoutSigningSecret();
    assert.equal(derived?.length, 64);
    assert.equal(checkoutSigningSecret(), derived);
    assert.notEqual(derived, process.env.RAZORPAY_KEY_SECRET);
    process.env.RAZORPAY_KEY_SECRET = "different-fixture-secret";
    assert.notEqual(checkoutSigningSecret(), derived);
    process.env.CHECKOUT_SESSION_SIGNING_SECRET = "dedicated-fixture-secret";
    assert.equal(checkoutSigningSecret(), "dedicated-fixture-secret");
    process.env.ENABLE_SECURE_CHECKOUT = "false";
    process.env.ENABLE_ERROR_MONITORING = "false";
    assert.equal(secureCheckoutConfigured(), false);
    assert.equal(errorMonitoringConfigured(), false);
  } finally {
    names.forEach((name, i) => { if (original[i] === undefined) delete process.env[name]; else process.env[name] = original[i]; });
  }
});
