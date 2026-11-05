"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  Layers3,
  Plus,
  RefreshCw,
  Search,
  Tags,
} from "lucide-react";
import type { CategoryDefinition } from "@/lib/product-categories";
type Category = CategoryDefinition & {
  updatedAt: string;
  productCount: number;
  publicProductCount: number;
};
type Item = {
  id: string;
  name: string;
  gender: string;
  visibility: string;
  categoryId: string;
  categoryIds: string[];
};
const field =
  "w-full rounded-xl border border-white/10 bg-[#202024] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c9b3ff]/60";
const button =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2.5 text-sm transition hover:bg-white/5 disabled:opacity-40";
export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Item[]>([]);
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [gender, setGender] = useState("all");
  const [newName, setNewName] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(true);
  const [order, setOrder] = useState(200);
  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const current = categories.find((c) => c.id === selected);
  const initialIds = useMemo(
    () =>
      products.filter((p) => p.categoryIds.includes(selected)).map((p) => p.id),
    [products, selected],
  );
  const dirty =
    Boolean(current) &&
    (name !== current?.name ||
      description !== current?.description ||
      visible !== current?.visible ||
      order !== current?.sortOrder ||
      [...ids].sort().join(",") !== [...initialIds].sort().join(","));
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/categories", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load categories");
      setCategories(data.categories);
      setProducts(data.products);
      setSelected((previous) =>
        data.categories.some((c: Category) => c.id === previous)
          ? previous
          : data.categories[0]?.id || "",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!current) return;
    setName(current.name);
    setDescription(current.description);
    setVisible(current.visible);
    setOrder(current.sortOrder);
    setIds(initialIds);
  }, [current, initialIds]);
  const shown = categories.filter((c) =>
    `${c.name} ${c.id}`.toLowerCase().includes(query.toLowerCase()),
  );
  const shownProducts = products.filter(
    (p) =>
      (gender === "all" || p.gender === gender) &&
      `${p.name} ${p.id}`.toLowerCase().includes(productQuery.toLowerCase()),
  );
  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSelected(data.category.id);
      setNewName("");
      await load();
      setNotice("Category created. Choose products below and save.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!current) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: current.id,
          name,
          description,
          visible,
          sortOrder: order,
          productIds: ids,
          expectedUpdatedAt: current.updatedAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await load();
      setNotice(
        "Category and product assignments saved. Storefront filters have been refreshed.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  function choose(id: string) {
    if (dirty && !window.confirm("Discard unsaved category changes?")) return;
    setSelected(id);
    setProductQuery("");
    setNotice("");
  }
  function toggle(id: string) {
    setIds((old) =>
      old.includes(id) ? old.filter((value) => value !== id) : [...old, id],
    );
  }
  return (
    <div className="mx-auto max-w-7xl space-y-6 text-white">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.22em] text-[#c9b3ff]">
            Catalog / Organization
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Fragrance categories
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/45">
            One category list for your collection, shop filters and product
            editor.
          </p>
        </div>
        <div className="flex gap-2">
          <Link className={button} href="/admin/products">
            Products
            <ArrowUpRight size={15} />
          </Link>
          <button
            className={button}
            disabled={loading || saving}
            onClick={() => {
              if (
                !dirty ||
                window.confirm("Discard unsaved changes and refresh?")
              )
                void load();
            }}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </header>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-200"
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Categories", value: categories.length, icon: Layers3 },
          {
            label: "Shown in storefront",
            value: categories.filter(
              (c) => c.visible && c.publicProductCount > 0,
            ).length,
            icon: Eye,
          },
          {
            label: "Products organized",
            value: products.filter((p) => p.categoryIds.length).length,
            icon: Tags,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/[.08] bg-[#18181b] p-5"
          >
            <div className="flex items-center justify-between text-xs text-white/45">
              {label}
              <Icon size={17} className="text-[#c9b3ff]" />
            </div>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-4">
          <form
            onSubmit={create}
            className="space-y-3 rounded-2xl border border-[#c9b3ff]/20 bg-[#c9b3ff]/[.04] p-4"
          >
            <h2 className="flex items-center gap-2 text-sm font-medium">
              <Plus size={16} />
              New category
            </h2>
            <label className="block">
              <span className="sr-only">New category name</span>
              <input
                className={field}
                required
                maxLength={100}
                placeholder="e.g. Marine"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </label>
            <button
              disabled={saving || loading}
              className="w-full rounded-xl bg-[#c9b3ff] px-4 py-2.5 text-sm font-semibold text-[#17131f] disabled:opacity-40"
            >
              Create category
            </button>
          </form>
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#18181b]">
            <div className="p-4">
              <label className="relative block">
                <Search
                  size={15}
                  className="absolute left-3 top-3 text-white/30"
                />
                <input
                  aria-label="Search categories"
                  className={`${field} pl-9`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find a category"
                />
              </label>
            </div>
            <div className="max-h-[620px] overflow-y-auto">
              {shown.map((c) => (
                <button
                  key={c.id}
                  disabled={saving}
                  onClick={() => choose(c.id)}
                  className={`flex w-full items-center justify-between gap-3 border-t border-white/5 px-4 py-3.5 text-left transition hover:bg-white/5 ${selected === c.id ? "bg-[#c9b3ff]/10 ring-1 ring-inset ring-[#c9b3ff]/20" : ""}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="mt-1 text-xs text-white/35">
                      {c.productCount} products · {c.publicProductCount} public
                    </p>
                  </div>
                  {c.visible ? (
                    <Eye size={15} className="shrink-0 text-[#c9b3ff]" />
                  ) : (
                    <EyeOff size={15} className="shrink-0 text-white/25" />
                  )}
                </button>
              ))}
              {!shown.length && (
                <p className="p-5 text-sm text-white/35">
                  {loading ? "Loading categories…" : "No categories found."}
                </p>
              )}
            </div>
          </section>
        </aside>
        {current ? (
          <form onSubmit={save} className="min-w-0 space-y-5">
            <section className="space-y-5 rounded-2xl border border-white/10 bg-[#18181b] p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[.15em] text-[#c9b3ff]">
                    Category details
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {current.name}
                  </h2>
                </div>
                <Link
                  className={button}
                  target="_blank"
                  href={`/shop?filter=nature&value=${encodeURIComponent(current.id)}`}
                >
                  View collection
                  <ArrowUpRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_130px]">
                <label className="space-y-2 text-xs text-white/55">
                  <span>Display name</span>
                  <input
                    className={field}
                    required
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label className="space-y-2 text-xs text-white/55">
                  <span>Display order</span>
                  <input
                    className={field}
                    type="number"
                    min={0}
                    max={10000}
                    required
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                  />
                </label>
              </div>
              <label className="block space-y-2 text-xs text-white/55">
                <span>Short description</span>
                <textarea
                  className={`${field} min-h-20 resize-y`}
                  maxLength={500}
                  placeholder="Describe this scent family"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[.02] p-4">
                <span>
                  <span className="block text-sm font-medium">
                    Show in storefront filters
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-white/35">
                    Categories appear when they contain public products. Hiding
                    a category keeps its assignments.
                  </span>
                </span>
                <input
                  aria-label="Show in storefront filters"
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[#c9b3ff]"
                  checked={visible}
                  onChange={(e) => setVisible(e.target.checked)}
                />
              </label>
            </section>
            <section className="rounded-2xl border border-white/10 bg-[#18181b] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold">Products in this category</h2>
                  <p className="mt-1 text-xs leading-relaxed text-white/35">
                    A product can belong to several scent families.
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[#c9b3ff]/10 px-3 py-1 text-xs text-[#c9b3ff]">
                  {ids.length} selected
                </span>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_130px]">
                <input
                  aria-label="Search category products"
                  className={field}
                  placeholder="Search products"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                />
                <select
                  aria-label="Filter category products by gender"
                  className={field}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="all">All genders</option>
                  {["Men", "Women", "Unisex"].map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="my-3 flex gap-3 text-xs">
                <button
                  type="button"
                  className="text-[#c9b3ff]"
                  onClick={() =>
                    setIds((old) => [
                      ...new Set([...old, ...shownProducts.map((p) => p.id)]),
                    ])
                  }
                >
                  Select shown
                </button>
                <button
                  type="button"
                  className="text-white/40"
                  onClick={() =>
                    setIds((old) =>
                      old.filter(
                        (id) =>
                          !shownProducts.some(
                            (p) => p.id === id && p.categoryId !== current.id,
                          ),
                      ),
                    )
                  }
                >
                  Clear optional shown
                </button>
              </div>
              <div className="grid max-h-[480px] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                {shownProducts.map((p) => {
                  const primary = p.categoryId === current.id;
                  const checked = ids.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${checked ? "border-[#c9b3ff]/25 bg-[#c9b3ff]/[.05]" : "border-white/[.07] hover:border-white/20"}`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 shrink-0 accent-[#c9b3ff]"
                        checked={checked}
                        disabled={primary}
                        onChange={() => toggle(p.id)}
                      />
                      <span className="min-w-0">
                        <span className="block break-words text-sm text-white/80">
                          {p.name}
                        </span>
                        <span className="mt-1 block text-[10px] text-white/35">
                          {p.gender} ·{" "}
                          {p.visibility === "public"
                            ? "Public"
                            : "Direct link only"}
                          {primary ? " · Primary category" : ""}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-white/30">
                Primary categories are protected here. To move a product’s
                primary category, use its product editor.
              </p>
            </section>
            <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-[#202024]/95 p-4 shadow-xl backdrop-blur">
              <span className="text-xs text-white/40">
                {dirty ? "Unsaved changes" : "All changes saved"}
              </span>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-[#c9b3ff] px-5 py-2.5 text-sm font-semibold text-[#17131f] disabled:opacity-40"
                disabled={saving || loading || !dirty}
              >
                <Check size={16} />
                {saving ? "Saving…" : "Save category"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">
            {loading
              ? "Loading category details…"
              : "Create a category to organize your products."}
          </div>
        )}
      </div>
    </div>
  );
}
