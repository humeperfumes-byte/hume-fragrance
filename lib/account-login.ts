import { createHash, randomBytes, randomInt } from "crypto";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  accountLoginOtps,
  checkoutDrafts,
  customerAccountSessions,
  orders,
} from "@/db/schema";

const OTP_TTL_MINUTES = 10;
const SESSION_TTL_DAYS = 180;
let accountLoginSchemaReady: Promise<void> | null = null;

export type AccountIdentity = {
  type: "email" | "phone";
  value: string;
};

export type AccountProfile = {
  sessionId: string;
  fullName: string;
  phone: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  notes?: string;
};

function accountSecret() {
  return (
    process.env.ACCOUNT_OTP_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.RAZORPAY_WEBHOOK_SECRET ||
    "hume-account-login-dev-secret"
  );
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function parseAccountIdentity(identifier: string): AccountIdentity | null {
  const clean = identifier.trim();
  if (!clean) return null;

  if (clean.includes("@")) {
    const email = normalizeEmail(clean);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? { type: "email", value: email }
      : null;
  }

  const phone = normalizePhone(clean);
  return phone.length === 10 ? { type: "phone", value: phone } : null;
}

export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return "saved email";
  const visible = name.length <= 2 ? name[0] : `${name.slice(0, 2)}...${name.slice(-1)}`;
  return `${visible}@${domain}`;
}

export function maskPhone(phone: string) {
  const digits = normalizePhone(phone);
  if (digits.length !== 10) return "saved mobile";
  return `${digits.slice(0, 2)}******${digits.slice(-2)}`;
}

export function generateOtp() {
  const easyCodes = [
    "9293",
    "5354",
    "9091",
    "5343",
    "7879",
    "3434",
    "4545",
    "6767",
    "1213",
    "5657",
  ];

  return easyCodes[randomInt(0, easyCodes.length)];
}

export function hashOtp(otp: string, requestId: string) {
  return createHash("sha256")
    .update(`${requestId}:${otp}:${accountSecret()}`)
    .digest("hex");
}

