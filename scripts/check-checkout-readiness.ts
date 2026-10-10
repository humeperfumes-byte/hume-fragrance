import { config } from "dotenv";
import postgres from "postgres";
config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

async function main() {
  let incomplete = false;
  const check = (name: string, ok: boolean) => { console.log(`${ok ? "PASS" : "MISSING"}: ${name}`); if (!ok) incomplete = true; };
  check("Secure checkout enabled (default on)", process.env.ENABLE_SECURE_CHECKOUT !== "false");
  check("Error monitoring enabled (default on)", process.env.ENABLE_ERROR_MONITORING !== "false");
  check("Stable signing source: dedicated secret or existing server payment secret", process.env.CHECKOUT_SESSION_SIGNING_SECRET ? process.env.CHECKOUT_SESSION_SIGNING_SECRET.length >= 32 : !!process.env.RAZORPAY_KEY_SECRET);
  check("Razorpay private key and secret present", !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET);
  check("Browser Razorpay key matches server key", !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID === process.env.RAZORPAY_KEY_ID);
  check("Webhook signing secret present", !!process.env.RAZORPAY_WEBHOOK_SECRET);
  check("Reconciliation cron secret present", (process.env.CRON_SECRET?.length || 0) >= 32);
  console.log(`INFO: Razorpay mode is ${process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") ? "test" : process.env.RAZORPAY_KEY_ID?.startsWith("rzp_live_") ? "live" : "unknown"}; no provider requests are made by this check.`);
  const alert = process.env.ERROR_ALERT_WEBHOOK_URL;
  let alertValid = false;
  try { alertValid = !!alert && new URL(alert).protocol === "https:"; } catch { /* Report only presence/validity. */ }
  check("HTTPS error-alert destination configured", alertValid);
  check("Database connection configured", !!process.env.DATABASE_URL);
  if (process.env.DATABASE_URL) {
    const connection = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, connect_timeout: 5, idle_timeout: 5 });
    try {
      const columns = await connection<{ table_name: string; column_name: string }[]>`select table_name, column_name from information_schema.columns where table_schema = 'public' and table_name in ('secure_checkout_sessions', 'safe_diagnostics', 'customer_access_links')`;
      for (const [table, column] of [["secure_checkout_sessions", "expected_payment_minor"], ["safe_diagnostics", "reference"], ["customer_access_links", "token_hash"]]) check(`Storage: ${table}.${column}`, columns.some(row => row.table_name === table && row.column_name === column));
    } catch { check("Database schema readable", false); }
    finally { await connection.end(); }
  }
  console.log("MANUAL: Real test-mode payments, staging webhook delivery, deployed private-page headers and hosting log redaction must be checked separately.");
  process.exitCode = incomplete ? 1 : 0;
}
main().catch(() => { console.error("Readiness check unavailable; no secrets were printed."); process.exitCode = 1; });
