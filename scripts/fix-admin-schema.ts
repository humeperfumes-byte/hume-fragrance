import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function migrate() {
  console.log("🔄 Starting admin panel database migration...\n");

  // Each migration is idempotent (IF NOT EXISTS / safe ALTER)
  const migrations: { label: string; query: string }[] = [
    // ── checkout_drafts: add missing UTM + lead columns ──
    {
      label: "checkout_drafts: add utm_source",
      query: `ALTER TABLE checkout_drafts ADD COLUMN IF NOT EXISTS utm_source VARCHAR(120)`,
    },
    {
      label: "checkout_drafts: add utm_medium",
      query: `ALTER TABLE checkout_drafts ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(120)`,
    },
    {
      label: "checkout_drafts: add utm_campaign",
      query: `ALTER TABLE checkout_drafts ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(180)`,
    },
    {
      label: "checkout_drafts: add utm_term",
      query: `ALTER TABLE checkout_drafts ADD COLUMN IF NOT EXISTS utm_term VARCHAR(180)`,
    },
    {
      label: "checkout_drafts: add utm_content",
      query: `ALTER TABLE checkout_drafts ADD COLUMN IF NOT EXISTS utm_content VARCHAR(180)`,
    },
    {
      label: "checkout_drafts: add lead_status",
      query: `ALTER TABLE checkout_drafts ADD COLUMN IF NOT EXISTS lead_status VARCHAR(50) NOT NULL DEFAULT 'new'`,
    },
    {
      label: "checkout_drafts: add lead_notes",
      query: `ALTER TABLE checkout_drafts ADD COLUMN IF NOT EXISTS lead_notes TEXT`,
    },
    {
      label: "checkout_drafts: add last_contacted_at",
      query: `ALTER TABLE checkout_drafts ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP`,
    },
    {
      label: "checkout_drafts: add next_follow_up_at",
      query: `ALTER TABLE checkout_drafts ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMP`,
    },
    {
      label: "checkout_drafts: add whatsapp_initiated_at",
      query: `ALTER TABLE checkout_drafts ADD COLUMN IF NOT EXISTS whatsapp_initiated_at TIMESTAMP`,
    },
    {
      label: "checkout_drafts: add acquisition_source",
      query: `ALTER TABLE checkout_drafts ADD COLUMN IF NOT EXISTS acquisition_source VARCHAR(100)`,
    },
    {
      label: "checkout_drafts: add acquisition_category",
      query: `ALTER TABLE checkout_drafts ADD COLUMN IF NOT EXISTS acquisition_category VARCHAR(50)`,
    },
    {
      label: "checkout_drafts: add acquisition_referrer_host",
      query: `ALTER TABLE checkout_drafts ADD COLUMN IF NOT EXISTS acquisition_referrer_host VARCHAR(255)`,
    },
    {
      label: "checkout_drafts: add country",
      query: `ALTER TABLE checkout_drafts ADD COLUMN IF NOT EXISTS country VARCHAR(8)`,
    },
    {
      label: "checkout_drafts: add last_edited_field",
      query: `ALTER TABLE checkout_drafts ADD COLUMN IF NOT EXISTS last_edited_field VARCHAR(100)`,
    },

    // ── orders: add missing UTM columns ──
    {
      label: "orders: add utm_source",
      query: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS utm_source VARCHAR(120)`,
    },
    {
      label: "orders: add utm_medium",
      query: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(120)`,
    },
    {
      label: "orders: add utm_campaign",
      query: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(180)`,
    },
    {
      label: "orders: add utm_term",
      query: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS utm_term VARCHAR(180)`,
    },
    {
      label: "orders: add utm_content",
      query: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS utm_content VARCHAR(180)`,
    },
    {
      label: "orders: add acquisition_source",
      query: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS acquisition_source VARCHAR(100)`,
    },
    {
      label: "orders: add acquisition_category",
      query: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS acquisition_category VARCHAR(50)`,
    },
    {
      label: "orders: add acquisition_referrer_host",
      query: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS acquisition_referrer_host VARCHAR(255)`,
    },

    // ── Create tables if they don't exist ──
    {
      label: "Create behavioral_events table",
      query: `CREATE TABLE IF NOT EXISTS behavioral_events (
        id VARCHAR(255) PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        path VARCHAR(2048),
        element_id VARCHAR(255),
        element_text TEXT,
        section_name VARCHAR(255),
        scroll_depth INTEGER,
        dwell_time_ms INTEGER,
        ip_address VARCHAR(255),
        user_agent TEXT,
        payload JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
    },
    {
      label: "Create session_intelligence table",
      query: `CREATE TABLE IF NOT EXISTS session_intelligence (
        id VARCHAR(255) PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL UNIQUE,
        intent_score INTEGER NOT NULL DEFAULT 0,
        abandonment_risk INTEGER NOT NULL DEFAULT 0,
        predicted_next_action VARCHAR(100),
        top_abandonment_cause VARCHAR(100),
        current_section VARCHAR(255),
        total_interactions INTEGER NOT NULL DEFAULT 0,
        last_active_at TIMESTAMP NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
    },
    {
      label: "Create section_attribution table",
      query: `CREATE TABLE IF NOT EXISTS section_attribution (
        id VARCHAR(255) PRIMARY KEY,
        path VARCHAR(2048) NOT NULL,
        section_name VARCHAR(255) NOT NULL,
        views INTEGER NOT NULL DEFAULT 0,
        interactions INTEGER NOT NULL DEFAULT 0,
        conversions INTEGER NOT NULL DEFAULT 0,
        attribution_score DECIMAL(5,2) NOT NULL DEFAULT 0,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
    },
    {
      label: "Create coupon_code_events table",
      query: `CREATE TABLE IF NOT EXISTS coupon_code_events (
        id VARCHAR(255) PRIMARY KEY,
        session_id VARCHAR(255),
        channel VARCHAR(30) NOT NULL,
        event_type VARCHAR(50) NOT NULL DEFAULT 'sent',
        coupon_code VARCHAR(100),
        destination VARCHAR(255),
        path VARCHAR(2048),
        referrer VARCHAR(2048),
        country VARCHAR(8),
        ip_address VARCHAR(255),
        user_agent TEXT,
        payload JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
    },

    // ── Products: add missing columns ──
    {
      label: "products: add primary_blog_slug",
      query: `ALTER TABLE products ADD COLUMN IF NOT EXISTS primary_blog_slug VARCHAR(255)`,
    },
    {
      label: "products: add visibility",
      query: `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_visibility') THEN
          CREATE TYPE product_visibility AS ENUM ('public', 'seo_only');
        END IF;
      END $$`,
    },
    {
      label: "products: add visibility column",
      query: `ALTER TABLE products ADD COLUMN IF NOT EXISTS visibility product_visibility NOT NULL DEFAULT 'public'`,
    },

    // ── Unique constraint on checkout_drafts.session_id (safe) ──
    {
      label: "checkout_drafts: add unique constraint on session_id (safe)",
      query: `DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'checkout_drafts_session_id_unique'
        ) THEN
          ALTER TABLE checkout_drafts ADD CONSTRAINT checkout_drafts_session_id_unique UNIQUE (session_id);
        END IF;
      END $$`,
    },
  ];

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const m of migrations) {
    try {
      await sql(m.query);
      console.log(`  ✅ ${m.label}`);
      success++;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      // "already exists" is fine — just skip
      if (msg.includes("already exists") || msg.includes("duplicate")) {
        console.log(`  ⏭️  ${m.label} (already exists, skipped)`);
        skipped++;
      } else {
        console.error(`  ❌ ${m.label}: ${msg}`);
        failed++;
      }
    }
  }

  console.log(`\n🏁 Migration complete: ${success} applied, ${skipped} skipped, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

migrate().catch((err) => {
  console.error("Migration script failed:", err);
  process.exit(1);
});