export function createAccountSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashAccountSessionToken(token: string) {
  return createHash("sha256")
    .update(`${token}:${accountSecret()}`)
    .digest("hex");
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export async function ensureAccountLoginSchema() {
  accountLoginSchemaReady ??= (async () => {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "account_login_otps" (
        "id" varchar(255) PRIMARY KEY NOT NULL,
        "identity_type" varchar(20) NOT NULL,
        "identifier" varchar(255) NOT NULL,
        "destination_email" varchar(255) NOT NULL,
        "otp_hash" varchar(255) NOT NULL,
        "attempts" integer DEFAULT 0 NOT NULL,
        "expires_at" timestamp NOT NULL,
        "consumed_at" timestamp,
        "ip_address" varchar(255),
        "user_agent" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "account_login_otps_identifier_idx"
      ON "account_login_otps" ("identity_type", "identifier", "created_at")
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "customer_account_sessions" (
        "id" varchar(255) PRIMARY KEY NOT NULL,
        "token_hash" varchar(255) NOT NULL UNIQUE,
        "identity_type" varchar(20) NOT NULL,
        "identifier" varchar(255) NOT NULL,
        "email" varchar(255),
        "phone" varchar(50),
        "expires_at" timestamp NOT NULL,
        "last_used_at" timestamp DEFAULT now() NOT NULL,
        "ip_address" varchar(255),
        "user_agent" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "customer_account_sessions_identifier_idx"
      ON "customer_account_sessions" ("identity_type", "identifier", "expires_at")
    `);
  })();

  return accountLoginSchemaReady;
}

function profileFromRow(row: {
  sessionId: string | null;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  notes: string | null;
}): AccountProfile | null {
  if (!row.sessionId || !row.fullName || !row.phone) return null;

  return {
    sessionId: row.sessionId,
    fullName: row.fullName,
    phone: row.phone,
    email: row.email || undefined,
    addressLine1: row.addressLine1 || undefined,
    addressLine2: row.addressLine2 || undefined,
    city: row.city || undefined,
    state: row.state || undefined,
    pincode: row.pincode || undefined,
    notes: row.notes || undefined,
  };
}

function orderIdentityWhere(identity: AccountIdentity) {
  if (identity.type === "email") {
    return sql`lower(trim(coalesce(${orders.email}, ''))) = ${identity.value}`;
  }

  return sql`right(regexp_replace(coalesce(${orders.phone}, ''), '[^0-9]', '', 'g'), 10) = ${identity.value}`;
}

function draftIdentityWhere(identity: AccountIdentity) {
  if (identity.type === "email") {
    return sql`lower(trim(coalesce(${checkoutDrafts.email}, ''))) = ${identity.value}`;
  }

  return sql`right(regexp_replace(coalesce(${checkoutDrafts.phone}, ''), '[^0-9]', '', 'g'), 10) = ${identity.value}`;
}

export function accountOrderWhere(identity: AccountIdentity) {
  return orderIdentityWhere(identity);
}

export function accountDraftWhere(identity: AccountIdentity) {
  return draftIdentityWhere(identity);
}

export async function findAccountProfileForIdentity(identity: AccountIdentity) {
  const [latestOrder] = await db
    .select({
      sessionId: orders.sessionId,
      fullName: orders.fullName,
      phone: orders.phone,
      email: orders.email,
      addressLine1: orders.addressLine1,
      addressLine2: orders.addressLine2,
      city: orders.city,
      state: orders.state,
      pincode: orders.pincode,
      notes: orders.notes,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(orderIdentityWhere(identity))
    .orderBy(desc(orders.createdAt))
    .limit(1);

  const orderProfile = latestOrder ? profileFromRow(latestOrder) : null;
  if (orderProfile) return orderProfile;

  const [latestDraft] = await db
    .select({
      sessionId: checkoutDrafts.sessionId,
      fullName: checkoutDrafts.fullName,
      phone: checkoutDrafts.phone,
      email: checkoutDrafts.email,
      addressLine1: checkoutDrafts.addressLine1,
      addressLine2: checkoutDrafts.addressLine2,
      city: checkoutDrafts.city,
      state: checkoutDrafts.state,
      pincode: checkoutDrafts.pincode,
      notes: checkoutDrafts.notes,
      updatedAt: checkoutDrafts.updatedAt,
    })
    .from(checkoutDrafts)
    .where(draftIdentityWhere(identity))
    .orderBy(desc(checkoutDrafts.updatedAt))
    .limit(1);

  return latestDraft ? profileFromRow(latestDraft) : null;
}

export async function createAccountSession(input: {
  identity: AccountIdentity;
  profile: AccountProfile;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  await ensureAccountLoginSchema();
  const token = createAccountSessionToken();
  const now = new Date();

  await db.insert(customerAccountSessions).values({
    id: randomBytes(16).toString("hex"),
    tokenHash: hashAccountSessionToken(token),
    identityType: input.identity.type,
    identifier: input.identity.value,
    email: input.profile.email || null,
    phone: input.profile.phone,
    expiresAt: addDays(now, SESSION_TTL_DAYS),
    lastUsedAt: now,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
  });

  return token;
}

export async function findAccountSession(token: string) {
  await ensureAccountLoginSchema();
  const tokenHash = hashAccountSessionToken(token);
  const [session] = await db
    .select()
    .from(customerAccountSessions)
    .where(and(eq(customerAccountSessions.tokenHash, tokenHash), gt(customerAccountSessions.expiresAt, new Date())))
    .limit(1);

  if (!session) return null;

  await db
    .update(customerAccountSessions)
    .set({ lastUsedAt: new Date() })
    .where(eq(customerAccountSessions.id, session.id));

  return {
    ...session,
    identity: {
      type: session.identityType === "email" ? "email" : "phone",
      value: session.identifier,
    } satisfies AccountIdentity,
  };
}

export async function findUsableOtp(requestId: string) {
  await ensureAccountLoginSchema();
  const [otpRequest] = await db
    .select()
    .from(accountLoginOtps)
    .where(
      and(
        eq(accountLoginOtps.id, requestId),
        isNull(accountLoginOtps.consumedAt),
        gt(accountLoginOtps.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return otpRequest || null;
}

export async function consumeOtp(requestId: string) {
  await ensureAccountLoginSchema();
  await db
    .update(accountLoginOtps)
    .set({ consumedAt: new Date() })
    .where(eq(accountLoginOtps.id, requestId));
}

export async function incrementOtpAttempts(requestId: string, attempts: number) {
  await ensureAccountLoginSchema();
  await db
    .update(accountLoginOtps)
    .set({ attempts: attempts + 1 })
    .where(eq(accountLoginOtps.id, requestId));
}

export async function hasRecentOtp(identity: AccountIdentity) {
  await ensureAccountLoginSchema();
  const [recent] = await db
    .select({ id: accountLoginOtps.id })
    .from(accountLoginOtps)
    .where(
      and(
        eq(accountLoginOtps.identityType, identity.type),
        eq(accountLoginOtps.identifier, identity.value),
        isNull(accountLoginOtps.consumedAt),
        gt(accountLoginOtps.createdAt, addMinutes(new Date(), -2)),
      ),
    )
    .orderBy(desc(accountLoginOtps.createdAt))
    .limit(1);

  return Boolean(recent);
}

export function identityFromSession(session: {
  identityType: string;
  identifier: string;
}): AccountIdentity {
  return {
    type: session.identityType === "email" ? "email" : "phone",
    value: session.identifier,
  };
}

export const accountOtpConfig = {
  otpTtlMinutes: OTP_TTL_MINUTES,
  sessionTtlDays: SESSION_TTL_DAYS,
};
