"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Beaker, Boxes, CheckCircle2, FlaskConical, PackagePlus, Plus, Search, Trash2, Warehouse, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type StockGroup = string;
type StockUnit = "g" | "pcs";
type StockCategory = { id: string; name: string; unit: StockUnit };
type CatalogPerfume = { id: string; name: string };
type StockItem = {
  id: string;
  name: string;
  sku: string;
  group: StockGroup;
  unit: StockUnit;
  onHand: number;
  note: string;
};

const supportingMaterials: StockItem[] = [
  { id: "vials-3ml", name: "Empty 3ml tester vials", sku: "PKG-VIAL-3", group: "Packaging", unit: "pcs", onHand: 740, note: "Vial + sprayer" },
  { id: "bottles-50ml", name: "Empty 50ml bottles", sku: "PKG-BTL-50", group: "Packaging", unit: "pcs", onHand: 310, note: "Without cap or label" },
];

const existingOilBalances: Record<string, Pick<StockItem, "sku" | "onHand" | "note">> = {
  "lv-imagination": { sku: "OIL-IMG", onHand: 860, note: "Main production concentrate" },
  "ombre-leather": { sku: "OIL-OMB", onHand: 420, note: "Check incoming batch" },
  "sauvage-noir": { sku: "OIL-SAV", onHand: 9, note: "Reorder soon" },
  "hugo-boss": { sku: "OIL-HBM", onHand: 96, note: "Allocated for 3ml testers" },
  "ombre-nomade": { sku: "OIL-OMN", onHand: 8, note: "Allocated for Discovery Set" },
};

const existingTesterBalances: Record<string, number> = {
  "sauvage-noir": 4,
  "creed-aventus": 8,
  "ombre-leather": 5,
};

function makeOilSku(productId: string) {
  const initials = productId
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 5)
    .toUpperCase();
  return `OIL-${initials || "NEW"}`;
}

function makeTesterSku(productId: string) {
  return makeOilSku(productId).replace("OIL-", "TST-");
}

function buildInitialItems(perfumeProducts: CatalogPerfume[]): StockItem[] {
  const perfumeOils = perfumeProducts.map((product) => {
    const savedBalance = existingOilBalances[product.id];
    return {
      id: `oil-${product.id}`,
      name: product.name.trim(),
      sku: savedBalance?.sku ?? makeOilSku(product.id),
      group: "Fragrance Oil",
      unit: "g" as const,
      onHand: savedBalance?.onHand ?? 0,
      note: savedBalance?.note ?? "Opening stock to be updated",
    };
  });

  const perfumeTesters = perfumeProducts.map((product) => ({
    id: `tester-${product.id}`,
    name: `${product.name.trim()} testers`,
    sku: makeTesterSku(product.id),
    group: "Testers",
    unit: "pcs" as const,
    onHand: existingTesterBalances[product.id] ?? 0,
    note: "Ready-to-dispatch tester units",
  }));

  return [...perfumeOils, ...perfumeTesters, ...supportingMaterials];
}

const initialCategories: StockCategory[] = [
  { id: "cat-fragrance-oil", name: "Fragrance Oil", unit: "g" },
  { id: "cat-testers", name: "Testers", unit: "pcs" },
  { id: "cat-sample-oil", name: "Sample Oil", unit: "g" },
  { id: "cat-packaging", name: "Packaging", unit: "pcs" },
];
const emptyDraft: Omit<StockItem, "id"> = { name: "", sku: "", group: "Fragrance Oil", unit: "g", onHand: 0, note: "" };

