import { format, formatDistanceToNow } from "date-fns";
import { desc, gte } from "drizzle-orm";
import { AdminDateWindowControl } from "@/components/admin/AdminDateWindowControl";
import { db } from "@/db";
import {
  checkoutDrafts,
  customerAccountSessions,
  orders,
  type CheckoutDraft,
  type CustomerAccountSession,
  type Order,
} from "@/db/schema";
import { ensureAccountLoginSchema } from "@/lib/account-login";
import {
  collectExcludedSessionIds,
  filterExcludedAdminRows,
  isExcludedAdminDataRow,
} from "@/lib/admin-data-filters";
import { displayPhoneNumber, toTenDigitPhone } from "@/lib/phone";
import { parseAdminTimeWindow } from "@/lib/admin-time-window";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<{ hours?: string }> | { hours?: string };
};

type CustomerSource = Order | CheckoutDraft;

type LoginStatusRow = {
  key: string;
  name: string;
  phone: string | null;
  email: string | null;
  ordersCount: number;
  checkoutLeadCount: number;
  firstSeenAt: Date;
  lastSeenAt: Date;
  loginStatus: "active" | "expired" | "never";
  loginCount: number;
  lastLoginAt: Date | null;
  firstLoginAt: Date | null;
  latestSession: CustomerAccountSession | null;
};

function normalizeEmail(value: string | null | undefined): string | null {
  const email = String(value ?? "").trim().toLowerCase();
  return email.includes("@") ? email : null;
}

function normalizePhone(value: string | null | undefined): string | null {
  const phone = toTenDigitPhone(value);
  return phone || null;
}

function getIdentityKeys(row: CustomerSource): string[] {
  const keys: string[] = [];
  const phone = normalizePhone(row.phone);
  const email = normalizeEmail(row.email);
  if (phone) keys.push(`phone:${phone}`);
  if (email) keys.push(`email:${email}`);
  if (!keys.length && row.sessionId) keys.push(`session:${row.sessionId}`);
  return keys;
}

function getPrimaryKey(row: CustomerSource): string | null {
  return getIdentityKeys(row)[0] ?? null;
}

function isCheckoutLead(draft: CheckoutDraft): boolean {
  const hasContact = Boolean(draft.phone || draft.email);
  const hasDeliveryDetails = Boolean(
    draft.fullName ||
      draft.addressLine1 ||
      draft.city ||
      draft.state ||
      draft.pincode,
  );
  const hasCart = Boolean(draft.cartSnapshot?.length);

  return (
    hasContact &&
    (hasDeliveryDetails ||
      hasCart ||
      draft.status === "complete" ||
      draft.status === "whatsapp_initiated")
  );
}

function mergeCustomerKey(
  aliasMap: Map<string, string>,
  row: CustomerSource,
): string | null {
  const identityKeys = getIdentityKeys(row);
  if (!identityKeys.length) return null;

  const existingKey = identityKeys.map((key) => aliasMap.get(key)).find(Boolean);
  const primaryKey = existingKey || getPrimaryKey(row);
  if (!primaryKey) return null;

  identityKeys.forEach((key) => aliasMap.set(key, primaryKey));
  return primaryKey;
}

function getDisplayName(existingName: string, row: CustomerSource) {
  return row.fullName || existingName || "Unknown customer";
}

function formatDateTime(value: Date | null | undefined) {
  if (!value) return "Never";
  return format(value, "dd MMM yyyy, h:mm a");
}

function formatSince(value: Date | null | undefined) {
  if (!value) return "No login yet";
  return formatDistanceToNow(value, { addSuffix: true });
}

function sessionPhone(session: CustomerAccountSession): string | null {
  return normalizePhone(
    session.phone ||
      (session.identityType === "phone" ? session.identifier : null),
  );
}

function sessionEmail(session: CustomerAccountSession): string | null {
  return normalizeEmail(
    session.email ||
      (session.identityType === "email" ? session.identifier : null),
  );
}

