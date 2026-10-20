import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRepeatOrder, customerIdentity, eligibleCustomerPhone, latestCustomerContact, recordsCsv, type CustomerSearchRow, type RepeatOrderSource } from '../lib/admin-customer-records';
import type { Product } from '../db/schema';

const contact = { fullName: 'Customer', phone: '9876543210', email: null, addressLine1: 'Test address', addressLine2: null, city: 'Kanpur', state: 'Uttar Pradesh', pincode: '208012' };
const product = (id: string, extra: Partial<Product> = {}) => ({ id, name: id, price: '799', priceCurrency: 'INR', badges: {}, visibility: 'public', ...extra }) as Product;
test('customer matching normalizes Indian mobile formats and does not merge different mobiles through email', () => {
  for (const phone of ['9876543210', '+91 98765 43210', '09876543210', '0091 9876543210']) assert.equal(eligibleCustomerPhone(phone), '9876543210');
  for (const phone of [null, '123', '+44 9876543210', 'abc9876543210', '1234567890']) assert.equal(eligibleCustomerPhone(phone), null);
  assert.equal(customerIdentity({ phone: '+91 98765 43210', email: 'shared@example.com' }), 'phone:9876543210');
  assert.notEqual(customerIdentity({ phone: '9876543210', email: 'shared@example.com' }), customerIdentity({ phone: '8765432109', email: 'shared@example.com' }));
  assert.equal(customerIdentity({ phone: null, email: ' TEST@Example.COM ' }), 'email:test@example.com');
});
test('CSV preserves quotes, Unicode and newlines and neutralizes spreadsheet formulas', () => {
  const csv = recordsCsv(['Name', 'Mobile', 'Address'], [['HUME, "भारत"', '9876543210', 'Line 1\nLine 2'], ['=HYPERLINK("bad")', '+919876543210', '\t=1+1']]);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('"HUME, ""भारत"""'));
  assert.ok(csv.includes('"\'=HYPERLINK(""bad"")"'));
  assert.ok(csv.includes('"\'+919876543210"'));
  assert.ok(csv.includes('"\'\t=1+1"'));
});
test('contact autofill uses the latest nonempty name and keeps each saved address together', () => {
  const older = { ...contact, id: 'old', source: 'order', updatedAt: '2026-10-01', createdAt: '2026-10-01', cartSnapshot: [], orderNumber: 'old', trackingNumber: null, grandTotal: '799', status: 'processing' } as CustomerSearchRow;
  const latest = { ...older, id: 'new', fullName: null, addressLine1: null, city: 'Mumbai', pincode: '400001', updatedAt: '2026-10-20' };
  const result = latestCustomerContact([older, latest]);
  assert.equal(result?.fullName, 'Customer');
  assert.equal(result?.city, 'Kanpur');
  assert.equal(result?.pincode, '208012');
});
test('repeat orders copy eligible items at current prices, flag changes and exclude gifts and unavailable items', () => {
  const source: RepeatOrderSource = { ...contact, cartSnapshot: [{ id: 'old', name: 'Old name', price: 599, quantity: 2 }, { id: 'sold', name: 'Sold', price: 799, quantity: 1 }, { id: 'gift', name: 'Gift', price: 0, quantity: 1, isGift: true }, { id: 'missing', name: 'Removed', price: 10, quantity: 1 }] };
  const before = JSON.stringify(source);
  const repeat = buildRepeatOrder(source, [product('old', { name: 'New name' }), product('sold', { badges: { soldOut: true } })]);
  assert.deepEqual(repeat.items, [{ id: 'old', quantity: 2 }]);
  assert.ok(repeat.notices.some(notice => notice.includes('599 to ₹799')));
  assert.ok(repeat.notices.some(notice => notice.includes('now New name')));
  assert.equal(JSON.stringify(source), before);
  assert.equal('paymentMethod' in repeat, false);
});
test('repeat discovery orders preserve 15 choices and reject unavailable or incomplete selections', () => {
  const samples = Array.from({ length: 15 }, (_, index) => product(`sample-${index}`));
  const source: RepeatOrderSource = { ...contact, cartSnapshot: [{ id: 'discovery-set-old', name: 'Discovery set', price: 999, quantity: 1, sampleSelections: samples.map(sample => ({ id: sample.id, name: sample.name })) }] };
  const catalogue = [product('hume-discovery-set', { price: '999' }), ...samples];
  assert.deepEqual(buildRepeatOrder(source, catalogue).items[0].sampleSelections, samples.map(sample => sample.id));
  assert.equal(buildRepeatOrder(source, catalogue.filter(item => item.id !== 'sample-0')).items.length, 0);
  assert.equal(buildRepeatOrder({ ...source, cartSnapshot: [{ ...source.cartSnapshot[0], sampleSelections: [] }] }, catalogue).items.length, 0);
});
