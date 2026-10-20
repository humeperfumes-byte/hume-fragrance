// Additive indexes only. Concurrent creation keeps customer/order writes available.
import { config } from 'dotenv';
import postgres from 'postgres';
config({ path: '.env.local', quiet: true }); config({ path: '.env', quiet: true });
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
const client = postgres(process.env.DATABASE_URL, { prepare: false, max: 1, connect_timeout: 10 });
try {
  await client`set lock_timeout = '5s'`;
  await client`set statement_timeout = '60s'`;
  for (const table of ['orders', 'checkout_drafts']) {
    const digits = `regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g')`;
    const phone = `case when coalesce(phone, '') ~ '^[+0-9[:space:]().-]+$' and ${digits} ~ '^(91|0091|0)?[6-9][0-9]{9}$' then right(${digits}, 10) else null end`;
    await client.unsafe(`create index concurrently if not exists ${table}_crm_phone_idx on ${table} ((${phone}))`);
    await client.unsafe(`create index concurrently if not exists ${table}_crm_email_idx on ${table} ((lower(trim(email))))`);
    await client.unsafe(`create index concurrently if not exists ${table}_crm_updated_idx on ${table} (updated_at desc, id)`);
  }
  console.log('Customer mobile/email lookup and history pagination indexes are ready. Existing data was not changed.');
} finally { await client.end(); }