function statusBadgeClassName(status: LoginStatusRow["loginStatus"]) {
  switch (status) {
    case "active":
      return "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300";
    case "expired":
      return "border-amber-500/20 bg-amber-500/[0.08] text-amber-200";
    default:
      return "border-white/10 bg-white/[0.04] text-white/55";
  }
}

function statusLabel(status: LoginStatusRow["loginStatus"]) {
  switch (status) {
    case "active":
      return "Active login";
    case "expired":
      return "Logged in before";
    default:
      return "Never logged in";
  }
}

function sortRows(rows: LoginStatusRow[]) {
  const statusOrder: Record<LoginStatusRow["loginStatus"], number> = {
    active: 0,
    expired: 1,
    never: 2,
  };

  return rows.sort((a, b) => {
    const statusDiff = statusOrder[a.loginStatus] - statusOrder[b.loginStatus];
    if (statusDiff !== 0) return statusDiff;

    const aLastLogin = a.lastLoginAt?.getTime() ?? 0;
    const bLastLogin = b.lastLoginAt?.getTime() ?? 0;
    if (aLastLogin !== bLastLogin) return bLastLogin - aLastLogin;

    return b.lastSeenAt.getTime() - a.lastSeenAt.getTime();
  });
}

export default async function LoginActivityPage({
  searchParams,
}: AdminPageProps) {
  const params = await searchParams;
  const timeWindow = parseAdminTimeWindow(params?.hours);

  let rows: LoginStatusRow[] = [];
  let recentSessions: CustomerAccountSession[] = [];
  let dbError = false;

  try {
    await ensureAccountLoginSchema();

    const [orderRows, draftRows, sessionRows] = await Promise.all([
      db
        .select()
        .from(orders)
        .where(gte(orders.createdAt, timeWindow.since))
        .orderBy(desc(orders.createdAt))
        .limit(1200),
      db
        .select()
        .from(checkoutDrafts)
        .where(gte(checkoutDrafts.updatedAt, timeWindow.since))
        .orderBy(desc(checkoutDrafts.updatedAt))
        .limit(1200),
      db
        .select()
        .from(customerAccountSessions)
        .orderBy(desc(customerAccountSessions.lastUsedAt))
        .limit(5000),
    ]);

    const excludedSessionIds = collectExcludedSessionIds(orderRows, draftRows);
    const filteredOrders = filterExcludedAdminRows(
      orderRows,
      excludedSessionIds,
    ).filter((order) => order.status !== "cancelled");
    const filteredDrafts = filterExcludedAdminRows(
      draftRows,
      excludedSessionIds,
    ).filter(isCheckoutLead);
    const filteredSessions = sessionRows.filter(
      (session) => !isExcludedAdminDataRow(session),
    );

    recentSessions = filteredSessions.filter(
      (session) => session.lastUsedAt >= timeWindow.since,
    );

    const customerMap = new Map<string, Omit<LoginStatusRow, "loginStatus" | "loginCount" | "lastLoginAt" | "firstLoginAt" | "latestSession">>();
    const aliasMap = new Map<string, string>();

    for (const order of filteredOrders) {
      const key = mergeCustomerKey(aliasMap, order);
      if (!key) continue;

      const existing = customerMap.get(key);
      if (existing) {
        existing.ordersCount += 1;
        existing.name = getDisplayName(existing.name, order);
        existing.phone = order.phone || existing.phone;
        existing.email = order.email || existing.email;
        if (order.createdAt < existing.firstSeenAt) existing.firstSeenAt = order.createdAt;
        if (order.createdAt > existing.lastSeenAt) existing.lastSeenAt = order.createdAt;
        continue;
      }

      customerMap.set(key, {
        key,
        name: order.fullName || "Unknown customer",
        phone: order.phone || null,
        email: order.email || null,
        ordersCount: 1,
        checkoutLeadCount: 0,
        firstSeenAt: order.createdAt,
        lastSeenAt: order.createdAt,
      });
    }

    for (const draft of filteredDrafts) {
      const key = mergeCustomerKey(aliasMap, draft);
      if (!key) continue;

      const existing = customerMap.get(key);
      if (existing) {
        existing.checkoutLeadCount += 1;
        existing.name = getDisplayName(existing.name, draft);
        existing.phone = draft.phone || existing.phone;
        existing.email = draft.email || existing.email;
        if (draft.createdAt < existing.firstSeenAt) existing.firstSeenAt = draft.createdAt;
        if (draft.updatedAt > existing.lastSeenAt) existing.lastSeenAt = draft.updatedAt;
        continue;
      }

      customerMap.set(key, {
        key,
        name: draft.fullName || "Unknown checkout lead",
        phone: draft.phone || null,
        email: draft.email || null,
        ordersCount: 0,
        checkoutLeadCount: 1,
        firstSeenAt: draft.createdAt,
        lastSeenAt: draft.updatedAt,
      });
    }

    const sessionsByPhone = new Map<string, CustomerAccountSession[]>();
    const sessionsByEmail = new Map<string, CustomerAccountSession[]>();

    for (const session of filteredSessions) {
      const phone = sessionPhone(session);
      const email = sessionEmail(session);
      if (phone) {
        const list = sessionsByPhone.get(phone) ?? [];
        list.push(session);
        sessionsByPhone.set(phone, list);
      }
      if (email) {
        const list = sessionsByEmail.get(email) ?? [];
        list.push(session);
        sessionsByEmail.set(email, list);
      }
    }

    rows = sortRows(
      Array.from(customerMap.values()).map((customer) => {
        const matchedSessions = [
          ...(normalizePhone(customer.phone)
            ? sessionsByPhone.get(normalizePhone(customer.phone)!) ?? []
            : []),
          ...(normalizeEmail(customer.email)
            ? sessionsByEmail.get(normalizeEmail(customer.email)!) ?? []
            : []),
        ].filter(
          (session, index, all) =>
            all.findIndex((candidate) => candidate.id === session.id) === index,
        );

        matchedSessions.sort(
          (a, b) => b.lastUsedAt.getTime() - a.lastUsedAt.getTime(),
        );

        const latestSession = matchedSessions[0] ?? null;
        const activeSessions = matchedSessions.filter(
          (session) => session.expiresAt > new Date(),
        );
        const firstLoginAt =
          matchedSessions.length > 0
            ? matchedSessions.reduce(
                (earliest, session) =>
                  session.createdAt < earliest ? session.createdAt : earliest,
                matchedSessions[0].createdAt,
              )
            : null;

        return {
          ...customer,
          loginStatus: activeSessions.length
            ? "active"
            : latestSession
              ? "expired"
              : "never",
          loginCount: matchedSessions.length,
          lastLoginAt: latestSession?.lastUsedAt ?? null,
          firstLoginAt,
          latestSession,
        };
      }),
    );
  } catch (error) {
    console.error("Login activity page DB error:", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Login Activity</h1>
        </div>
        <div className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/[0.04] p-12 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <h3 className="text-lg font-medium text-amber-300">
              Database Sync Required
            </h3>
            <p className="text-sm text-white/50">
              The account login tables are missing or out of sync. Run{" "}
              <code className="rounded bg-white/10 px-2 py-1 text-xs">
                npm run db:push
              </code>{" "}
              in your terminal, then refresh this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const loggedInCount = rows.filter((row) => row.loginStatus !== "never").length;
  const activeCount = rows.filter((row) => row.loginStatus === "active").length;
  const neverLoggedInCount = rows.filter(
    (row) => row.loginStatus === "never",
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-white">Login Activity</h1>
          <p className="mt-1 text-sm text-white/45">
            See which customers have active account logins, who has logged in
            before, and who has never logged in.
          </p>
          <p className="mt-1 text-xs text-white/35">
            Showing customer and session activity from{" "}
            {timeWindow.label.toLowerCase()}.
          </p>
        </div>
        <AdminDateWindowControl />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-medium text-white/45">Known Customers</p>
          <p className="mt-3 text-2xl font-semibold text-white">{rows.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5">
          <p className="text-xs font-medium text-emerald-200/45">
            Active Logins
          </p>
          <p className="mt-3 text-2xl font-semibold text-emerald-300">
            {activeCount}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-medium text-white/45">Logged In Before</p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {loggedInCount}
          </p>
        </div>
        <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-5">
          <p className="text-xs font-medium text-amber-200/45">
            Never Logged In
          </p>
          <p className="mt-3 text-2xl font-semibold text-amber-200">
            {neverLoggedInCount}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-base font-semibold text-white">
            Customer Login Status
          </h2>
          <p className="mt-1 text-sm text-white/40">
            This compares known customers against successful account login
            sessions.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.18em] text-white/35">
              <tr>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Last Login</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Sessions</th>
                <th className="px-5 py-3 font-medium">Orders / Leads</th>
                <th className="px-5 py-3 font-medium">Seen</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-white/40"
                  >
                    No customers found in this time window yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.key}
                    className="border-t border-white/6 align-top text-white/75"
                  >
                    <td className="px-5 py-4">
                      <div className="min-w-[220px]">
                        <p className="font-medium text-white">
                          {row.name || "Unknown customer"}
                        </p>
                        <div className="mt-1 space-y-0.5 text-xs text-white/45">
                          <p>{displayPhoneNumber(row.phone) || "No phone"}</p>
                          <p>{row.email || "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadgeClassName(
                          row.loginStatus,
                        )}`}
                      >
                        {statusLabel(row.loginStatus)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="min-w-[180px]">
                        <p className="text-white">
                          {formatDateTime(row.lastLoginAt)}
                        </p>
                        <p className="mt-1 text-xs text-white/40">
                          {formatSince(row.lastLoginAt)}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="min-w-[120px]">
                        <p className="capitalize text-white/75">
                          {row.latestSession?.identityType || "none"}
                        </p>
                        <p className="mt-1 text-xs text-white/40">
                          First login: {formatDateTime(row.firstLoginAt)}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="min-w-[90px]">
                        <p className="font-medium text-white">
                          {row.loginCount}
                        </p>
                        <p className="mt-1 text-xs text-white/40">
                          successful
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="min-w-[110px] text-xs text-white/55">
                        <p>Orders: {row.ordersCount}</p>
                        <p className="mt-1">Leads: {row.checkoutLeadCount}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="min-w-[170px] text-xs text-white/50">
                        <p>First seen: {formatDateTime(row.firstSeenAt)}</p>
                        <p className="mt-1">
                          Last seen: {formatDateTime(row.lastSeenAt)}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-base font-semibold text-white">
            Recent Successful Login Sessions
          </h2>
          <p className="mt-1 text-sm text-white/40">
            Raw account session records created by successful OTP logins.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.18em] text-white/35">
              <tr>
                <th className="px-5 py-3 font-medium">Identity</th>
                <th className="px-5 py-3 font-medium">Customer Contact</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 font-medium">Last Used</th>
                <th className="px-5 py-3 font-medium">Expires</th>
                <th className="px-5 py-3 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-white/40"
                  >
                    No successful login sessions recorded in this time window.
                  </td>
                </tr>
              ) : (
                recentSessions.slice(0, 250).map((session) => (
                  <tr
                    key={session.id}
                    className="border-t border-white/6 align-top text-white/75"
                  >
                    <td className="px-5 py-4">
                      <div className="min-w-[180px]">
                        <p className="capitalize text-white">
                          {session.identityType}
                        </p>
                        <p className="mt-1 text-xs text-white/45 break-all">
                          {session.identifier}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="min-w-[190px] text-xs text-white/55">
                        <p>{displayPhoneNumber(session.phone) || "No phone"}</p>
                        <p className="mt-1 break-all">
                          {session.email || "No email"}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-white/55">
                      {formatDateTime(session.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-xs text-white/55">
                      {formatDateTime(session.lastUsedAt)}
                    </td>
                    <td className="px-5 py-4 text-xs text-white/55">
                      {formatDateTime(session.expiresAt)}
                    </td>
                    <td className="px-5 py-4 text-xs text-white/45">
                      {session.ipAddress || "Not captured"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