function statusFor(item: StockItem) {
  if (item.onHand <= 0) return { label: "Out of stock", className: "bg-rose-500/15 text-rose-200 border-rose-400/30", alert: true };
  if (item.onHand <= 10) return { label: "Low stock", className: "bg-rose-500/15 text-rose-200 border-rose-400/30", alert: true };
  return { label: "Healthy", className: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20", alert: false };
}

type GroupTone = {
  icon: string;
  selector: string;
  dot: string;
  activeTab: string;
  inactiveTab: string;
};

const neutralTone: GroupTone = {
  icon: "border-stone-300/15 bg-stone-200/[0.07] text-stone-200/75",
  selector: "border-stone-300/15 bg-stone-200/[0.045] text-stone-200",
  dot: "bg-stone-200 shadow-[0_0_9px_rgba(231,229,228,.45)]",
  activeTab: "border-stone-200/35 bg-stone-100 text-stone-950 shadow-[0_8px_22px_rgba(231,229,228,.12)]",
  inactiveTab: "border-stone-300/15 text-stone-300/60 hover:border-stone-200/30 hover:text-stone-100",
};

const testerTone: GroupTone = {
  icon: "border-violet-400/25 bg-violet-400/[0.11] text-violet-200",
  selector: "border-violet-400/25 bg-violet-400/[0.08] text-violet-100",
  dot: "bg-violet-300 shadow-[0_0_10px_rgba(196,181,253,.7)]",
  activeTab: "border-violet-300/40 bg-violet-300 text-violet-950 shadow-[0_8px_24px_rgba(167,139,250,.2)]",
  inactiveTab: "border-violet-400/20 text-violet-200/65 hover:border-violet-300/40 hover:text-violet-100",
};

const packagingTone: GroupTone = {
  icon: "border-amber-400/25 bg-amber-400/[0.1] text-amber-200",
  selector: "border-amber-400/25 bg-amber-400/[0.07] text-amber-100",
  dot: "bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,.65)]",
  activeTab: "border-amber-300/40 bg-amber-300 text-amber-950 shadow-[0_8px_24px_rgba(251,191,36,.18)]",
  inactiveTab: "border-amber-400/20 text-amber-200/65 hover:border-amber-300/40 hover:text-amber-100",
};

const automaticGroupTones: GroupTone[] = [
  {
    icon: "border-cyan-400/25 bg-cyan-400/[0.1] text-cyan-200",
    selector: "border-cyan-400/25 bg-cyan-400/[0.07] text-cyan-100",
    dot: "bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,.65)]",
    activeTab: "border-cyan-300/40 bg-cyan-300 text-cyan-950",
    inactiveTab: "border-cyan-400/20 text-cyan-200/65 hover:border-cyan-300/40 hover:text-cyan-100",
  },
  {
    icon: "border-fuchsia-400/25 bg-fuchsia-400/[0.1] text-fuchsia-200",
    selector: "border-fuchsia-400/25 bg-fuchsia-400/[0.07] text-fuchsia-100",
    dot: "bg-fuchsia-300 shadow-[0_0_10px_rgba(240,171,252,.65)]",
    activeTab: "border-fuchsia-300/40 bg-fuchsia-300 text-fuchsia-950",
    inactiveTab: "border-fuchsia-400/20 text-fuchsia-200/65 hover:border-fuchsia-300/40 hover:text-fuchsia-100",
  },
  {
    icon: "border-lime-400/25 bg-lime-400/[0.1] text-lime-200",
    selector: "border-lime-400/25 bg-lime-400/[0.07] text-lime-100",
    dot: "bg-lime-300 shadow-[0_0_10px_rgba(190,242,100,.65)]",
    activeTab: "border-lime-300/40 bg-lime-300 text-lime-950",
    inactiveTab: "border-lime-400/20 text-lime-200/65 hover:border-lime-300/40 hover:text-lime-100",
  },
];

function groupToneFor(group: string): GroupTone {
  if (group === "Fragrance Oil") return neutralTone;
  if (group === "Testers") return testerTone;
  if (group === "Packaging") return packagingTone;

  const hash = Array.from(group).reduce((total, character) => total + character.charCodeAt(0), 0);
  return automaticGroupTones[hash % automaticGroupTones.length];
}

export default function StockManagementClient({ perfumeProducts }: { perfumeProducts: CatalogPerfume[] }) {
  const [items, setItems] = useState<StockItem[]>(() => buildInitialItems(perfumeProducts));
  const [categories, setCategories] = useState(initialCategories);
  const [activeTab, setActiveTab] = useState("All");
  const [query, setQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [formError, setFormError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<StockItem | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryUnit, setNewCategoryUnit] = useState<StockUnit>("pcs");
  const [categoryError, setCategoryError] = useState("");

  const tabs = ["All", ...categories.map((category) => category.name)];

  const visibleItems = useMemo(() => items.filter((item) => {
    const matchesTab = activeTab === "All" || item.group === activeTab;
    const needle = query.trim().toLowerCase();
    return matchesTab && (!needle || `${item.name} ${item.sku} ${item.note}`.toLowerCase().includes(needle));
  }), [activeTab, items, query]);

  const oilOnHand = items.filter((item) => item.unit === "g").reduce((sum, item) => sum + item.onHand, 0);
  const lowStockCount = items.filter((item) => statusFor(item).label !== "Healthy").length;
  const packagingOnHand = items.filter((item) => item.group === "Packaging").reduce((sum, item) => sum + item.onHand, 0);
  const healthyCount = items.length - lowStockCount;
  const healthPercent = items.length ? Math.round((healthyCount / items.length) * 100) : 0;

  const updateItem = <K extends keyof StockItem>(id: string, key: K, value: StockItem[K]) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, [key]: value } : item));
  };

  const openAddItem = () => {
    const selectedCategory = categories.find((category) => category.name === activeTab) ?? categories[0];
    const group = selectedCategory?.name ?? "Uncategorised";
    setDraft({ ...emptyDraft, group, unit: selectedCategory?.unit ?? "pcs" });
    setFormError("");
    setIsAdding(true);
  };

  const confirmAddItem = () => {
    if (!draft.name.trim()) return setFormError("Material name is required.");
    if (!draft.sku.trim()) return setFormError("A unique SKU is required.");
    if (items.some((item) => item.sku.toLowerCase() === draft.sku.trim().toLowerCase())) return setFormError("This SKU already exists in the draft inventory.");
    setItems((current) => [{ ...draft, id: crypto.randomUUID(), name: draft.name.trim(), sku: draft.sku.trim().toUpperCase() }, ...current]);
    setActiveTab("All");
    setIsAdding(false);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setItems((current) => current.filter((item) => item.id !== pendingDelete.id));
    setPendingDelete(null);
  };

  const addCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return setCategoryError("Enter a category name.");
    if (categories.some((category) => category.name.toLowerCase() === name.toLowerCase())) return setCategoryError("This category already exists.");
    const category = { id: crypto.randomUUID(), name, unit: newCategoryUnit };
    setCategories((current) => [...current, category]);
    setDraft((current) => ({ ...current, group: category.name, unit: category.unit }));
    setNewCategoryName("");
    setCategoryError("");
  };

  const deleteCategory = (category: StockCategory) => {
    const assignedCount = items.filter((item) => item.group === category.name).length;
    if (assignedCount) return setCategoryError(`Move or delete the ${assignedCount} item${assignedCount === 1 ? "" : "s"} in ${category.name} first.`);
    setCategories((current) => current.filter((item) => item.id !== category.id));
    if (activeTab === category.name) setActiveTab("All");
    if (draft.group === category.name) {
      const fallback = categories.find((item) => item.id !== category.id);
      setDraft((current) => ({ ...current, group: fallback?.name ?? "Uncategorised", unit: fallback?.unit ?? "pcs" }));
    }
    setCategoryError("");
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-emerald-300/15 bg-[radial-gradient(circle_at_82%_10%,rgba(52,211,153,.16),transparent_28%),linear-gradient(125deg,#0d1713_0%,#10271e_55%,#0b1712_100%)] p-5 shadow-[0_24px_70px_rgba(0,0,0,.24)] sm:p-7">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="admin-page-intro-copy max-w-2xl"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-emerald-200/55"><Warehouse className="h-4 w-4" /> Inventory command centre</div><h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Know what is on hand before production starts.</h2><p className="mt-2 text-sm leading-6 text-white/45">Track oils by gram and packaging by piece, with an automatic red alert when any item reaches 10 or below.</p></div>
          <Button type="button" onClick={openAddItem} className="h-12 rounded-xl bg-emerald-300 px-6 font-semibold text-[#092018] shadow-[0_12px_30px_rgba(52,211,153,.18)] hover:bg-emerald-200"><Plus className="mr-2 h-4 w-4" /> Add stock material</Button>
        </div>
        <div className="relative mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><div><div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[.14em] text-white/35"><span>Inventory health</span><span className="text-emerald-200">{healthPercent}% healthy</span></div><div className="h-2 overflow-hidden rounded-full bg-black/30"><div className="h-full rounded-full bg-gradient-to-r from-amber-300 via-emerald-300 to-emerald-400 transition-all duration-500" style={{ width: `${healthPercent}%` }} /></div></div><p className="text-xs text-white/35">{healthyCount} healthy • {lowStockCount} require attention</p></div>
        <div className="relative mt-5 rounded-xl border border-amber-300/12 bg-amber-300/[0.035] px-3 py-2 text-[11px] leading-5 text-amber-100/55"><strong className="text-amber-100/80">Planning mode:</strong> changes reset on refresh. No database or automatic stock deductions are active.</div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Oil on hand", value: `${oilOnHand.toLocaleString("en-IN")} g`, note: "Production + samples", icon: FlaskConical },
          { label: "Oil materials", value: String(items.filter((item) => item.unit === "g").length), note: "Tracked oil records", icon: Beaker },
          { label: "Low stock alerts", value: String(lowStockCount), note: "At 10 or below", icon: AlertTriangle },
          { label: "Packaging on hand", value: packagingOnHand.toLocaleString("en-IN"), note: "Total pieces", icon: Boxes },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
            <card.icon className="h-4 w-4 text-emerald-300/70" />
            <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">{card.label}</p>
            <p className="mt-1 text-xl font-semibold text-white">{card.value}</p>
            <p className="mt-1 text-xs text-white/35">{card.note}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-3xl border border-white/8 bg-white/[0.02]">
        <div className="flex flex-col gap-4 border-b border-white/8 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const tone = tab === "All" ? neutralTone : groupToneFor(tab);
              return <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`shrink-0 rounded-full border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${activeTab === tab ? tone.activeTab : tone.inactiveTab}`}>{tab}</button>;
            })}
          </div>
          <div className="flex gap-2">
            <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 lg:w-72"><Search className="h-4 w-4 text-white/25" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stock" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/20" /></label>
            <Button type="button" onClick={openAddItem} className="h-10 rounded-xl bg-emerald-400 px-4 text-black hover:bg-emerald-300"><Plus className="mr-1 h-4 w-4" /> Add item</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-separate border-spacing-x-0 border-spacing-y-2 px-3 pb-3 text-left">
            <thead><tr className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/25"><th className="px-4 py-3">Material</th><th className="px-3 py-3">Group</th><th className="px-3 py-3">On hand</th><th className="px-3 py-3">Stock notification</th><th className="px-5 py-3">Notes</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
            <tbody>
              {visibleItems.map((item) => {
                const status = statusFor(item);
                const tone = groupToneFor(item.group);
                const GroupIcon = item.unit === "pcs" ? Boxes : item.group === "Sample Oil" ? Beaker : FlaskConical;
                const cellClass = `border-y px-3 py-3.5 transition-colors ${status.alert ? "border-rose-400/15 bg-[linear-gradient(90deg,rgba(244,63,94,.045),rgba(255,255,255,.025))]" : "border-white/[0.07] bg-white/[0.028]"}`;
                return <tr key={item.id} className="group align-middle shadow-[0_8px_24px_rgba(0,0,0,.08)]">
                  <td className={`${cellClass} rounded-l-2xl border-l px-4`}><div className="flex items-center gap-3"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${tone.icon}`}><GroupIcon className="h-4 w-4" /></div><div><input value={item.name} onChange={(event) => updateItem(item.id, "name", event.target.value)} className="block w-52 bg-transparent text-sm font-semibold text-white outline-none transition focus:text-white" /><div className="mt-1 flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} /><input value={item.sku} onChange={(event) => updateItem(item.id, "sku", event.target.value.toUpperCase())} className="block w-36 bg-transparent font-mono text-[9px] uppercase tracking-[.1em] text-white/30 outline-none focus:text-white/60" /></div></div></div></td>
                  <td className={cellClass}><div className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 transition ${tone.selector}`}><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot}`} /><select value={item.group} onChange={(event) => { const category = categories.find((entry) => entry.name === event.target.value); if (!category) return; updateItem(item.id, "group", category.name); updateItem(item.id, "unit", category.unit); }} className="min-w-28 bg-transparent text-xs font-medium text-inherit outline-none"><option className="bg-[#111] text-white" value={item.group}>{item.group}</option>{categories.filter((category) => category.name !== item.group).map((category) => <option className="bg-[#111] text-white" key={category.id} value={category.name}>{category.name}</option>)}</select></div></td>
                  <td className={cellClass}><div className={`flex h-11 w-28 items-center rounded-xl border px-3 transition focus-within:ring-2 focus-within:ring-emerald-300/10 ${status.alert ? "border-rose-400/35 bg-rose-500/[0.09] shadow-[0_0_20px_rgba(244,63,94,.08)]" : "border-white/10 bg-black/25 focus-within:border-emerald-300/30"}`}><input type="number" min="0" value={item.onHand} onChange={(event) => updateItem(item.id, "onHand", Math.max(0, Number(event.target.value)))} className="min-w-0 flex-1 bg-transparent text-base font-semibold text-white outline-none" /><span className="rounded-md bg-white/5 px-1.5 py-1 text-[9px] uppercase text-white/30">{item.unit}</span></div></td>
                  <td className={cellClass}><span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] ${status.className}`}><span className={`h-2 w-2 rounded-full ${status.alert ? "animate-pulse bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,.9)]" : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.55)]"}`} />{status.label}</span>{status.alert ? <p className="mt-1.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[.08em] text-rose-300/60"><AlertTriangle className="h-3 w-3" /> Restock now</p> : null}</td>
                  <td className={`${cellClass} px-5`}><input value={item.note} onChange={(event) => updateItem(item.id, "note", event.target.value)} placeholder="Add an operations note" className="h-10 w-56 rounded-lg border border-transparent bg-transparent px-2 text-xs text-white/45 outline-none transition hover:border-white/[0.06] hover:bg-black/10 focus:border-white/10 focus:bg-black/20 focus:text-white/70 placeholder:text-white/15" /></td>
                  <td className={`${cellClass} rounded-r-2xl border-r px-4 text-right`}><button type="button" onClick={() => setPendingDelete(item)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-rose-200/65 transition hover:-translate-y-0.5 hover:border-rose-400/35 hover:bg-rose-400/10 hover:text-rose-200" aria-label={`Delete ${item.name}`}><Trash2 className="h-3.5 w-3.5" /> Delete</button></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        {!visibleItems.length ? <div className="flex min-h-56 flex-col items-center justify-center text-center"><PackagePlus className="h-8 w-8 text-white/15" /><p className="mt-3 text-sm text-white/35">No stock items match this view.</p></div> : null}
      </section>

      {isAdding ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsAdding(false); }}>
          <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111713] shadow-[0_30px_100px_rgba(0,0,0,.55)]">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-white/8 bg-[#111713]/95 px-5 py-5 backdrop-blur-xl sm:px-7"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-emerald-300/60">New inventory record</p><h3 className="mt-2 text-xl font-semibold text-white">Add stock material</h3><p className="mt-1 text-xs text-white/35">Create the material only after reviewing its opening balance.</p></div><button type="button" onClick={() => setIsAdding(false)} className="rounded-full border border-white/10 p-2 text-white/45 hover:bg-white/5 hover:text-white"><X className="h-4 w-4" /></button></div>
            <div className="space-y-6 p-5 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-white/35">Material name *</span><input autoFocus value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. Oud Wood fragrance oil" className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-emerald-300/50" /></label>
                <label className="space-y-2"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-white/35">SKU *</span><input value={draft.sku} onChange={(event) => setDraft((current) => ({ ...current, sku: event.target.value.toUpperCase() }))} placeholder="OIL-OUD" className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 font-mono text-sm uppercase text-white outline-none placeholder:text-white/20 focus:border-emerald-300/50" /></label>
                <label className="space-y-2"><span className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.14em] text-white/35"><span>Stock group</span><button type="button" onClick={() => { setCategoryError(""); setShowCategoryManager(true); }} className="normal-case tracking-normal text-emerald-300/75 hover:text-emerald-200">Manage categories</button></span><select value={draft.group} onChange={(event) => { const category = categories.find((entry) => entry.name === event.target.value); if (!category) return; setDraft((current) => ({ ...current, group: category.name, unit: category.unit })); }} className="h-12 w-full rounded-xl border border-white/10 bg-[#121612] px-4 text-sm text-white outline-none focus:border-emerald-300/50">{categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select></label>
                <label className="space-y-2"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-white/35">Measurement</span><div className="flex h-12 items-center rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white"><span className="flex-1">{draft.unit === "g" ? "Weight" : "Quantity"}</span><span className="rounded-md bg-white/5 px-2 py-1 text-xs text-emerald-200">{draft.unit}</span></div></label>
              </div>
              <label className="block max-w-xs space-y-2"><span className="text-[10px] font-bold uppercase tracking-[.12em] text-white/35">Opening stock on hand</span><div className="flex h-12 items-center rounded-xl border border-white/10 bg-black/20 px-3"><input type="number" min="0" value={draft.onHand} onChange={(event) => setDraft((current) => ({ ...current, onHand: Math.max(0, Number(event.target.value)) }))} className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none" /><span className="text-xs text-white/30">{draft.unit}</span></div></label>
              <div className={`rounded-2xl border p-4 ${draft.onHand <= 10 ? "border-rose-400/20 bg-rose-500/[0.06]" : "border-emerald-300/12 bg-emerald-300/[0.035]"}`}><div className="flex items-center justify-between"><span className="text-xs text-white/45">Opening stock status</span><strong className={draft.onHand <= 10 ? "text-lg text-rose-200" : "text-lg text-emerald-200"}>{draft.onHand.toLocaleString("en-IN")} {draft.unit}</strong></div><div className="mt-2 flex items-center gap-2 text-[11px] text-white/35">{draft.onHand <= 10 ? <AlertTriangle className="h-3.5 w-3.5 animate-pulse text-rose-400" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300/70" />}{draft.onHand <= 10 ? "Low-stock alert will be active at 10 or below." : "Stock level is healthy."}</div></div>
              <label className="block space-y-2"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-white/35">Operations note</span><textarea value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} placeholder="Supplier, batch allocation, lead time or storage instruction" className="min-h-24 w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-emerald-300/50" /></label>
              {formError ? <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.07] px-4 py-3 text-sm text-rose-200">{formError}</div> : null}
              <div className="flex flex-col-reverse gap-3 border-t border-white/8 pt-5 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={() => setIsAdding(false)} className="h-11 rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5">Cancel</Button><Button type="button" onClick={confirmAddItem} className="h-11 rounded-xl bg-emerald-300 px-6 font-semibold text-[#082017] hover:bg-emerald-200"><Plus className="mr-2 h-4 w-4" /> Add to inventory</Button></div>
            </div>
          </div>
        </div>
      ) : null}

      {showCategoryManager ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCategoryManager(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="category-manager-title" className="w-full max-w-lg overflow-hidden rounded-3xl border border-emerald-300/15 bg-[#101713] shadow-[0_30px_100px_rgba(0,0,0,.7)]">
            <div className="flex items-start justify-between border-b border-white/8 p-5 sm:p-6"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-emerald-300/60">Inventory setup</p><h3 id="category-manager-title" className="mt-2 text-xl font-semibold text-white">Manage categories</h3><p className="mt-1 text-xs text-white/35">Create your own material groups and measurement type.</p></div><button type="button" onClick={() => setShowCategoryManager(false)} className="rounded-full border border-white/10 p-2 text-white/45 hover:bg-white/5 hover:text-white"><X className="h-4 w-4" /></button></div>
            <div className="space-y-5 p-5 sm:p-6">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-white/35">Create new category</p><div className="mt-3 grid gap-2 sm:grid-cols-[1fr_110px_auto]"><input autoFocus value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addCategory(); }} placeholder="e.g. Bottle" className="h-11 min-w-0 rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-emerald-300/40" /><select value={newCategoryUnit} onChange={(event) => setNewCategoryUnit(event.target.value as StockUnit)} className="h-11 rounded-xl border border-white/10 bg-[#111713] px-3 text-sm text-white outline-none"><option value="pcs">Pieces</option><option value="g">Grams</option></select><Button type="button" onClick={addCategory} className="h-11 rounded-xl bg-emerald-300 px-4 font-semibold text-[#092018] hover:bg-emerald-200"><Plus className="mr-1 h-4 w-4" /> Create</Button></div></div>
              <div><div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-white/35">Your categories</p><span className="text-[10px] text-white/25">{categories.length} total</span></div><div className="max-h-64 space-y-2 overflow-y-auto pr-1">{categories.map((category) => { const assignedCount = items.filter((item) => item.group === category.name).length; const tone = groupToneFor(category.name); return <div key={category.id} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-3"><div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${tone.icon}`}>{category.unit === "pcs" ? <Boxes className="h-4 w-4" /> : <FlaskConical className="h-4 w-4" />}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} /><p className="truncate text-sm font-medium text-white">{category.name}</p></div><p className="mt-0.5 text-[10px] text-white/30">{category.unit === "pcs" ? "Measured in pieces" : "Measured in grams"} • {assignedCount} item{assignedCount === 1 ? "" : "s"}</p></div><button type="button" onClick={() => deleteCategory(category)} className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${assignedCount ? "cursor-not-allowed border-white/5 text-white/15" : "border-rose-400/15 text-rose-300/65 hover:border-rose-400/35 hover:bg-rose-400/10 hover:text-rose-200"}`} aria-label={`Delete ${category.name}`} title={assignedCount ? "Move or delete assigned items first" : `Delete ${category.name}`}><Trash2 className="h-4 w-4" /></button></div>; })}</div></div>
              {categoryError ? <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.07] px-4 py-3 text-sm text-rose-200">{categoryError}</div> : null}
              <div className="flex justify-end border-t border-white/8 pt-4"><Button type="button" onClick={() => setShowCategoryManager(false)} className="h-11 rounded-xl bg-white px-5 font-semibold text-black hover:bg-white/90">Done</Button></div>
            </div>
          </div>
        </div>
      ) : null}

      {pendingDelete ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingDelete(null); }}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-stock-title" className="w-full max-w-md rounded-3xl border border-rose-300/15 bg-[#151311] p-6 shadow-[0_30px_100px_rgba(0,0,0,.65)] sm:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-300/15 bg-rose-400/10 text-rose-300"><Trash2 className="h-5 w-5" /></div>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[.2em] text-rose-300/65">Delete inventory record</p>
            <h3 id="delete-stock-title" className="mt-2 text-xl font-semibold text-white">Remove {pendingDelete.name}?</h3>
            <p className="mt-2 text-sm leading-6 text-white/40">This removes SKU <span className="font-mono text-white/65">{pendingDelete.sku}</span> from this planning view. Its quantities and notes will also be removed.</p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setPendingDelete(null)} className="h-11 rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5">Keep item</Button>
              <Button type="button" onClick={confirmDelete} className="h-11 rounded-xl bg-rose-500 px-5 font-semibold text-white hover:bg-rose-400"><Trash2 className="mr-2 h-4 w-4" /> Delete item</Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
