// Real SQL and API verification; all fixtures are rolled back. No payment requests or messages.
// node --require ./scripts/server-only-test-register.cjs --import tsx scripts/verify-admin-customer-workspace.ts
import { config } from 'dotenv';
import assert from 'node:assert/strict';
import { randomInt, randomUUID } from 'node:crypto';
config({ path: '.env.local', quiet: true }); config({ path: '.env', quiet: true });
async function main() {
  const { db } = await import('../db');
  const { orders, checkoutDrafts, products } = await import('../db/schema');
  const { createManualOrder } = await import('../lib/manual-order-payment');
  const { GET: search } = await import('../app/api/admin/customers/search/route');
  const { GET: download } = await import('../app/api/admin/customers/export/route');
  const { queryCustomerRecords } = await import('../lib/admin-customer-query');
  const { NextRequest } = await import('next/server');
  const marker = `crm-${randomUUID()}`;
  const phone = `9${randomInt(100000000, 999999999)}`;
  const leadPhone = `8${randomInt(100000000, 999999999)}`;
  const rollback = new Error('fixture rollback');
  const request = (path: string, authorized = true) => new NextRequest(`http://localhost:3002${path}`, { headers: authorized ? { 'x-admin-token': process.env.ADMIN_API_TOKEN || '' } : {} });
  if (process.env.ADMIN_API_TOKEN) assert.equal((await search(request('/api/admin/customers/search?q=fixture', false))).status, 401);
  try {
    await db.transaction(async tx => {
      const original = db.select;
      const originalTransaction = db.transaction;
      db.select = tx.select.bind(tx) as typeof db.select;
      db.transaction = (async callback => callback(tx)) as typeof db.transaction;
      try {
        await tx.insert(orders).values({ id: `${marker}-order`, orderNumber: marker, sessionId: marker, fullName: marker, phone: `+91 ${phone}`, trackingNumber: `${marker}-track`, status: 'payment_pending', grandTotal: '799', cartSnapshot: [{ id: 'fixture-product', name: '=unsafe-formula', price: 799, quantity: 1 }] });
        await tx.insert(checkoutDrafts).values([{ id: `${marker}-lead`, sessionId: `${marker}-lead`, fullName: `${marker}-incomplete`, phone: leadPhone }, { id: `${marker}-invalid`, sessionId: `${marker}-invalid`, fullName: `${marker}-invalid`, phone: '123' }]);
        await queryCustomerRecords({ query: marker });
        for (const query of [marker, `${marker}-track`, `+91 ${phone}`]) {
          const response = await search(request(`/api/admin/customers/search?q=${encodeURIComponent(query)}`));
          assert.equal(response.status, 200, await response.clone().text());
          const data = await response.json(); assert.ok(data.rows.some((row: { id: string }) => row.id === `${marker}-order`));
          assert.ok(data.rows.every((row: Record<string, unknown>) => !('whatsappMessage' in row) && !('razorpayOrderId' in row)));
        }
        const history = await search(request(`/api/admin/customers/search?identity=phone:${phone}`));
        assert.equal(history.status, 200, await history.clone().text());
        const exportResponse = await download(request(`/api/admin/customers/export?type=customers&q=${marker}`));
        assert.equal(exportResponse.status, 200, await exportResponse.clone().text());
        const csv = await exportResponse.text(); assert.ok(csv.includes(`${marker}-incomplete`)); assert.ok(!csv.includes(`${marker}-invalid`));
        const incomplete = await download(request(`/api/admin/customers/export?type=incomplete&q=${marker}`));
        const leads = await incomplete.text(); assert.ok(leads.includes(`${marker}-incomplete`)); assert.ok(!leads.includes(`"${marker}"`));
        const exportOrders = await download(request(`/api/admin/customers/export?type=orders&q=${marker}`));
        assert.equal(exportOrders.status, 200); const orderCsv = await exportOrders.text(); assert.ok(orderCsv.includes("'=unsafe-formula"));
        assert.equal((await search(request('/api/admin/customers/search?q=x'))).status, 400);
        const catalogue = await tx.select().from(products);
        const product = catalogue.find(item => item.priceCurrency === 'INR' && !item.badges?.soldOut && !item.badges?.comingSoon && item.id !== 'hume-discovery-set' && Number(item.price) >= 1);
        assert.ok(product, 'An available INR product is needed for repeat-order verification');
        const payload = { requestId: randomUUID(), repeatOf: `${marker}-order`, fullName: marker, phone, addressLine1: 'Verification address only', city: 'Kanpur', state: 'Uttar Pradesh', pincode: '208012', items: [{ id: product.id, quantity: 1 }], paymentMode: 'full' };
        const repeat = await createManualOrder(payload);
        assert.notEqual(repeat.id, `${marker}-order`);
        assert.equal(repeat.grandTotal, Number(product.price).toFixed(2));
        assert.equal(repeat.status, 'payment_pending');
        assert.equal(repeat.capturedPaymentAmount, null);
        assert.equal(repeat.externalPaymentReceipt, null);
        assert.equal(repeat.trackingNumber, null);
        assert.equal((await createManualOrder(payload)).id, repeat.id, 'Retries must recover the same new order');
        console.log('Customer search, normalized history, mobile-only exports, safe CSV, validation and authentication passed.');
        console.log('Repeat-order creation uses current prices, resets payment/tracking and remains idempotent.');
      } finally { db.select = original; db.transaction = originalTransaction; }
      throw rollback;
    });
  } catch (error) { if (error !== rollback) throw error; }
  console.log('All verification fixtures rolled back.');
  process.exit(0);
}
main().catch(error => { console.error('Customer workspace verification failed:', error instanceof Error && error.cause instanceof Error ? error.cause.message : error instanceof Error ? error.message : 'Unknown error'); process.exit(1); });
