import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/admin-auth';
import { queryCustomerRecords } from '@/lib/admin-customer-query';
import { collectExcludedSessionIds, filterExcludedAdminRows } from '@/lib/admin-data-filters';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request); if (unauthorized) return unauthorized;
  const query = (request.nextUrl.searchParams.get('q') || '').trim();
  const identity = request.nextUrl.searchParams.get('identity') || '';
  const page = Number(request.nextUrl.searchParams.get('page') || 0);
  if (query.length > 120 || (!identity && query.length < 2) || (identity && !/^(phone:[6-9]\d{9}|email:[^\s@]+@[^\s@]+)$/.test(identity)) || !Number.isInteger(page) || page < 0 || page > 1000) return NextResponse.json({ error: 'Enter at least two characters or a valid customer identity.' }, { status: 400 });
  try {
    const rows = await queryCustomerRecords({ query, identity, offset: page * 40, limit: 41 });
    const visible = rows.slice(0, 40);
    return NextResponse.json({ rows: filterExcludedAdminRows(visible, collectExcludedSessionIds(visible)), hasMore: rows.length > 40 }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Customer search could not load. Please retry.' }, { status: 500 });
  }
}
