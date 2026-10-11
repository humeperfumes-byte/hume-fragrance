import assert from 'node:assert/strict';
import { config } from 'dotenv';
import postgres from 'postgres';
import seo from '../data/programmatic-seo.json';
import { PRODUCT_ID_ALIASES, PRODUCT_ROUTE_ALIASES } from '../lib/product-route-aliases';
import { PERFUME_GUIDES, getGuideCluster } from '../lib/perfume-guides';
config({ path: '.env.local', quiet: true }); config({ path: '.env', quiet: true });
// Read-only catalogue audit: no orders, customer data or catalogue writes.
async function main() {
  const client = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });
  try {
    const rows = await client`select id from products`;
    const ids = new Set(rows.map(row => row.id));
    const references = [...seo.inspirations.map(item => item.humeProduct.slug), ...seo.alternatives.flatMap(item => item.humeProducts), ...Object.values(PRODUCT_ROUTE_ALIASES), ...PERFUME_GUIDES.map(guide => getGuideCluster(guide).productId)];
    for (const id of references) assert.ok(ids.has(PRODUCT_ID_ALIASES[id] ?? id), `Missing mapped catalogue product: ${id}`);
    const base = process.argv.find(arg => arg.startsWith('--base-url='))?.slice('--base-url='.length);
    if (base) {
      for (const path of ['/inspired-by/armani-stronger-with-you-intensely', '/alternatives-to/armani-stronger-with-you-intensely', '/inspired-by/lattafa-khamrah-qahwa', '/inspired-by/dior-sauvage']) {
        const response: Response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(60000) });
        const html = await response.text();
        assert.equal(response.status, 200, path);
        assert.ok(!/<title>Not Found/i.test(html), `Missing-page metadata: ${path}`);
        if (path.includes('stronger-with-you')) assert.match(html, /Strong with you/i, `Current product missing: ${path}`);
        console.log(`Page verified: ${path}`);
      }
    }
    console.log(`Verified ${seo.inspirations.length} inspiration mappings, ${seo.alternatives.length} recommendation lists, ${PERFUME_GUIDES.length} fragrance guides and ${Object.keys(PRODUCT_ROUTE_ALIASES).length} historical product routes.`);
  } finally { await client.end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
