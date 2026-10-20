import 'server-only';
import { db } from '@/db';
import { orders, checkoutDrafts } from '@/db/schema';
import { and, desc, ilike, lte, or, sql } from 'drizzle-orm';
import { unionAll } from 'drizzle-orm/pg-core';
import type { CustomerSearchRow } from './admin-customer-records';
import { eligibleCustomerPhone } from './admin-customer-records';

export async function queryCustomerRecords({ query = '', identity = '', offset = 0, limit = 41, until = new Date() }: { query?: string; identity?: string; offset?: number; limit?: number; until?: Date }) {
  const pattern = `%${query.replace(/[\\%_]/g, '\\$&')}%`;
  const phone = eligibleCustomerPhone(query);
  function condition(table: typeof orders | typeof checkoutDrafts) {
    const digits = sql`regexp_replace(coalesce(${table.phone}, ''), '[^0-9]', '', 'g')`;
    const normalized = sql`case when coalesce(${table.phone}, '') ~ '^[+0-9[:space:]().-]+$' and ${digits} ~ '^(91|0091|0)?[6-9][0-9]{9}$' then right(${digits}, 10) else null end`;
    if (identity.startsWith('phone:')) return and(lte(table.updatedAt, until), sql`${normalized} = ${identity.slice(6)}`);
    // Email-only records never silently merge into a different phone identity.
    if (identity.startsWith('email:')) return and(lte(table.updatedAt, until), sql`${normalized} is null`, sql`lower(trim(${table.email})) = ${identity.slice(6)}`);
    if (!query) return lte(table.updatedAt, until);
    return and(lte(table.updatedAt, until), or(ilike(table.fullName, pattern), ilike(table.email, pattern), phone ? sql`${normalized} = ${phone}` : ilike(digits, `%${query.replace(/\D/g, '') || 'no-phone-match'}%`), ...(table === orders ? [ilike(orders.orderNumber, pattern), ilike(orders.trackingNumber, pattern)] : [])));
  }
  const orderRows = db.select({ id: orders.id, sessionId: orders.sessionId, source: sql<'order' | 'checkout'>`'order'`.as('source'), fullName: orders.fullName, phone: orders.phone, email: orders.email, addressLine1: orders.addressLine1, addressLine2: orders.addressLine2, city: orders.city, state: orders.state, pincode: orders.pincode, cartSnapshot: orders.cartSnapshot, orderNumber: sql<string | null>`${orders.orderNumber}`.as('order_number'), trackingNumber: orders.trackingNumber, status: orders.status, grandTotal: orders.grandTotal, createdAt: orders.createdAt, updatedAt: orders.updatedAt }).from(orders).where(condition(orders));
  const draftRows = db.select({ id: checkoutDrafts.id, sessionId: checkoutDrafts.sessionId, source: sql<'order' | 'checkout'>`'checkout'`.as('source'), fullName: checkoutDrafts.fullName, phone: checkoutDrafts.phone, email: checkoutDrafts.email, addressLine1: checkoutDrafts.addressLine1, addressLine2: checkoutDrafts.addressLine2, city: checkoutDrafts.city, state: checkoutDrafts.state, pincode: checkoutDrafts.pincode, cartSnapshot: checkoutDrafts.cartSnapshot, orderNumber: sql<string | null>`null`, trackingNumber: sql<string | null>`null`, status: checkoutDrafts.status, grandTotal: checkoutDrafts.grandTotal, createdAt: checkoutDrafts.createdAt, updatedAt: checkoutDrafts.updatedAt }).from(checkoutDrafts).where(condition(checkoutDrafts));
  const rows = await unionAll(orderRows, draftRows).orderBy(desc(sql`updated_at`), sql`source`, sql`id`).offset(offset).limit(limit);
  return rows as CustomerSearchRow[];
}
