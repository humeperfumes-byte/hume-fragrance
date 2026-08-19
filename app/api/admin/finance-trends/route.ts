import { NextRequest, NextResponse } from "next/server";
import { and, asc, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { orders, type Order } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";
import { collectExcludedSessionIds, filterExcludedAdminRows } from "@/lib/admin-data-filters";
import { isIndiaCheckoutSignal, parseAdminMarket } from "@/lib/admin-market";

type FinanceGranularity = "daily" | "weekly" | "monthly";

type FinancePeriod = {
  key: string;
  label: string;
  start: Date;
  end: Date;
};

function money(value: unknown): number {
  const parsed = Number.parseFloat(String(value ?? "0") || "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

function isPartialCodOrder(order: Order): boolean {
  return Boolean(order.paymentMethod?.includes("Prepaid") && order.paymentMethod.includes("Cash on Delivery"));
}

function isRevenueQualifiedOrder(order: Order): boolean {
  if (["cancelled", "payment_pending", "payment_failed", "refunded", "partially_refunded"].includes(order.status)) return false;
  const hasFulfillmentProof = Boolean(
    order.trackingNumber || order.shippedAt || order.deliveredAt || ["shipped", "delivered"].includes(order.status),
  );
  const hasCapturedPayment = order.status === "processing" && Boolean(order.paymentMethod);
  return hasFulfillmentProof || hasCapturedPayment || order.status === "complete";
}

function recognizedRevenue(order: Order): number {
  const total = money(order.grandTotal);
  if (!isPartialCodOrder(order)) return total;
  const codCollected = Boolean(order.deliveredAt || order.status === "delivered" || order.status === "complete");
  const fulfillmentStarted = Boolean(order.trackingNumber || order.shippedAt || order.status === "shipped");
  if (codCollected || fulfillmentStarted) return total;
  const savedPercent = Number(order.paymentMethod?.match(/(\d+)%\s*Prepaid/i)?.[1] ?? 20);
  const prepaidPercent = Number.isFinite(savedPercent) ? savedPercent : 20;
  return Math.round(total * (prepaidPercent / 100));
}

function orderUnits(order: Order): number {
  return (order.cartSnapshot ?? []).reduce((sum, item) => sum + (item.isGift ? 0 : Number(item.quantity || 0)), 0);
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function startOfWeek(value: Date): Date {
  const date = startOfDay(value);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date;
}

function makePeriods(granularity: FinanceGranularity, now: Date): FinancePeriod[] {
  const count = 12;

  return Array.from({ length: count }, (_, index) => {
    const offset = count - 1 - index;

    if (granularity === "monthly") {
      const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      return {
        key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
        label: start.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        start,
        end,
      };
    }

    if (granularity === "weekly") {
      const start = startOfWeek(now);
      start.setDate(start.getDate() - offset * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      const lastDay = new Date(end.getTime() - 1);
      return {
        key: start.toISOString().slice(0, 10),
        label: `${start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}–${lastDay.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
        start,
        end,
      };
    }

    const start = startOfDay(now);
    start.setDate(start.getDate() - offset);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return {
      key: start.toISOString().slice(0, 10),
      label: start.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      start,
      end,
    };
  });
}

function percentChange(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function summarize(rows: Order[]) {
  const revenue = rows.reduce((sum, order) => sum + recognizedRevenue(order), 0);
  const units = rows.reduce((sum, order) => sum + orderUnits(order), 0);
  return {
    revenue,
    orders: rows.length,
    units,
    aov: rows.length ? revenue / rows.length : 0,
  };
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const rawGranularity = searchParams.get("granularity");
    const granularity: FinanceGranularity =
      rawGranularity === "daily" || rawGranularity === "weekly" || rawGranularity === "monthly"
        ? rawGranularity
        : "monthly";
    const market = parseAdminMarket(searchParams.get("market"));
    const now = new Date();
    const periods = makePeriods(granularity, now);
    const firstPeriod = periods[0];

    let rows = await db
      .select()
      .from(orders)
      .where(and(gte(orders.createdAt, firstPeriod.start), lte(orders.createdAt, now)))
      .orderBy(asc(orders.createdAt))
      .limit(10000);

    rows = filterExcludedAdminRows(rows, collectExcludedSessionIds(rows));
    if (market === "india") rows = rows.filter(isIndiaCheckoutSignal);
    if (market === "out_of_india") rows = rows.filter((order) => !isIndiaCheckoutSignal(order));

    const qualifiedRows = rows.filter(isRevenueQualifiedOrder);
    const points = periods.map((period) => {
      const periodRows = qualifiedRows.filter(
        (order) => order.createdAt >= period.start && order.createdAt < period.end,
      );
      return { ...period, ...summarize(periodRows) };
    });

    const currentPeriod = periods[periods.length - 1];
    const previousPeriod = periods[periods.length - 2];
    const currentRows = qualifiedRows.filter(
      (order) => order.createdAt >= currentPeriod.start && order.createdAt <= now,
    );
    const elapsedMs = now.getTime() - currentPeriod.start.getTime();
    const previousComparableEnd = new Date(
      Math.min(previousPeriod.end.getTime(), previousPeriod.start.getTime() + elapsedMs),
    );
    const previousRows = qualifiedRows.filter(
      (order) => order.createdAt >= previousPeriod.start && order.createdAt <= previousComparableEnd,
    );
    const current = summarize(currentRows);
    const previous = summarize(previousRows);
    const totals = summarize(qualifiedRows);

    const codOutstanding = rows.reduce((sum, order) => {
      if (!isPartialCodOrder(order) || order.deliveredAt || ["delivered", "complete"].includes(order.status)) return sum;
      const total = money(order.grandTotal);
      const savedPercent = Number(order.paymentMethod?.match(/(\d+)%\s*Prepaid/i)?.[1] ?? 20);
      const prepaidPercent = Number.isFinite(savedPercent) ? savedPercent : 20;
      return sum + Math.max(0, total - Math.round(total * (prepaidPercent / 100)));
    }, 0);

    return NextResponse.json({
      ok: true,
      granularity,
      market,
      range: {
        from: firstPeriod.start.toISOString(),
        to: now.toISOString(),
        label: granularity === "daily" ? "Last 12 days" : granularity === "weekly" ? "Last 12 weeks" : "Last 12 months",
      },
      points: points.map(({ key, label, start, end, revenue, orders: orderCount, units, aov }) => ({
        key,
        label,
        start: start.toISOString(),
        end: end.toISOString(),
        revenue,
        orders: orderCount,
        units,
        aov,
      })),
      totals,
      current,
      previous,
      change: {
        revenue: percentChange(current.revenue, previous.revenue),
        orders: percentChange(current.orders, previous.orders),
        units: percentChange(current.units, previous.units),
        aov: percentChange(current.aov, previous.aov),
      },
      codOutstanding,
    });
  } catch (error) {
    console.error("Finance trends error:", error);
    return NextResponse.json({ ok: false, error: "Unable to load finance trends" }, { status: 500 });
  }
}
