"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { makeQrSvg } from "@/lib/qr-svg";
import {
  QrCode,
  Plus,
  ArrowUpRight,
  Download,
  Copy,
  RefreshCw,
  ScanLine,
  Users,
  Clock,
  Archive,
  Search,
  Check,
  Link2,
} from "lucide-react";
import { QR_ORIGIN } from "@/lib/qr-system";

type Campaign = {
  id: string;
  name: string;
  target_url: string;
  target_page: string;
  archived_at: string | null;
  created_at: string;
  scan_count: number;
  tracked_scans: number;
  unique_visitors: number;
  tracked_last_scan: string | null;
  qr_code_svg: string | null;
};
type Scan = {
  id: string;
  scanned_at: string;
  device: string;
  browser: string;
  referrer_host: string | null;
};
type Report = {
  stats: { scans: number; visitors: number; last_scan: string | null };
  daily: { day: string; scans: number }[];
  devices: { device: string; scans: number }[];
  events: Scan[];
};
const date = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "No scans yet";
const field =
  "w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-300";
const button =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm text-stone-200 transition hover:bg-white/10 disabled:opacity-40";
function download(content: Blob, name: string) {
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function QRGeneratorStudio() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [days, setDays] = useState(30);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [editName, setEditName] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const current = campaigns.find((c) => c.id === selected);
  const trackingUrl = current ? `${QR_ORIGIN}/q/${current.id}` : "";
  const svg = useMemo(
    () => (trackingUrl ? makeQrSvg(trackingUrl) : ""),
    [trackingUrl],
  );
  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/admin/qr-campaigns?days=${days}&page=${page}${selected ? `&id=${encodeURIComponent(selected)}` : ""}`,
          { signal },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load QR codes");
        setCampaigns(data.campaigns);
        setReport(selected ? data : null);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError((e as Error).message);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [days, page, selected],
  );
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);
  useEffect(() => {
    setEditName(current?.name || "");
    setEditDestination(current?.target_url || "");
  }, [current?.id, current?.name, current?.target_url]);
  async function mutate(method: string, body: unknown) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/qr-campaigns", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");
      await load();
      return data;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  }
  async function create(event: React.FormEvent) {
    event.preventDefault();
    const data = await mutate("POST", { name, destination });
    if (data) {
      setSelected(data.id);
      setPage(1);
      setName("");
      setDestination("");
      setNotice(
        "QR created. Download the image below and test it before printing.",
      );
    }
  }
  async function exportPng() {
    try {
      const img = new Image();
      const url = URL.createObjectURL(
        new Blob([svg], { type: "image/svg+xml" }),
      );
      try {
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Image export failed"));
          img.src = url;
        });
        const canvas = document.createElement("canvas");
        canvas.width = 1600;
        canvas.height = 1600;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("PNG export unavailable");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, 1600, 1600);
        ctx.drawImage(img, 0, 0, 1600, 1600);
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png"),
        );
        if (!blob) throw new Error("PNG export failed");
        download(blob, `${current?.id}.png`);
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function exportCsv() {
    if (!current || !report) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/qr-campaigns?id=${encodeURIComponent(current.id)}&days=${days}&format=csv`,
      );
      if (!res.ok) throw new Error("Could not export scan history.");
      download(await res.blob(), `${current.id}-${days}days.csv`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const visible = campaigns.filter(
    (c) =>
      (showArchived || !c.archived_at) &&
      `${c.name} ${c.target_url}`.toLowerCase().includes(search.toLowerCase()),
  );
  const total = campaigns.reduce((n, c) => n + Number(c.tracked_scans), 0);
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-1 text-stone-100">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[.2em] text-amber-300">
            HUME / MARKETING
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">QR codes</h1>
          <p className="mt-2 text-sm text-stone-400">
            Every destination. One place to create, manage and measure.
          </p>
        </div>
        <button
          className={button}
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200"
        >
          {error}
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200"
        >
          {notice}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Active QR codes",
            value: campaigns.filter((c) => !c.archived_at).length,
            Icon: QrCode,
          },
          { label: "Tracked visits · all time", value: total, Icon: ScanLine },
          {
            label: "Destinations",
            value: new Set(
              campaigns.filter((c) => !c.archived_at).map((c) => c.target_url),
            ).size,
            Icon: Link2,
          },
        ].map(({ label, value, Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/[.03] p-5"
          >
            <div className="flex items-center justify-between text-sm text-stone-400">
              {label}
              <Icon size={18} className="text-amber-300" />
            </div>
            <div className="mt-3 text-3xl font-semibold">
              {value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-5">
          <form
            onSubmit={create}
            className="space-y-4 rounded-2xl border border-amber-300/20 bg-amber-300/[.04] p-5"
          >
            <h2 className="flex items-center gap-2 font-semibold">
              <Plus size={18} className="text-amber-300" />
              Create a QR code
            </h2>
            <label className="block space-y-2 text-sm">
              <span>Name</span>
              <input
                className={field}
                required
                maxLength={255}
                placeholder="Packaging · winter collection"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span>Destination route or URL</span>
              <input
                className={field}
                required
                maxLength={2048}
                placeholder="/perfumes or https://example.com"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </label>
            <p className="text-xs leading-relaxed text-stone-400">
              Site routes open on humefragrance.com. You can change the
              destination later; the printed QR stays the same.
            </p>
            <button
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-200 disabled:opacity-50"
            >
              <Plus size={16} />
              {busy ? "Saving…" : "Create QR code"}
            </button>
          </form>
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.02]">
            <div className="space-y-3 border-b border-white/10 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Your QR codes</h2>
                <span className="text-xs text-stone-500">{visible.length}</span>
              </div>
              <label className="relative block">
                <Search
                  size={15}
                  className="absolute left-3 top-3 text-stone-500"
                />
                <input
                  aria-label="Search QR codes"
                  className={`${field} pl-9`}
                  placeholder="Search name or destination"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-stone-400">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                />
                Include archived
              </label>
            </div>
            <div className="max-h-[600px] overflow-auto">
              {visible.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelected(c.id);
                    setPage(1);
                    setNotice("");
                  }}
                  className={`w-full border-b border-white/5 p-4 text-left transition hover:bg-white/5 ${selected === c.id ? "bg-amber-300/10 ring-1 ring-inset ring-amber-300/20" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {c.name}
                    </span>
                    <span className="shrink-0 text-xs text-amber-200">
                      {Number(c.tracked_scans)} visits
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-stone-500">
                    {c.target_url}
                  </p>
                  <div className="mt-2 flex gap-2 text-[10px] uppercase tracking-wider text-stone-400">
                    <span>
                      {c.archived_at
                        ? "Archived"
                        : c.target_page === "custom"
                          ? "Dynamic"
                          : "Legacy"}
                    </span>
                  </div>
                </button>
              ))}
              {!visible.length && (
                <p className="p-6 text-sm text-stone-500">
                  {loading
                    ? "Loading QR codes…"
                    : "No QR codes found. Create your first one above."}
                </p>
              )}
            </div>
          </section>
        </aside>
        <main className="min-w-0 space-y-5">
          {!current ? (
            <div className="flex min-h-[440px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 px-8 text-center">
              <QrCode size={56} className="mb-5 text-amber-300/60" />
              <h2 className="text-xl font-medium">
                A small code. A clear picture.
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-400">
                Create or select a QR code to download its image, update its
                destination and see when people visit.
              </p>
            </div>
          ) : (
            <>
              <section className="rounded-2xl border border-white/10 bg-white/[.03] p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-amber-300">
                      {current.archived_at
                        ? "ARCHIVED · LINK PAUSED"
                        : current.target_page === "custom"
                          ? "DYNAMIC QR CODE"
                          : "LEGACY CAMPAIGN"}
                    </p>
                    <h2 className="mt-2 break-words text-2xl font-semibold">
                      {current.name}
                    </h2>
                    <p className="mt-1 text-xs text-stone-500">
                      Created {date(current.created_at)} IST
                    </p>
                  </div>
                  <button
                    className={button}
                    disabled={busy}
                    onClick={async () => {
                      if (
                        window.confirm(
                          current.archived_at
                            ? "Restore this QR link?"
                            : "Archive this QR? Its tracking link will be paused; history is kept.",
                        )
                      ) {
                        const result = await mutate("PATCH", {
                          id: current.id,
                          archived: !current.archived_at,
                        });
                        if (result)
                          setNotice(
                            current.archived_at
                              ? "QR restored."
                              : "QR archived. Scan history is preserved.",
                          );
                      }
                    }}
                  >
                    <Archive size={14} />
                    {current.archived_at ? "Restore" : "Archive"}
                  </button>
                </div>
                {current.target_page !== "custom" && (
                  <p className="mt-4 rounded-xl bg-amber-300/10 p-3 text-xs leading-relaxed text-amber-100">
                    This is a legacy campaign. Existing printed images retain
                    their original destination and cannot be updated.
                    Destination changes apply to the new downloadable QR below,
                    which uses a tracking link. New visits are reported
                    separately from {current.scan_count || 0} historical scan
                    counts.
                  </p>
                )}
                <div className="mt-6 grid grid-cols-1 items-start gap-6 sm:grid-cols-[200px_minmax(0,1fr)]">
                  <div className="w-full max-w-[240px]">
                    <div
                      className="rounded-xl bg-white p-1 [&_svg]:h-auto [&_svg]:w-full"
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        className={`${button} flex-1`}
                        onClick={() =>
                          download(
                            new Blob([svg], { type: "image/svg+xml" }),
                            `${current.id}.svg`,
                          )
                        }
                      >
                        <Download size={14} />
                        SVG
                      </button>
                      <button
                        className={`${button} flex-1`}
                        onClick={() => void exportPng()}
                      >
                        PNG
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-stone-500">
                      Black on white, with rounded corner markers. Keep the clear border and test at
                      the final size.
                    </p>
                  </div>
                  <div className="min-w-0 space-y-4">
                    <label className="block space-y-2 text-xs text-stone-400">
                      <span>Permanent tracking link</span>
                      <div className="flex gap-2">
                        <input readOnly className={field} value={trackingUrl} />
                        <button
                          aria-label="Copy tracking link"
                          className={button}
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(trackingUrl);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            } catch {
                              setError(
                                "Clipboard unavailable. Select and copy the tracking link.",
                              );
                            }
                          }}
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </label>
                    <form
                      className="space-y-3"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const result = await mutate("PATCH", {
                          id: current.id,
                          name: editName,
                          destination: editDestination,
                        });
                        if (result)
                          setNotice(
                            "QR details saved. The tracking link stays the same.",
                          );
                      }}
                    >
                      <label className="block space-y-2 text-xs text-stone-400">
                        <span>Name</span>
                        <input
                          required
                          maxLength={255}
                          className={field}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </label>
                      <label className="block space-y-2 text-xs text-stone-400">
                        <span>Destination</span>
                        <input
                          required
                          maxLength={2048}
                          className={field}
                          value={editDestination}
                          onChange={(e) => setEditDestination(e.target.value)}
                        />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button className={button} disabled={busy}>
                          Save changes
                        </button>
                        <a
                          className={button}
                          href={current.target_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open destination
                          <ArrowUpRight size={14} />
                        </a>
                      </div>
                    </form>
                  </div>
                </div>
              </section>
              <section className="rounded-2xl border border-white/10 bg-white/[.02] p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-semibold">Scan activity</h2>
                  <div className="flex gap-2">
                    <select
                      aria-label="Reporting period"
                      className="rounded-xl border border-white/15 bg-stone-900 px-3 text-sm"
                      value={days}
                      onChange={(e) => {
                        setDays(Number(e.target.value));
                        setPage(1);
                      }}
                    >
                      {[7, 30, 90, 365].map((n) => (
                        <option key={n} value={n}>
                          Last {n} days
                        </option>
                      ))}
                    </select>
                    <button
                      className={button}
                      disabled={busy || !report}
                      onClick={() => void exportCsv()}
                    >
                      <Download size={14} />
                      CSV
                    </button>
                  </div>
                </div>
                {loading ? (
                  <p className="py-8 text-sm text-stone-400">
                    Loading activity…
                  </p>
                ) : (
                  report && (
                    <>
                      <div className="my-5 grid gap-3 sm:grid-cols-3">
                        {[
                          {
                            label: "Tracked visits",
                            value: report.stats.scans,
                            Icon: ScanLine,
                          },
                          {
                            label: "Unique browsers",
                            value: report.stats.visitors,
                            Icon: Users,
                          },
                          {
                            label: "Last visit · IST",
                            value: date(report.stats.last_scan),
                            Icon: Clock,
                          },
                        ].map(({ label, value, Icon }) => (
                          <div
                            key={label}
                            className="rounded-xl bg-white/[.04] p-4"
                          >
                            <p className="flex items-center gap-2 text-xs text-stone-400">
                              <Icon size={14} />
                              {label}
                            </p>
                            <p className="mt-3 text-lg font-medium">{value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mb-5 rounded-xl border border-white/10 p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-sm">Daily visits · IST</h3>
                          <span className="text-xs text-stone-500">
                            {report.daily.length} active days
                          </span>
                        </div>
                        {report.daily.length ? (
                          <div className="space-y-2 max-h-56 overflow-auto">
                            {report.daily.map((d) => (
                              <div
                                key={d.day}
                                className="flex items-center gap-3 text-xs"
                              >
                                <span className="w-20 shrink-0 text-stone-400">
                                  {d.day}
                                </span>
                                <div className="h-2 flex-1 rounded-full bg-white/5">
                                  <div
                                    className="h-2 rounded-full bg-amber-300"
                                    style={{
                                      width: `${Math.max(2, (d.scans / Math.max(...report.daily.map((x) => x.scans))) * 100)}%`,
                                    }}
                                  />
                                </div>
                                <span className="w-8 text-right">
                                  {d.scans}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-stone-500">
                            No visits in this period. Scans appear after someone
                            opens the tracking link.
                          </p>
                        )}
                      </div>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {report.devices.map((d) => (
                          <span
                            key={d.device}
                            className="rounded-full border border-white/10 px-3 py-1 text-xs text-stone-400"
                          >
                            {d.device} · {d.scans}
                          </span>
                        ))}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="border-b border-white/10 text-xs text-stone-500">
                            <tr>
                              {[
                                "Time · IST",
                                "Device",
                                "Browser",
                                "Referrer",
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="whitespace-nowrap py-3 pr-4 font-normal"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {report.events.map((e) => (
                              <tr
                                key={e.id}
                                className="border-b border-white/5"
                              >
                                <td className="whitespace-nowrap py-3 pr-4 text-xs">
                                  {date(e.scanned_at)}
                                </td>
                                <td className="py-3 pr-4 text-xs text-stone-400">
                                  {e.device}
                                </td>
                                <td className="py-3 pr-4 text-xs text-stone-400">
                                  {e.browser}
                                </td>
                                <td className="py-3 text-xs text-stone-400">
                                  {e.referrer_host || "Direct / camera"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-stone-500">
                          Page {page} · {report.stats.scans} visits
                        </span>
                        <div className="flex gap-2">
                          <button
                            className={button}
                            disabled={page === 1}
                            onClick={() => setPage((n) => n - 1)}
                          >
                            Previous
                          </button>
                          <button
                            className={button}
                            disabled={page * 50 >= report.stats.scans}
                            onClick={() => setPage((n) => n + 1)}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </>
                  )
                )}
                <p className="mt-5 text-xs leading-relaxed text-stone-500">
                  Visits count openings of the tracking link, including shared
                  links. Known bots and prefetches are excluded. Repeat requests
                  in the same 10-second window are counted once per browser.
                  Unique browsers use an anonymous cookie; clearing cookies
                  changes that count. No IP addresses are stored.
                </p>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
