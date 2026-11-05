"use client";
import Link from "next/link";
import { useState } from "react";
import type { CategoryDefinition } from "@/lib/product-categories";
export function ProductCategoryPicker({
  categories,
  primaryId,
  selectedIds,
  onChange,
  error,
}: {
  categories: CategoryDefinition[];
  primaryId: string;
  selectedIds: string[];
  onChange: (primaryId: string, ids: string[], label: string) => void;
  error: string | null;
}) {
  const [query, setQuery] = useState("");
  const selected = [...new Set([primaryId, ...selectedIds].filter(Boolean))];
  const primary = categories.find((c) => c.id === primaryId);
  const field =
    "w-full rounded-xl border border-white/10 bg-[#202024] px-3 py-2.5 text-xs text-white/80 outline-none focus:border-[#c9b3ff]/50";
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <p className="text-xs leading-relaxed text-white/40">
          Choose one primary scent family, then add any other families that
          describe this fragrance.
        </p>
        <Link
          href="/admin/categories"
          className="shrink-0 text-xs text-[#c9b3ff]"
          target="_blank"
        >
          Manage categories ↗
        </Link>
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-300">
          {error}
        </p>
      )}
      <label className="block space-y-2 text-xs text-white/60">
        <span>Primary category</span>
        <select
          required
          className={field}
          value={primaryId}
          onChange={(e) => {
            const c = categories.find((c) => c.id === e.target.value);
            onChange(
              e.target.value,
              [...new Set([...selected, e.target.value])],
              c?.name || "",
            );
          }}
        >
          <option value="">Choose a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.visible ? "" : " · hidden from filters"}
            </option>
          ))}
        </select>
      </label>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-white/60">
          <span>Additional categories</span>
          <span className="text-white/30">{selected.length} selected</span>
        </div>
        <input
          aria-label="Find product categories"
          className={field}
          placeholder="Find a scent family"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-white/[.07] p-3 sm:grid-cols-3">
          {categories
            .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
            .map((c) => (
              <label
                key={c.id}
                className="flex items-start gap-2 text-xs leading-relaxed text-white/60"
              >
                <input
                  type="checkbox"
                  className="mt-0.5 accent-[#c9b3ff]"
                  checked={selected.includes(c.id)}
                  disabled={c.id === primaryId}
                  onChange={() =>
                    onChange(
                      primaryId,
                      selected.includes(c.id)
                        ? selected.filter((id) => id !== c.id)
                        : [...selected, c.id],
                      primary?.name || "",
                    )
                  }
                />
                <span>
                  {c.name}
                  {c.id === primaryId ? (
                    <span className="ml-1 text-[9px] text-[#c9b3ff]">
                      primary
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
        </div>
      </div>
    </div>
  );
}
