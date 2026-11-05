"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Coins,
  Copy,
  Download,
  Gift,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Ticket,
  Users,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { formatINR } from "@/lib/currency";
import type { CustomerStats } from "@/lib/growth/customers";
import {
  defaultRewardSettings,
  type RewardSettings,
  type Wallet,
} from "@/lib/growth/rules";
type Tab = "customers" | "offers" | "campaigns" | "rewards";
type Coupon = {
  id: string;
  code: string;
  title: string;
  type: string;
  value: string;
  min_subtotal: string;
  active: boolean;
  redemptions: number;
  rules: { expiresAt?: string; maxUses?: number; customerKey?: string };
};
type Campaign = {
  id: string;
  title: string;
  status: string;
  recipients: number;
  accepted: number;
  delivered: number;
  read: number;
  failed: number;
  scheduled_at: string | null;
};
type Overview = {
  settings: RewardSettings;
  whatsapp: {
    configured: boolean;
    canSend: boolean;
    missing: string[];
    localSendingDisabled: boolean;
    webhookConfigured: boolean;
  };
  campaigns: Campaign[];
  coupons: Coupon[];
  segments: {
    id: string;
    name: string;
    filters: { q?: string; segment?: string };
  }[];
  products: { id: string; name: string; category_id: string }[];
  categories: { id: string; name: string }[];
};
type History = {
  orders: {
    id: string;
    order_number: string;
    status: string;
    grand_total: string;
    created_at: string;
  }[];
  drafts: {
    id: string;
    status: string;
    grand_total: string;
    updated_at: string;
  }[];
  coins: Wallet["history"];
  campaigns: { title: string; status: string; created_at: string }[];
  coupons: Coupon[];
  wallet: Wallet;
};
const field =
  "w-full rounded-xl border border-white/10 bg-[#202024] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c9b3ff]/60";
const btn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2.5 text-xs transition hover:bg-white/5 disabled:opacity-40";
const primary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#c9b3ff] px-4 py-2.5 text-xs font-semibold text-[#20162e] disabled:opacity-40";
const box = "space-y-4 rounded-2xl border border-white/10 bg-[#18181b] p-5";
const stamp = (v: string | null | undefined) =>
  v
    ? new Date(v).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";
