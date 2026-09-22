"use client";

import { useState, useMemo, useEffect } from "react";
import type { Product } from "@/db/schema";
import { OCCASIONS_LIST, getOccasionIcon } from "@/data/occasions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Check, Loader2, CheckSquare, Square } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface OccasionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: Product[];
  onProductsUpdated: (updatedProducts: Product[]) => void;
}

export function OccasionManagerModal({
  isOpen,
  onClose,
  allProducts,
  onProductsUpdated,
}: OccasionManagerModalProps) {
  const [activeSlug, setActiveSlug] = useState<string>("date-night");
  const [genderFilter, setGenderFilter] = useState<"all" | "men" | "women">("all");
  const [showAllCatalog, setShowAllCatalog] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  // Map of selected perfume IDs per occasion slug
  const [selectedPerfumeIds, setSelectedPerfumeIds] = useState<Set<string>>(new Set());

  // Initialize selected perfumes whenever active occasion, gender scope or products change
  useEffect(() => {
    if (!isOpen) return;

    const matchedIds = new Set<string>();
    const baseSlug = activeSlug.toLowerCase();
    const targetScopedKey = genderFilter === "all" ? baseSlug : `${baseSlug}:${genderFilter}`;

    allProducts.forEach((product) => {
      const occasions = (product.longevity?.occasion || []).map((o) =>
        o.trim().toLowerCase(),
      );
      if (
        occasions.includes(targetScopedKey) ||
        (genderFilter !== "all" && occasions.includes(baseSlug))
      ) {
        matchedIds.add(product.id);
      }
    });

    setSelectedPerfumeIds(matchedIds);
  }, [activeSlug, genderFilter, allProducts, isOpen]);

  const activeOccasionConfig = useMemo(() => {
    return (
      OCCASIONS_LIST.find((o) => o.slug === activeSlug) || OCCASIONS_LIST[0]
    );
  }, [activeSlug]);

  // Filter visible products by gender and search query
  const visibleProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allProducts.filter((p) => {
      // Gender filter (only filter if showAllCatalog is unchecked)
      if (!showAllCatalog) {
        if (genderFilter === "men" && p.gender.toLowerCase() === "women") return false;
        if (genderFilter === "women" && p.gender.toLowerCase() === "men") return false;
      }

      // Search filter
      if (query) {
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesInspiration = p.inspiration.toLowerCase().includes(query);
        const matchesBrand = (p.inspirationBrand || "").toLowerCase().includes(query);
        const matchesCategory = (p.category || "").toLowerCase().includes(query);
        return matchesName || matchesInspiration || matchesBrand || matchesCategory;
      }

      return true;
    });
  }, [allProducts, genderFilter, showAllCatalog, searchQuery]);

  const togglePerfume = (id: string, checked: boolean) => {
    setSelectedPerfumeIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAllVisible = () => {
    setSelectedPerfumeIds((prev) => {
      const next = new Set(prev);
      visibleProducts.forEach((p) => next.add(p.id));
      return next;
    });
  };

  const handleDeselectAllVisible = () => {
    setSelectedPerfumeIds((prev) => {
      const next = new Set(prev);
      visibleProducts.forEach((p) => next.delete(p.id));
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/occasions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasionSlug: activeSlug,
          genderScope: genderFilter,
          perfumeIds: Array.from(selectedPerfumeIds),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update occasion");
      }

      const data = await response.json();

      if (data.products) {
        onProductsUpdated(data.products);
      }

      toast({
        title: "Occasion Catalog Saved",
        description: `Successfully updated perfume assignments for ${activeOccasionConfig.occasionTitle} (${genderFilter.toUpperCase()}).`,
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error Saving Occasion",
        description: error.message || "An error occurred while saving.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col bg-[#141417] text-white border-white/10 p-0 overflow-hidden sm:rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-5 pb-3 border-b border-white/10 bg-[#1a1a1e]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <DialogTitle className="text-xl font-serif text-white">
              Occasions Catalog Manager
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-white/60 mt-1">
            Select an occasion category, choose gender view, and tickmark all perfumes to assign them.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Step 1: Select Occasion Category */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">
              1. Select Occasion Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {OCCASIONS_LIST.map((occ) => {
                const Icon = getOccasionIcon(occ.iconName);
                const isActive = activeSlug === occ.slug;

                return (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => setActiveSlug(occ.slug)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center ${
                      isActive
                        ? "border-amber-400 bg-amber-500/20 text-white font-bold shadow-md shadow-amber-500/10 scale-[1.02]"
                        : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/30 hover:bg-white/[0.07]"
                    }`}
                  >
                    <Icon className={`h-4 w-4 mb-1 ${isActive ? "text-amber-300" : "text-white/50"}`} />
                    <span className="text-xs line-clamp-1">{occ.shortTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Filter by Gender & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/10">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white/70 uppercase tracking-wider shrink-0">
                  Gender Scope:
                </span>
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
                  <button
                    type="button"
                    onClick={() => setGenderFilter("all")}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                      genderFilter === "all"
                        ? "bg-amber-400 text-black font-bold"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    ALL
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenderFilter("men")}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                      genderFilter === "men"
                        ? "bg-amber-400 text-black font-bold"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    MEN
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenderFilter("women")}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                      genderFilter === "women"
                        ? "bg-amber-400 text-black font-bold"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    WOMEN
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-amber-300 font-medium bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20 hover:bg-amber-500/20 transition">
                <Checkbox
                  checked={showAllCatalog}
                  onCheckedChange={(c) => setShowAllCatalog(!!c)}
                  className="data-[state=checked]:bg-amber-400 data-[state=checked]:text-black border-amber-400/50 h-3.5 w-3.5"
                />
                <span>Show All Catalog Perfumes (Includes Fresh & Unisex Scents)</span>
              </label>
            </div>

            {/* Search filter */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search perfumes..."
                className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-white/10 bg-black/40 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Quick Actions & Count */}
          <div className="flex items-center justify-between text-xs text-white/60">
            <div>
              Showing <span className="font-bold text-white">{visibleProducts.length}</span> perfumes |{" "}
              <span className="text-amber-300 font-semibold">{selectedPerfumeIds.size} selected</span> for {activeOccasionConfig.occasionTitle}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllVisible}
                className="text-[11px] text-amber-300 hover:underline flex items-center gap-1 font-medium"
              >
                <CheckSquare className="h-3 w-3" /> Tick All Visible
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={handleDeselectAllVisible}
                className="text-[11px] text-white/50 hover:underline flex items-center gap-1 font-medium"
              >
                <Square className="h-3 w-3" /> Untick All Visible
              </button>
            </div>
          </div>

          {/* Perfumes Tickmark List */}
          <div className="border border-white/10 rounded-xl overflow-hidden bg-black/30 divide-y divide-white/5 max-h-[320px] overflow-y-auto">
            {visibleProducts.length > 0 ? (
              visibleProducts.map((product) => {
                const isChecked = selectedPerfumeIds.has(product.id);
                const assignedOccasions = product.longevity?.occasion || [];

                return (
                  <div
                    key={product.id}
                    onClick={() => togglePerfume(product.id, !isChecked)}
                    className={`flex items-center justify-between p-3 transition-colors cursor-pointer ${
                      isChecked
                        ? "bg-amber-500/10 hover:bg-amber-500/15"
                        : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(c) => togglePerfume(product.id, !!c)}
                        className="data-[state=checked]:bg-amber-400 data-[state=checked]:text-black border-white/30 h-5 w-5 rounded"
                      />

                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                        <img
                          src={product.images[0] || "/images/perfume-1.jpg"}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            {product.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 px-1.5 border-white/10 bg-white/5 text-white/70"
                          >
                            {product.gender}
                          </Badge>
                        </div>
                        <p className="text-xs text-white/50">
                          inspired by {product.inspiration} ({product.inspirationBrand})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      {assignedOccasions.length > 0 && (
                        <div className="hidden md:flex flex-wrap gap-1 max-w-[180px] justify-end">
                          {assignedOccasions.slice(0, 2).map((occ) => (
                            <span
                              key={occ}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 capitalize"
                            >
                              {occ.replace("-", " ")}
                            </span>
                          ))}
                          {assignedOccasions.length > 2 && (
                            <span className="text-[9px] px-1 py-0.5 text-white/40">
                              +{assignedOccasions.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                      <span className="text-xs font-bold text-amber-300">
                        ₹{product.price}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-white/50">
                No perfumes found matching your filter criteria.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-white/10 bg-[#1a1a1e] flex flex-row items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-white/70 hover:text-white text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-xl px-5"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check className="mr-1.5 h-4 w-4" /> Save {activeOccasionConfig.shortTitle} Perfumes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
