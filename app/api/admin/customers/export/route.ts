import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/admin-auth';
import { queryCustomerRecords } from '@/lib/admin-customer-query';
import { eligibleCustomerPhone, recordsCsv, type CustomerSearchRow } from '@/lib/admin-customer-records';
import { collectExcludedSessionIds, filterExcludedAdminRows } from '@/lib/admin-data-filters';

export const maxDuration = 60;
export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request); if (unauthorized) return unauthorized;
  const type = request.nextUrl.searchParams.get('type') || 'customers';
  const query = (request.nextUrl.searchParams.get('q') || '').trim();
  if (!['customers', 'incomplete', 'orders'].includes(type) || query.length > 120) return NextResponse.json({ error: 'Invalid export selection.' }, { status: 400 });
  try {
    const all: CustomerSearchRow[] = [];
    const until = new Date();
    // Read bounded pages; fail explicitly rather than silently delivering a truncated export.
    for (let offset = 0; ; offset += 1000) {
      const rows = await queryCustomerRecords({ query: type === 'orders' ? query : '', offset, limit: 1000, until });
      all.push(...rows);
      if (all.length > 25000) return NextResponse.json({ error: 'This export exceeds 25,000 records. Contact support for a full database export.' }, { status: 413 });
      if (rows.length < 1000) break;
    }
    const rows = filterExcludedAdminRows(all, collectExcludedSessionIds(all));
    let matchedPhones: Set<string> | null = null;
    if (query && type !== 'orders') {
      matchedPhones = new Set<string>();
      for (let offset = 0; ; offset += 1000) {
        const matches = await queryCustomerRecords({ query, offset, limit: 1000, until });
        for (const row of matches) { const phone = eligibleCustomerPhone(row.phone); if (phone) matchedPhones.add(phone); }
        if (matches.length < 1000) break;
      }
    }
    let csv: string;
    const headers = ['Mobile', 'Customer name', 'Email', 'Address', 'City', 'State', 'Pincode'];
    const contact = (row: CustomerSearchRow) => [eligibleCustomerPhone(row.phone) || row.phone, row.fullName, row.email, [row.addressLine1, row.addressLine2].filter(Boolean).join(', '), row.city, row.state, row.pincode];
    if (type === 'orders') {
      csv = recordsCsv(['Order number', 'Created at (UTC)', ...headers, 'Status', 'Total INR', 'Items', 'Tracking number'], rows.filter(row => row.source === 'order').map(row => [row.orderNumber, new Date(row.createdAt).toISOString(), ...contact(row), row.status, row.grandTotal, row.cartSnapshot?.map(item => `${item.name} × ${item.quantity}${item.sampleSelections?.length ? ` [${item.sampleSelections.map(sample => sample.name).sort().join('; ')}]` : ''}`).join('; '), row.trackingNumber]));
    } else {
      const customers = new Map<string, { row: CustomerSearchRow; orders: number; orderValue: number; checkouts: number; firstSeen: string; lastSeen: string }>();
      for (const row of rows) {
        const phone = eligibleCustomerPhone(row.phone);
        if (!phone) continue;
        let customer = customers.get(phone);
        if (!customer) { customer = { row: { ...row, phone }, orders: 0, orderValue: 0, checkouts: 0, firstSeen: new Date(row.createdAt).toISOString(), lastSeen: new Date(row.updatedAt).toISOString() }; customers.set(phone, customer); }
        // Newest nonempty contact details win; names alone never merge identities.
        for (const field of ['fullName', 'email'] as const) if (!customer.row[field] && row[field]) customer.row[field] = row[field];
        if (!customer.row.addressLine1 && row.addressLine1) for (const field of ['addressLine1', 'addressLine2', 'city', 'state', 'pincode'] as const) customer.row[field] = row[field];
        if (row.source === 'order') { customer.orders++; customer.orderValue += Number(row.grandTotal || 0); }
        else customer.checkouts++;
        const created = new Date(row.createdAt).toISOString();
        if (created < customer.firstSeen) customer.firstSeen = created;
      }
      const matching = [...customers.values()].filter(customer => (type !== 'incomplete' || customer.orders === 0) && (!matchedPhones || matchedPhones.has(customer.row.phone || '')));
      csv = recordsCsv([...headers, 'Orders', 'Order value INR (includes unpaid)', 'Saved checkouts', 'Customer type', 'First seen (UTC)', 'Last seen (UTC)'], matching.map(customer => [...contact(customer.row), customer.orders, customer.orderValue.toFixed(2), customer.checkouts, customer.orders ? 'Customer' : 'Incomplete checkout lead', customer.firstSeen, customer.lastSeen]));
    }
    return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="HUME-${type}-${new Date().toISOString().slice(0, 10)}.csv"`, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch {
    return NextResponse.json({ error: 'Export failed. Please retry; no partial file was downloaded.' }, { status: 500 });
  }
}