const groups = [
  ["all", "All customers"],
  ["repeat", "Repeat buyers"],
  ["first", "First purchase"],
  ["lapsed", "No order in 30 days"],
  ["discovery", "Discovery → bottle"],
  ["abandoned", "Open checkouts"],
  ["coins", "Unused coins"],
  ["subscribed", "WhatsApp subscribers"],
];
function Label({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2 text-xs text-white/50">
      <span>{text}</span>
      {children}
    </label>
  );
}
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function GrowthCenter({
  initialTab = "customers",
}: {
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [policy, setPolicy] = useState<RewardSettings>(defaultRewardSettings);
  const [rows, setRows] = useState<CustomerStats[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ spend: 0, orders: 0, repeat: 0 });
  const [q, setQ] = useState("");
  const [segment, setSegment] = useState("all");
  const [sort, setSort] = useState("activity");
  const [page, setPage] = useState(0);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [customer, setCustomer] = useState<CustomerStats | null>(null);
  const [history, setHistory] = useState<History | null>(null);
  const [historyBusy, setHistoryBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [offerCustomer, setOfferCustomer] = useState("");
  useEffect(() => { const params = new URLSearchParams(location.search); const key=params.get("customer"); if(key && /^(phone:|email:)/.test(key)){setOfferCustomer(key);setTab("offers");} }, []);
  const [offerType, setOfferType] = useState("fixed");
  const [offerValue, setOfferValue] = useState("100");
  const [minSpend, setMinSpend] = useState("999");
  const [expiryHours, setExpiryHours] = useState("48");
  const [maxUses, setMaxUses] = useState("1");
  const [perCustomer, setPerCustomer] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [audience, setAudience] = useState("all");
  const [offerCode, setOfferCode] = useState("");
  const [sample, setSample] = useState("");
  const [eligibleProducts, setEligibleProducts] = useState<string[]>([]);
  const [eligibleCategories, setEligibleCategories] = useState<string[]>([]);
  const [stack, setStack] = useState(false);
  const [offerResult, setOfferResult] = useState<{
    code: string;
    link: string;
    message: string;
  } | null>(null);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignBody, setCampaignBody] = useState("");
  const [campaignLink, setCampaignLink] = useState(
    "https://www.humefragrance.com/shop",
  );
  const [campaignDate, setCampaignDate] = useState("");
  const [preview, setPreview] = useState<{
    eligible: {key:string;name:string;phone:string}[];
    excluded: number;
    noConsent:number;
    invalidPhone:number;
    duplicates:number;
  } | null>(null);
  const [recipients, setRecipients] = useState<
    | {
        name: string;
        phone: string;
        status: string;
        error_code: string | null;
      }[]
    | null
  >(null);
  const [grant, setGrant] = useState("");
  const [grantNote, setGrantNote] = useState("");
  const [consentNote, setConsentNote] = useState("");
  const grantRequest = useRef("");
  const dateParam = (date: string) =>
    date ? new Date(date + "T00:00:00+05:30").toISOString() : "";
  const params = new URLSearchParams({
    resource: "customers",
    q,
    segment,
    sort,
    page: String(page),
    ...(from ? { from: dateParam(from) } : {}),
    ...(to ? { to: dateParam(to) } : {}),
  }).toString();
  const loadOverview = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/growth?resource=overview", {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw Error(data.error);
      setOverview(data);
      setPolicy(data.settings);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    void loadOverview();
  }, [loadOverview, refresh]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/admin/growth?" + params, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw Error(data.error);
        setRows(data.rows);
        setTotal(data.total);
        setSummary(data.summary);
      } catch (e) {
        if (!controller.signal.aborted) setError((e as Error).message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [params, refresh]);
  useEffect(() => {
    if (!customer) {
      setHistory(null);
      return;
    }
    const controller = new AbortController();
    setHistoryBusy(true);
    fetch(
      "/api/admin/growth?resource=history&key=" +
        encodeURIComponent(customer.key),
      { signal: controller.signal },
    )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw Error(data.error);
        return data;
      })
      .then(setHistory)
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setHistoryBusy(false);
      });
    return () => controller.abort();
  }, [customer, refresh]);
  async function action(body: unknown) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw Error(data.error);
      return data;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  }
  function toggle(key: string) {
    setSelected((old) =>
      old.includes(key) ? old.filter((v) => v !== key) : [...old, key],
    );
    setPreview(null);
  }
  function startOffer(c: CustomerStats) {
    setOfferCustomer(c.key);
    setOfferResult(null);
    setCustomer(null);
    setTab("offers");
  }
  async function createOffer(e: React.FormEvent) {
    e.preventDefault();
    const rules = {
      expiresAt: expiryHours
        ? new Date(Date.now() + Number(expiryHours) * 3600000).toISOString()
        : null,
      maxUses: maxUses ? Number(maxUses) : null,
      perCustomer: offerCustomer ? 1 : perCustomer ? Number(perCustomer) : null,
      customerKey: offerCustomer || null,
      audience,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      productIds: eligibleProducts,
      categoryIds: eligibleCategories,
      sampleProductId: sample || null,
      stackable: stack,
    };
    const data = await action({
      action: "quickOffer",
      type: offerType,
      value: ["free_sample", "free_shipping"].includes(offerType)
        ? 0
        : Number(offerValue),
      minSubtotal: Number(minSpend) || 0,
      code: offerCode || undefined,
      rules,
    });
    if (data) {
      setOfferResult(data);
      setRefresh((n) => n + 1);
      try {
        await navigator.clipboard.writeText(data.message);
        setNotice("Offer created and message copied.");
      } catch {
        setNotice("Offer created. Copy its message below.");
      }
    }
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Copied.");
    } catch {
      setError("Clipboard unavailable. Select and copy the text.");
    }
  }
  async function saveCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!preview) {
      const data = await action({ action: "previewCampaign", keys: selected });
      if (data) setPreview(data);
      return;
    }
    const data = await action({
      action: "createCampaign",
      title: campaignTitle,
      body: campaignBody,
      link: campaignLink,
      keys: preview.eligible.map((c) => c.key),
      scheduledAt: campaignDate
        ? new Date(campaignDate).toISOString()
        : undefined,
    });
    if (data) {
      setPreview(null);
      setRefresh((n) => n + 1);
      setNotice(
        `Draft saved for ${data.eligible} subscribers. No messages sent.`,
      );
    }
  }
  const target = rows.find((c) => c.key === offerCustomer);
  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-5 text-white">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 basis-full sm:flex-1 sm:basis-0">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[#c9b3ff]">
            HUME / Customer growth
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Customers, offers & rewards
          </h1>
          <p className="mt-2 text-sm text-white/40">
            Understand your customers. Create a personal offer. Give them a
            reason to return.
          </p>
        </div>
        <button
          className={btn}
          disabled={busy}
          onClick={() => {
            setError("");
            setRefresh((n) => n + 1);
          }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </header>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200"
        >
          {error}
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-200"
        >
          {notice}
        </div>
      )}
      <nav
        aria-label="Customer growth sections"
        className="grid grid-cols-2 gap-1 md:flex md:overflow-x-auto rounded-2xl border border-white/10 bg-[#18181b] p-1.5"
      >
        {(
          [
            { id: "customers", label: "Customers", Icon: Users },
            { id: "offers", label: "Quick offers", Icon: Ticket },
            {
              id: "campaigns",
              label: "WhatsApp campaigns",
              Icon: MessageCircle,
            },
            { id: "rewards", label: "Coins & referrals", Icon: Gift },
          ] as const
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
            className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-[11px] sm:px-4 sm:text-xs ${tab === id ? "bg-[#c9b3ff]/15 text-[#decfff]" : "text-white/40 hover:bg-white/5"}`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </nav>
      {tab === "customers" && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["Matching customers", total],
              ["Paid orders · lifetime", summary.orders],
              ["Collected spend · lifetime", formatINR(summary.spend)],
              ["Repeat buyers", summary.repeat],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-2xl border border-white/[.08] bg-[#18181b] p-4"
              >
                <p className="text-[11px] text-white/40">{label}</p>
                <p className="mt-3 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <section className={box}>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_190px_170px]">
              <label className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-3.5 text-white/30"
                />
                <input
                  aria-label="Search customers"
                  className={`${field} pl-9`}
                  placeholder="Name, phone or email"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(0);
                  }}
                />
              </label>
              <select
                aria-label="Customer segment"
                className={field}
                value={segment}
                onChange={(e) => {
                  setSegment(e.target.value);
                  setPage(0);
                }}
              >
                {groups.map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                aria-label="Sort customers"
                className={field}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="activity">Account activity</option>
                <option value="spend">Highest spend</option>
                <option value="orders">Most paid orders</option>
                <option value="login">Latest login</option>
              </select>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <Label text="Activity from · IST">
                <input
                  type="date"
                  className={field}
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setPage(0);
                  }}
                />
              </Label>
              <Label text="Activity until · IST">
                <input
                  type="date"
                  className={field}
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setPage(0);
                  }}
                />
              </Label>
              <button
                className={btn}
                onClick={async () => {
                  const name = window.prompt("Name this saved customer group");
                  if (
                    name &&
                    (await action({
                      action: "saveSegment",
                      name,
                      filters: {
                        q,
                        segment,
                        sort,
                        ...(from ? { from: dateParam(from) } : {}),
                        ...(to ? { to: dateParam(to) } : {}),
                      },
                    }))
                  ) {
                    setRefresh((n) => n + 1);
                    setNotice("Group saved.");
                  }
                }}
              >
                Save group
              </button>
              <button
                className={btn}
                onClick={async () => {
                  const res = await fetch(
                    "/api/admin/growth?" + params + "&format=csv",
                  );
                  if (res.ok) download(await res.blob(), "hume-customers.csv");
                  else setError("Export failed.");
                }}
              >
                <Download size={13} />
                CSV
              </button>
              <Link className={btn} href="/admin/customers?view=orders">
                Order workspace ↗
              </Link>
            </div>
            {overview?.segments.length ? (
              <div className="flex flex-wrap gap-2">
                {overview.segments.map((g) => (
                  <button
                    key={g.id}
                    className={btn}
                    onClick={() => {
                      setQ(g.filters.q || "");
                      setSegment(g.filters.segment || "all");
                      setPage(0);
                    }}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            ) : null}
            <p className="text-[10px] leading-relaxed text-white/30">
              Purchase figures are lifetime totals. Verified processed refunds
              are deducted from recorded payments. Date filters select customer
              activity; login and account activity remain separate.
            </p>
          </section>
          <div className="flex flex-wrap justify-between gap-2">
            <label className="flex items-center gap-2 text-xs text-white/50">
              <input
                type="checkbox"
                checked={
                  rows.length > 0 && rows.every((c) => selected.includes(c.key))
                }
                onChange={(e) => {
                  setSelected((old) =>
                    e.target.checked
                      ? [...new Set([...old, ...rows.map((c) => c.key)])]
                      : old.filter((key) => !rows.some((c) => c.key === key)),
                  );
                  setPreview(null);
                }}
              />
              Select page · {selected.length} selected
            </label>
            <div className="flex gap-2">
              <button
                className={btn}
                disabled={!selected.length}
                onClick={() => {
                  setTab("campaigns");
                  setPreview(null);
                }}
              >
                Create campaign
              </button>
              <button className={btn} onClick={() => setSelected([])}>
                Clear selection
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#18181b]">
            <table className="w-full min-w-[1150px] text-left text-xs">
              <thead className="border-b border-white/10 text-[10px] text-white/35">
                <tr>
                  {[
                    "",
                    "Customer",
                    "Paid orders",
                    "Paid spend",
                    "Avg. paid order",
                    "First order",
                    "Last order",
                    "Last login · IST",
                    "Account activity · IST",
                    "Coins",
                    "WhatsApp",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="whitespace-nowrap px-3 py-4 font-normal"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.key} className="border-b border-white/5">
                    <td className="px-3 py-4">
                      <input
                        aria-label={`Select ${c.name}`}
                        type="checkbox"
                        checked={selected.includes(c.key)}
                        onChange={() => toggle(c.key)}
                      />
                    </td>
                    <td className="max-w-52 px-3 py-4">
                      <button
                        onClick={() => setCustomer(c)}
                        className="block truncate text-left font-medium"
                      >
                        {c.name}
                      </button>
                      <p className="mt-1 truncate text-[10px] text-white/35">
                        {c.phone || c.email}
                      </p>
                    </td>
                    <td className="px-3">
                      {c.paid_orders}
                      <span className="text-white/25"> / {c.orders}</span>
                    </td>
                    <td className="whitespace-nowrap px-3">
                      {formatINR(c.spend)}
                    </td>
                    <td className="whitespace-nowrap px-3 text-white/50">
                      {formatINR(c.aov)}
                    </td>
                    <td className="whitespace-nowrap px-3 text-[10px] text-white/40">
                      {stamp(c.first_order)}
                    </td>
                    <td className="whitespace-nowrap px-3 text-[10px] text-white/50">
                      {stamp(c.last_order)}
                    </td>
                    <td className="whitespace-nowrap px-3 text-[10px] text-white/50">
                      {stamp(c.last_login)}
                    </td>
                    <td className="whitespace-nowrap px-3 text-[10px] text-white/35">
                      {stamp(c.last_activity)}
                    </td>
                    <td className="px-3 text-[#dcc393]">
                      {c.available_coins}
                      <span className="block text-[9px] text-white/25">
                        {c.pending_coins} pending
                      </span>
                    </td>
                    <td className="px-3 text-[10px] text-white/50">
                      {c.marketing_opt_in ? "Subscribed" : "Not subscribed"}
                    </td>
                    <td className="px-3">
                      <button className={btn} onClick={() => startOffer(c)}>
                        Offer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && (
              <p className="p-10 text-center text-sm text-white/35">
                {loading
                  ? "Loading customer statistics…"
                  : "No matching customers."}
              </p>
            )}
          </div>
          <div className="flex justify-between text-xs text-white/40">
            <span>
              {loading
                ? "Refreshing…"
                : `${total} customers · page ${page + 1}`}
            </span>
            <div className="flex gap-2">
              <button
                className={btn}
                disabled={page === 0 || loading}
                onClick={() => setPage((n) => n - 1)}
              >
                Previous
              </button>
              <button
                className={btn}
                disabled={(page + 1) * 50 >= total || loading}
                onClick={() => setPage((n) => n + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
      {tab === "offers" && (
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
          <form onSubmit={createOffer} className={box}>
            <h2 className="flex items-center gap-2 font-semibold">
              <Plus size={17} />
              Create an offer in seconds
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["fixed", "₹ off"],
                ["percent", "% off"],
                ["free_shipping", "Free delivery"],
                ["free_sample", "Free sample"],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={offerType === value}
                  onClick={() => setOfferType(value)}
                  className={`rounded-xl border px-2 py-3 text-xs ${offerType === value ? "border-[#c9b3ff]/40 bg-[#c9b3ff]/10 text-[#dccbff]" : "border-white/10 text-white/40"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <Label text="Customer">
              <select
                className={field}
                value={offerCustomer}
                onChange={(e) => setOfferCustomer(e.target.value)}
              >
                <option value="">Anyone with the code</option>
                {offerCustomer &&
                  !rows.some((c) => c.key === offerCustomer) && (
                    <option value={offerCustomer}>{offerCustomer}</option>
                  )}
                {rows.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.name} · {c.phone || c.email}
                  </option>
                ))}
              </select>
            </Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {["fixed", "percent"].includes(offerType) && (
                <Label
                  text={offerType === "fixed" ? "Discount · ₹" : "Discount · %"}
                >
                  <input
                    required
                    type="number"
                    min={1}
                    max={offerType === "percent" ? 100 : 100000}
                    className={field}
                    value={offerValue}
                    onChange={(e) => setOfferValue(e.target.value)}
                  />
                </Label>
              )}
              <Label text="Minimum spend · ₹">
                <input
                  type="number"
                  min={0}
                  className={field}
                  value={minSpend}
                  onChange={(e) => setMinSpend(e.target.value)}
                />
              </Label>
              <Label text="Expires in">
                <select
                  className={field}
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(e.target.value)}
                >
                  <option value="24">24 hours</option>
                  <option value="48">48 hours</option>
                  <option value="168">7 days</option>
                  <option value="720">30 days</option>
                  <option value="">No expiry</option>
                </select>
              </Label>
              <Label text="Total uses · blank for unlimited">
                <input
                  type="number"
                  min={1}
                  className={field}
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                />
              </Label>
            </div>
            {offerType === "free_sample" && (
              <Label text="Sample fragrance">
                <select
                  required
                  className={field}
                  value={sample}
                  onChange={(e) => setSample(e.target.value)}
                >
                  <option value="">Choose fragrance</option>
                  {overview?.products
                    .filter(
                      (p) =>
                        ![
                          "discovery-set",
                          "rose-water",
                          "car-fragrance",
                        ].includes(p.category_id),
                    )
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </Label>
            )}
            <details className="rounded-xl border border-white/10 p-3">
              <summary className="cursor-pointer text-xs text-white/50">
                Advanced rules
              </summary>
              <div className="mt-4 space-y-3">
                <Label text="Custom code · optional">
                  <input
                    className={field}
                    value={offerCode}
                    onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                    maxLength={32}
                    pattern="[A-Za-z0-9_-]+"
                    placeholder="Generated automatically"
                  />
                </Label>
                <Label text="Customer eligibility">
                  <select
                    className={field}
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  >
                    <option value="all">Any customer</option>
                    <option value="first">First paid order only</option>
                    <option value="returning">Returning customers only</option>
                  </select>
                </Label>
                {!offerCustomer && (
                  <Label text="Uses per verified customer · optional">
                    <input
                      type="number"
                      min={1}
                      className={field}
                      value={perCustomer}
                      onChange={(e) => setPerCustomer(e.target.value)}
                    />
                  </Label>
                )}
                {offerType === "percent" && (
                  <Label text="Maximum discount · ₹">
                    <input
                      type="number"
                      min={0}
                      className={field}
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(e.target.value)}
                    />
                  </Label>
                )}
                <Label text="Eligible products · leave empty for all">
                  <select
                    multiple
                    className={`${field} min-h-28`}
                    value={eligibleProducts}
                    onChange={(e) =>
                      setEligibleProducts(
                        [...e.target.selectedOptions].map((o) => o.value),
                      )
                    }
                  >
                    {overview?.products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </Label>
                <Label text="Eligible scent families · leave empty for all">
                  <select
                    multiple
                    className={`${field} min-h-24`}
                    value={eligibleCategories}
                    onChange={(e) =>
                      setEligibleCategories(
                        [...e.target.selectedOptions].map((o) => o.value),
                      )
                    }
                  >
                    {overview?.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Label>
                <label className="flex gap-2 text-xs text-white/50">
                  <input
                    type="checkbox"
                    checked={stack}
                    onChange={(e) => setStack(e.target.checked)}
                  />
                  Allow welcome-back offer stacking
                </label>
              </div>
            </details>
            <p className="text-[10px] leading-relaxed text-white/30">
              Personal offers require a verified account. Creating an offer does
              not message the customer.
            </p>
            <button className={`${primary} w-full`} disabled={busy}>
              {busy ? "Creating…" : "Create & copy message"}
            </button>
          </form>
          <div className="space-y-4">
            {offerResult && (
              <section className="space-y-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/[.04] p-5">
                <p className="text-xs text-emerald-200">Ready to share</p>
                <p className="font-mono text-2xl font-bold tracking-wider">
                  {offerResult.code}
                </p>
                <textarea
                  readOnly
                  className={`${field} min-h-36`}
                  value={offerResult.message}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    className={btn}
                    onClick={() => void copy(offerResult.message)}
                  >
                    <Copy size={13} />
                    Copy message
                  </button>
                  <button
                    className={btn}
                    onClick={() => void copy(offerResult.link)}
                  >
                    Copy link
                  </button>
                  {target?.phone && (
                    <a
                      className={btn}
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://wa.me/91${target.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(offerResult.message)}`}
                    >
                      Review in WhatsApp ↗
                    </a>
                  )}
                </div>
              </section>
            )}
            <section className={box}>
              <div className="flex justify-between gap-2">
                <h2 className="font-semibold">Your coupons</h2>
                <Link
                  href="/admin/coupon-leads?view=leads"
                  className="text-xs text-[#c9b3ff]"
                >
                  Claims & leads ↗
                </Link>
              </div>
              <div className="max-h-[650px] space-y-3 overflow-auto">
                {overview?.coupons.map((c) => (
                  <article
                    key={c.id}
                    className="rounded-xl border border-white/[.07] p-3"
                  >
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="font-mono text-sm font-semibold text-[#d9c5ff]">
                          {c.code}
                        </p>
                        <p className="mt-1 text-xs text-white/60">{c.title}</p>
                      </div>
                      <button
                        className={btn}
                        disabled={busy}
                        onClick={async () => {
                          if (
                            await action({
                              action: "couponStatus",
                              id: c.id,
                              active: !c.active,
                            })
                          ) {
                            setRefresh((n) => n + 1);
                            setNotice(
                              c.active ? "Coupon paused." : "Coupon activated.",
                            );
                          }
                        }}
                      >
                        {c.active ? "Pause" : "Activate"}
                      </button>
                    </div>
                    <p className="mt-2 text-[10px] leading-relaxed text-white/30">
                      Min ₹{c.min_subtotal} ·{" "}
                      {c.rules?.customerKey ? "Personal" : "Shareable"} ·{" "}
                      {c.redemptions} redeemed
                      {c.rules?.maxUses ? ` / ${c.rules.maxUses} uses` : ""}
                      <br />
                      Expires:{" "}
                      {c.rules?.expiresAt
                        ? stamp(c.rules.expiresAt)
                        : "No expiry"}
                    </p>
                    <button
                      className="mt-2 text-[10px] underline"
                      onClick={() => void copy(c.code)}
                    >
                      Copy code
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
      {tab === "campaigns" && (
        <div className="space-y-5">
          <section className="rounded-2xl border border-amber-200/15 bg-amber-200/[.04] p-4 text-xs leading-relaxed text-amber-100/80">
            <strong>
              WhatsApp:{" "}
              {overview?.whatsapp.configured
                ? "credentials configured"
                : "setup required"}
            </strong>
            <p>
              {overview?.whatsapp.localSendingDisabled
                ? "Local sending is disabled. Drafts and previews are available."
                : "Campaigns use an approved marketing template and recorded subscriptions."}
            </p>
            {overview?.whatsapp.missing.length ? (
              <p className="mt-1 text-[10px] text-white/35">
                Missing server settings: {overview.whatsapp.missing.join(", ")}
              </p>
            ) : null}
            <p className="mt-1 text-[10px] text-white/35">
              Delivery webhooks:{" "}
              {overview?.whatsapp.webhookConfigured
                ? "configured"
                : "not configured"}{" "}
              · Accepted does not mean delivered.
            </p>
          </section>
          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
            <form onSubmit={saveCampaign} className={box}>
              <h2 className="font-semibold">New offer campaign</h2>
              <p className="text-xs text-white/40">
                {selected.length} selected customers. Only subscribed, valid
                WhatsApp contacts are included.
              </p>
              <button
                type="button"
                className={btn}
                onClick={() => setTab("customers")}
              >
                Choose customers
              </button>
              <Label text="Campaign title">
                <input
                  required
                  maxLength={150}
                  className={field}
                  placeholder="Black Friday · early access"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                />
              </Label>
              <Label text="Offer message">
                <textarea
                  required
                  maxLength={950}
                  className={`${field} min-h-28`}
                  value={campaignBody}
                  onChange={(e) => setCampaignBody(e.target.value)}
                />
              </Label>
              <Label text="Offer link">
                <input
                  type="url"
                  required
                  className={field}
                  value={campaignLink}
                  onChange={(e) => setCampaignLink(e.target.value)}
                />
              </Label>
              <Label text="Schedule · your local time · optional">
                <input
                  type="datetime-local"
                  className={field}
                  value={campaignDate}
                  onChange={(e) => setCampaignDate(e.target.value)}
                />
              </Label>
              {preview && (
                <div className="rounded-xl bg-[#c9b3ff]/5 p-3 text-xs">
                  <p>
                    {preview.eligible.length} eligible · {preview.excluded}{" "}
                    excluded
                  </p>
                  <p className="mt-2 leading-relaxed text-white/60">{preview.noConsent || 0} without WhatsApp marketing consent · {preview.invalidPhone || 0} invalid phone numbers · {preview.duplicates || 0} duplicate numbers.</p>
                  {!preview.eligible.length && <p role="status" className="mt-3 rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 leading-relaxed text-amber-100">No recipients can receive this campaign yet. Customers can opt in from My Account, or you can record consent in their customer profile after receiving their permission. Select subscribed customers and preview again.</p>}
                  <div className="mt-2 max-h-32 overflow-auto text-[10px] text-white/40">
                    {preview.eligible.map((c) => (
                      <p key={c.key}>
                        {c.name} · {c.phone}
                      </p>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="mt-2 underline"
                    onClick={() => setPreview(null)}
                  >
                    Change selection
                  </button>
                </div>
              )}
              <button
                disabled={
                  busy ||
                  !selected.length ||
                  Boolean(preview && !preview.eligible.length)
                }
                className={primary}
              >
                {preview ? "Save reviewed draft" : "Preview recipients"}
              </button>
              <p className="text-[10px] text-white/30">
                Drafts send nothing. STOP replies remove subscriptions.
              </p>
            </form>
            <section className={box}>
              <h2 className="font-semibold">Campaign history</h2>
              {overview?.campaigns.map((c) => (
                <article
                  key={c.id}
                  className="rounded-xl border border-white/10 p-4"
                >
                  <div className="flex justify-between gap-2">
                    <h3 className="text-sm">{c.title}</h3>
                    <span className="text-[10px] uppercase text-[#c9b3ff]">
                      {c.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-white/35">
                    {c.recipients} recipients · {c.accepted} accepted ·{" "}
                    {c.delivered} delivered · {c.read} read · {c.failed} failed
                    / unknown
                  </p>
                  {c.scheduled_at && (
                    <p className="mt-1 text-[10px] text-white/30">
                      Scheduled: {stamp(c.scheduled_at)} IST
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className={btn}
                      onClick={async () => {
                        const res = await fetch(
                          "/api/admin/growth?resource=campaign&id=" + c.id,
                        );
                        const data = await res.json();
                        if (res.ok) setRecipients(data.recipients);
                        else setError(data.error);
                      }}
                    >
                      Recipients
                    </button>
                    {c.status === "draft" && (
                      <button
                        className={primary}
                        disabled={busy || !overview?.whatsapp.canSend}
                        onClick={async () => {
                          if (
                            window.confirm(
                              `Queue this campaign for ${c.recipients} subscribers?`,
                            ) &&
                            (await action({
                              action: "queueCampaign",
                              id: c.id,
                            }))
                          ) {
                            setRefresh((n) => n + 1);
                            setNotice(
                              "Campaign queued for the scheduled worker.",
                            );
                          }
                        }}
                      >
                        Queue / schedule
                      </button>
                    )}
                    {["running", "scheduled"].includes(c.status) && (
                      <button
                        className={btn}
                        disabled={busy || !overview?.whatsapp.canSend}
                        onClick={async () => {
                          if (await action({ action: "runCampaign", id: c.id }))
                            setRefresh((n) => n + 1);
                        }}
                      >
                        Process next batch
                      </button>
                    )}
                    {!["completed", "cancelled"].includes(c.status) && (
                      <button
                        className={btn}
                        disabled={busy}
                        onClick={async () => {
                          if (
                            await action({ action: "cancelCampaign", id: c.id })
                          )
                            setRefresh((n) => n + 1);
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </article>
              ))}
              {!overview?.campaigns.length && (
                <p className="text-sm text-white/30">
                  Campaign drafts and delivery reports appear here.
                </p>
              )}
            </section>
          </div>
        </div>
      )}
      {tab === "rewards" && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (await action({ action: "settings", settings: policy })) {
              setRefresh((n) => n + 1);
              setNotice("Settings saved. Coin value remains ₹1.");
            }
          }}
          className="max-w-3xl space-y-5"
        >
          <section className={box}>
            <div className="flex justify-between gap-3">
              <h2 className="flex items-center gap-2 font-semibold">
                <Coins size={17} className="text-[#d6bb87]" />
                Coin wallet
              </h2>
              <span className="text-xs text-[#e6d1ab]">1 coin = ₹1</span>
            </div>
            <p className="text-xs leading-relaxed text-white/40">
              Automatic earning is off until you enable it. Existing orders are
              not retrospectively rewarded. Manual coin grants remain available
              from customer profiles.
            </p>
            <label className="flex gap-3 text-sm">
              <input
                type="checkbox"
                checked={policy.earningEnabled}
                onChange={(e) =>
                  setPolicy((p) => ({ ...p, earningEnabled: e.target.checked }))
                }
              />
              Enable earning on future qualifying orders
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Label text="Earn coins · % of paid merchandise">
                <input
                  type="number"
                  min={0}
                  max={20}
                  step="0.1"
                  className={field}
                  value={policy.earnPercent}
                  onChange={(e) =>
                    setPolicy((p) => ({
                      ...p,
                      earnPercent: Number(e.target.value),
                    }))
                  }
                />
              </Label>
              <Label text="Maximum redemption · % of cart">
                <input
                  type="number"
                  min={1}
                  max={100}
                  className={field}
                  value={policy.maxRedeemPercent}
                  onChange={(e) =>
                    setPolicy((p) => ({
                      ...p,
                      maxRedeemPercent: Number(e.target.value),
                    }))
                  }
                />
              </Label>
              <Label text="Hold after delivery · days">
                <input
                  type="number"
                  min={0}
                  max={90}
                  className={field}
                  value={policy.holdDays}
                  onChange={(e) =>
                    setPolicy((p) => ({
                      ...p,
                      holdDays: Number(e.target.value),
                    }))
                  }
                />
              </Label>
            </div>
            <p className="text-[10px] leading-relaxed text-white/30">
              Only delivered, fully paid orders earn coins. Shipping, COD
              charges and redeemed coins do not earn rewards. Refunds reverse
              rewards; saved orders keep selected coins reserved until paid or
              cancelled.
            </p>
          </section>
          <section className={box}>
            <h2 className="font-semibold">Referral rewards</h2>
            <label className="flex gap-3 text-sm">
              <input
                type="checkbox"
                checked={policy.referralsEnabled}
                onChange={(e) =>
                  setPolicy((p) => ({
                    ...p,
                    referralsEnabled: e.target.checked,
                  }))
                }
              />
              Enable referral offers
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Label text="Referrer earns · coins">
                <input
                  className={field}
                  type="number"
                  min={0}
                  max={10000}
                  value={policy.referralCoins}
                  onChange={(e) =>
                    setPolicy((p) => ({
                      ...p,
                      referralCoins: Number(e.target.value),
                    }))
                  }
                />
              </Label>
              <Label text="Friend’s first-order discount · ₹">
                <input
                  className={field}
                  type="number"
                  min={0}
                  max={10000}
                  value={policy.friendDiscount}
                  onChange={(e) =>
                    setPolicy((p) => ({
                      ...p,
                      friendDiscount: Number(e.target.value),
                    }))
                  }
                />
              </Label>
              <Label text="Referral minimum spend · ₹">
                <input
                  className={field}
                  type="number"
                  min={0}
                  max={100000}
                  value={policy.referralMinSubtotal}
                  onChange={(e) =>
                    setPolicy((p) => ({
                      ...p,
                      referralMinSubtotal: Number(e.target.value),
                    }))
                  }
                />
              </Label>
            </div>
            <p className="text-[10px] leading-relaxed text-white/30">
              The friend must verify their account and have no previous paid
              order. Self-referrals are rejected. Referrer coins unlock after
              delivery and the hold. Referral offers do not combine with coupon
              or welcome-back offers.
            </p>
          </section>
          <button className={primary} disabled={busy}>
            Save coin & referral settings
          </button>
        </form>
      )}
      <Sheet
        open={Boolean(customer)}
        onOpenChange={(open) => {
          if (!open) setCustomer(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto bg-[#17171b] text-white sm:max-w-2xl">
          <SheetTitle className="pr-12 text-xl text-white">
            {customer?.name}
          </SheetTitle>
          <SheetDescription>
            {customer?.phone} · {customer?.email}
          </SheetDescription>
          {customer && (
            <div className="mt-6 space-y-5">
              {error && (
                <p role="alert" className="text-xs text-red-300">
                  {error}
                </p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["Paid orders", customer.paid_orders],
                  ["Paid spend", formatINR(customer.spend)],
                  [
                    "Available coins",
                    history?.wallet.available ?? customer.available_coins,
                  ],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-xl bg-white/5 p-3"
                  >
                    <p className="text-[9px] text-white/35">{label}</p>
                    <p className="mt-2 text-lg">{value}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs leading-relaxed text-white/40">
                First order: {stamp(customer.first_order)}
                <br />
                Latest order: {stamp(customer.last_order)}
                <br />
                Last verified login: {stamp(customer.last_login)}
                <br />
                Account activity: {stamp(customer.last_activity)}
                <br />
                Last WhatsApp offer: {stamp(customer.last_offer)}
              </p>
              <button className={primary} onClick={() => startOffer(customer)}>
                Create personal offer
              </button>
              <section className="space-y-3 rounded-xl border border-white/10 p-4">
                <h3 className="text-sm font-semibold">Adjust coin balance</h3>
                <input
                  aria-label="Coin adjustment"
                  type="number"
                  min={-10000}
                  max={10000}
                  className={field}
                  placeholder="Coins · negative to remove"
                  value={grant}
                  onChange={(e) => setGrant(e.target.value)}
                />
                <input
                  aria-label="Coin adjustment reason"
                  minLength={5}
                  maxLength={500}
                  className={field}
                  placeholder="Reason for this adjustment"
                  value={grantNote}
                  onChange={(e) => setGrantNote(e.target.value)}
                />
                <button
                  className={btn}
                  disabled={
                    busy || !Number(grant) || grantNote.trim().length < 5
                  }
                  onClick={async () => {
                    if (!grantRequest.current)
                      grantRequest.current = crypto.randomUUID();
                    if (
                      await action({
                        action: "grantCoins",
                        key: customer.key,
                        coins: Number(grant),
                        note: grantNote,
                        requestId: grantRequest.current,
                      })
                    ) {
                      grantRequest.current = "";
                      setGrant("");
                      setGrantNote("");
                      setRefresh((n) => n + 1);
                      setNotice("Audited coin adjustment saved.");
                    }
                  }}
                >
                  Save audited adjustment
                </button>
              </section>
              <section className="space-y-3 rounded-xl border border-white/10 p-4">
                <h3 className="text-sm font-semibold">
                  WhatsApp marketing permission
                </h3>
                <p className="text-xs leading-relaxed text-white/35">
                  {customer.marketing_opt_in
                    ? "Subscribed."
                    : "No recorded agreement. A phone number or order alone is not marketing consent."}
                </p>
                <input
                  aria-label="Consent evidence"
                  className={field}
                  placeholder="Where / when did the customer agree?"
                  value={consentNote}
                  onChange={(e) => setConsentNote(e.target.value)}
                />
                <button
                  className={btn}
                  disabled={
                    busy ||
                    (!customer.marketing_opt_in &&
                      consentNote.trim().length < 5)
                  }
                  onClick={async () => {
                    if (
                      await action({
                        action: "consent",
                        key: customer.key,
                        subscribed: !customer.marketing_opt_in,
                        evidence:
                          consentNote || "Admin removed marketing subscription",
                      })
                    ) {
                      setCustomer({
                        ...customer,
                        marketing_opt_in: !customer.marketing_opt_in,
                      });
                      setConsentNote("");
                      setRefresh((n) => n + 1);
                    }
                  }}
                >
                  {customer.marketing_opt_in
                    ? "Unsubscribe"
                    : "Record customer’s agreement"}
                </button>
              </section>
              {historyBusy ? (
                <p className="text-sm text-white/35">Loading timeline…</p>
              ) : (
                history && (
                  <>
                    <section>
                      <h3 className="mb-3 text-sm font-semibold">Orders</h3>
                      {history.orders.map((o) => (
                        <div
                          key={o.id}
                          className="flex justify-between gap-3 border-t border-white/10 py-3 text-xs"
                        >
                          <div>
                            <p>{o.order_number}</p>
                            <p className="mt-1 text-[10px] text-white/30">
                              {stamp(o.created_at)} · {o.status}
                            </p>
                          </div>
                          <span>{formatINR(Number(o.grand_total || 0))}</span>
                        </div>
                      ))}
                    </section>
                    <section>
                      <h3 className="mb-3 text-sm font-semibold">
                        Checkout history
                      </h3>
                      {history.drafts.map((d) => (
                        <p
                          key={d.id}
                          className="border-t border-white/10 py-2 text-xs text-white/45"
                        >
                          {stamp(d.updated_at)} · {d.status} ·{" "}
                          {formatINR(Number(d.grand_total || 0))}
                        </p>
                      ))}
                    </section>
                    <section>
                      <h3 className="mb-3 text-sm font-semibold">
                        Offers & campaigns
                      </h3>
                      {history.coupons.map((c) => (
                        <p key={c.id} className="py-1 text-xs text-[#d9c5ff]">
                          {c.code} · {c.title}
                        </p>
                      ))}
                      {history.campaigns.map((c, i) => (
                        <p key={i} className="py-1 text-xs text-white/45">
                          {c.title} · {c.status} · {stamp(c.created_at)}
                        </p>
                      ))}
                    </section>
                    <section>
                      <h3 className="mb-3 text-sm font-semibold">
                        Coin transactions
                      </h3>
                      {history.coins.map((c) => (
                        <p
                          key={c.id}
                          className="border-t border-white/10 py-2 text-xs text-white/45"
                        >
                          {c.delta > 0 ? "+" : ""}
                          {c.delta} · {c.note}
                          <span className="mt-1 block text-[10px]">
                            {stamp(c.created_at)}
                          </span>
                        </p>
                      ))}
                    </section>
                  </>
                )
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
      <Sheet
        open={Boolean(recipients)}
        onOpenChange={(open) => {
          if (!open) setRecipients(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto bg-[#17171b] text-white sm:max-w-xl">
          <SheetTitle className="text-white">Campaign recipients</SheetTitle>
          <SheetDescription>
            Accepted, delivered and read are separate provider states.
          </SheetDescription>
          <div className="mt-5 space-y-3">
            {recipients?.map((r, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 p-3 text-xs"
              >
                <p>
                  {r.name} · {r.phone}
                </p>
                <p className="mt-1 text-white/40">
                  {r.status}
                  {r.error_code ? " · " + r.error_code : ""}
                </p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
