"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Product } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertTriangle, Check, Clock3, ExternalLink, Eye, EyeOff, FlaskConical, MoreHorizontal, PackageX, Pencil, Plus, Sparkles, Star, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ProductFormSheet } from "./ProductFormSheet";

export function ProductsTable({
  initialProducts,
  initialKitOutOfStock,
}: {
  initialProducts: Product[];
  initialKitOutOfStock: boolean;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [kitOutOfStock, setKitOutOfStock] = useState(initialKitOutOfStock);
  const [kitSaving, setKitSaving] = useState(false);
  const router = useRouter();

  const getBadges = (product: Product) =>
    (product.badges ?? {}) as {
      bestSeller?: boolean;
      humeSpecial?: boolean;
      limitedStock?: boolean;
      soldOut?: boolean;
      comingSoon?: boolean;
      showInDiscoverySet?: boolean;
      recommendedSample?: boolean;
    };

  const openCreateForm = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) setEditingProduct(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      setProducts(products.filter((p) => p.id !== id));
      toast({ title: "Product deleted" });
      router.refresh();
    } catch {
      toast({ title: "Error deleting product", variant: "destructive" });
    }
  };

  const handleToggleBadge = async (
    product: Product,
    badge: "bestSeller" | "humeSpecial" | "limitedStock" | "soldOut" | "comingSoon" | "showInDiscoverySet" | "recommendedSample",
    enabled: boolean,
  ) => {
    const nextBadges = { ...getBadges(product), [badge]: enabled };

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badges: nextBadges }),
      });
      if (!res.ok) throw new Error("Failed to update product badge");

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, badges: nextBadges } : item,
        ),
      );
      toast({ title: "Product badge updated" });
      router.refresh();
    } catch {
      toast({ title: "Error updating badge", variant: "destructive" });
    }
  };

  const handleToggleVisibility = async (product: Product) => {
    const nextVisibility = product.visibility === "public" ? "seo_only" : "public";

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: nextVisibility }),
      });
      if (!res.ok) throw new Error("Failed to update product visibility");

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, visibility: nextVisibility } : item,
        ),
      );
      toast({
        title:
          nextVisibility === "public"
            ? "Product is visible on main site"
            : "Product is hidden for SEO/direct URL only",
      });
      router.refresh();
    } catch {
      toast({ title: "Error updating visibility", variant: "destructive" });
    }
  };

  const handleKitAvailabilityChange = async (outOfStock: boolean) => {
    const previous = kitOutOfStock;
    setKitOutOfStock(outOfStock);
    setKitSaving(true);

    try {
      const res = await fetch("/api/kit-availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outOfStock }),
      });
      if (!res.ok) throw new Error("Failed to update kit availability");

      toast({
        title: outOfStock ? "Kit marked out of stock" : "Kit marked available",
        description: outOfStock
          ? "Customers can still build the kit, but checkout will collect their details first."
          : "Kit checkout is live again.",
      });
      router.refresh();
    } catch {
      setKitOutOfStock(previous);
      toast({ title: "Error updating kit availability", variant: "destructive" });
    } finally {
      setKitSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <Switch
            checked={kitOutOfStock}
            disabled={kitSaving}
            onCheckedChange={handleKitAvailabilityChange}
            aria-label="Toggle kit out of stock"
          />
          <div>
            <p className="text-sm font-medium">
              Kit out of stock {kitOutOfStock ? "ON" : "OFF"}
            </p>
            <p className="text-xs text-muted-foreground">
              {kitOutOfStock
                ? "Collect kit checkout details, then show contact notice."
                : "Allow normal kit checkout."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.open("/kit-pack", "_blank")}
          className="rounded-xl"
        >
          15 ml kit
        </Button>
        <Button onClick={openCreateForm} className="rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 text-center">
          <FlaskConical className="h-8 w-8 text-white/20" />
          <p className="mt-4 text-sm font-medium text-white/60">No products found</p>
          <p className="mt-1 text-xs text-white/30">Add your first fragrance to begin building the catalogue.</p>
          <Button onClick={openCreateForm} className="mt-5 rounded-xl"><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {products.map((product) => {
            const badges = getBadges(product);
            const actionClass = "group/menu flex min-h-10 cursor-pointer items-center rounded-xl px-3 py-2 text-xs text-white/65 outline-none transition focus:bg-white/[0.07] focus:text-white";
            const activeIconClass = "ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#c5a9ff]/15 text-[#d8c8ff]";

            return (
              <article key={product.id} className="group overflow-hidden rounded-[24px] border border-white/[0.085] bg-[#18181b] shadow-[inset_0_1px_rgba(255,255,255,.035),0_16px_45px_rgba(0,0,0,.12)] transition duration-300 hover:-translate-y-1 hover:border-[#c5a9ff]/25 hover:shadow-[inset_0_1px_rgba(255,255,255,.05),0_24px_60px_rgba(0,0,0,.28)]">
                <div className="relative aspect-square overflow-hidden bg-[radial-gradient(circle_at_50%_25%,rgba(255,255,255,.08),transparent_38%),#111113]">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, (max-width: 1536px) 33vw, 25vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.035]"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-white/20">
                      <FlaskConical className="h-8 w-8" />
                      <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em]">No image</span>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/65" />

                  <div className="absolute left-3 top-3">
                    {product.visibility === "public" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-950/75 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-200 backdrop-blur-md"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,.8)]" /> Public</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/65 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/60 backdrop-blur-md"><EyeOff className="h-3 w-3" /> SEO only</span>
                    )}
                  </div>

                  <div className="absolute right-3 top-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-white/15 bg-black/55 text-white shadow-lg backdrop-blur-md hover:bg-white hover:text-black" aria-label={`Open actions for ${product.name}`}>
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={8} className="w-[286px] rounded-2xl border-white/10 bg-[#19191c]/98 p-2 text-white shadow-[0_24px_80px_rgba(0,0,0,.65)] backdrop-blur-xl">
                        <DropdownMenuLabel className="px-3 py-2.5">
                          <p className="truncate text-sm font-semibold text-white">{product.name}</p>
                          <p className="mt-1 truncate font-mono text-[9px] font-normal uppercase tracking-[0.12em] text-white/30">{product.id}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="mx-1 bg-white/[0.07]" />

                        <DropdownMenuLabel className="px-3 pb-1 pt-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white/25">Product</DropdownMenuLabel>
                        <DropdownMenuItem className={actionClass} onClick={() => openEditForm(product)}><Pencil className="mr-3 h-4 w-4 text-[#ccb7ff]" /> Edit product</DropdownMenuItem>
                        <DropdownMenuItem className={actionClass} onClick={() => window.open(`/product/${encodeURIComponent(product.id)}`, "_blank")}><ExternalLink className="mr-3 h-4 w-4 text-sky-300" /> View live page</DropdownMenuItem>
                        <DropdownMenuItem className={actionClass} onClick={() => handleToggleVisibility(product)}>
                          {product.visibility === "public" ? <EyeOff className="mr-3 h-4 w-4 text-white/45" /> : <Eye className="mr-3 h-4 w-4 text-emerald-300" />}
                          {product.visibility === "public" ? "Hide from main site" : "Show on main site"}
                          {product.visibility === "public" ? <span className={activeIconClass}><Check className="h-3 w-3" /></span> : null}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="mx-1 bg-white/[0.07]" />
                        <DropdownMenuLabel className="px-3 pb-1 pt-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white/25">Availability</DropdownMenuLabel>
                        <DropdownMenuItem className={actionClass} onClick={() => handleToggleBadge(product, "limitedStock", !badges.limitedStock)}><AlertTriangle className="mr-3 h-4 w-4 text-amber-300" /> {badges.limitedStock ? "Clear only 2 left" : "Mark only 2 left"}{badges.limitedStock ? <span className={activeIconClass}><Check className="h-3 w-3" /></span> : null}</DropdownMenuItem>
                        <DropdownMenuItem className={actionClass} onClick={() => handleToggleBadge(product, "comingSoon", !badges.comingSoon)}><Clock3 className="mr-3 h-4 w-4 text-sky-300" /> {badges.comingSoon ? "Remove coming soon" : "Add to coming soon"}{badges.comingSoon ? <span className={activeIconClass}><Check className="h-3 w-3" /></span> : null}</DropdownMenuItem>
                        <DropdownMenuItem className={actionClass} onClick={() => handleToggleBadge(product, "soldOut", !badges.soldOut)}><PackageX className="mr-3 h-4 w-4 text-rose-300" /> {badges.soldOut ? "Mark back in stock" : "Mark sold out"}{badges.soldOut ? <span className={activeIconClass}><Check className="h-3 w-3" /></span> : null}</DropdownMenuItem>

                        <DropdownMenuSeparator className="mx-1 bg-white/[0.07]" />
                        <DropdownMenuLabel className="px-3 pb-1 pt-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white/25">Merchandising</DropdownMenuLabel>
                        <DropdownMenuItem className={actionClass} onClick={() => handleToggleBadge(product, "bestSeller", !badges.bestSeller)}><Star className="mr-3 h-4 w-4 text-amber-200" /> {badges.bestSeller ? "Remove best seller" : "Mark best seller"}{badges.bestSeller ? <span className={activeIconClass}><Check className="h-3 w-3" /></span> : null}</DropdownMenuItem>
                        <DropdownMenuItem className={actionClass} onClick={() => handleToggleBadge(product, "humeSpecial", !badges.humeSpecial)}><Sparkles className="mr-3 h-4 w-4 text-emerald-200" /> {badges.humeSpecial ? "Remove HUME special" : "Mark HUME special"}{badges.humeSpecial ? <span className={activeIconClass}><Check className="h-3 w-3" /></span> : null}</DropdownMenuItem>
                        <DropdownMenuItem className={actionClass} onClick={() => handleToggleBadge(product, "showInDiscoverySet", !badges.showInDiscoverySet)}><FlaskConical className="mr-3 h-4 w-4 text-pink-200" /> {badges.showInDiscoverySet ? "Remove from Discovery Set" : "Add to Discovery Set"}{badges.showInDiscoverySet ? <span className={activeIconClass}><Check className="h-3 w-3" /></span> : null}</DropdownMenuItem>
                        <DropdownMenuItem className={actionClass} onClick={() => handleToggleBadge(product, "recommendedSample", !badges.recommendedSample)}><Sparkles className="mr-3 h-4 w-4 text-violet-200" /> {badges.recommendedSample ? "Remove from Recommended Kit" : "Add to Recommended Kit"}{badges.recommendedSample ? <span className={activeIconClass}><Check className="h-3 w-3" /></span> : null}</DropdownMenuItem>

                        <DropdownMenuSeparator className="mx-1 bg-white/[0.07]" />
                        <DropdownMenuItem className="flex min-h-10 cursor-pointer items-center rounded-xl px-3 py-2 text-xs text-rose-300 outline-none transition focus:bg-rose-400/10 focus:text-rose-200" onClick={() => handleDelete(product.id)}><Trash2 className="mr-3 h-4 w-4" /> Delete product</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {badges.soldOut ? <Badge className="border border-rose-300/20 bg-rose-950/75 text-rose-200 shadow-none backdrop-blur-md hover:bg-rose-950/75">Sold out</Badge> : null}
                      {badges.comingSoon ? <Badge className="border border-sky-300/20 bg-sky-950/75 text-sky-200 shadow-none backdrop-blur-md hover:bg-sky-950/75">Coming soon</Badge> : null}
                      {badges.limitedStock ? <Badge className="border border-amber-300/20 bg-amber-950/75 text-amber-200 shadow-none backdrop-blur-md hover:bg-amber-950/75">Only 2 left</Badge> : null}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-white">{product.name}</h3>
                      <p className="mt-1 line-clamp-1 text-xs text-white/38">Inspired by {product.inspirationBrand} {product.inspiration}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-[#dfd2ff]">₹{Number(product.price).toLocaleString("en-IN")}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5 text-[9px] font-semibold uppercase tracking-[0.1em]">
                    <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-white/45">{product.category}</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-white/45">{product.gender}</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-white/45">{product.size}</span>
                  </div>

                  <div className="mt-4 flex min-h-6 flex-wrap gap-1.5">
                    {badges.bestSeller ? <Badge className="border border-amber-300/15 bg-amber-300/[0.08] text-amber-100/75 shadow-none hover:bg-amber-300/[0.08]">Best seller</Badge> : null}
                    {badges.humeSpecial ? <Badge className="border border-emerald-300/15 bg-emerald-300/[0.08] text-emerald-100/75 shadow-none hover:bg-emerald-300/[0.08]">HUME special</Badge> : null}
                    {badges.showInDiscoverySet ? <Badge className="border border-pink-300/15 bg-pink-300/[0.08] text-pink-100/75 shadow-none hover:bg-pink-300/[0.08]">Discovery</Badge> : null}
                    {badges.recommendedSample ? <Badge className="border border-violet-300/15 bg-violet-300/[0.08] text-violet-100/75 shadow-none hover:bg-violet-300/[0.08]">Recommended</Badge> : null}
                    {!badges.bestSeller && !badges.humeSpecial && !badges.showInDiscoverySet && !badges.recommendedSample ? <span className="text-[10px] text-white/20">Standard catalogue product</span> : null}
                  </div>

                  <div className="mt-5 grid grid-cols-[1fr_auto] gap-2 border-t border-white/[0.065] pt-4">
                    <Button type="button" variant="outline" onClick={() => openEditForm(product)} className="h-10 rounded-xl border-white/10 bg-white/[0.035] text-xs text-white hover:bg-white hover:text-black"><Pencil className="mr-2 h-3.5 w-3.5" /> Edit product</Button>
                    <Button type="button" variant="outline" size="icon" onClick={() => window.open(`/product/${encodeURIComponent(product.id)}`, "_blank")} className="h-10 w-10 rounded-xl border-white/10 bg-white/[0.035] text-white hover:bg-white hover:text-black" aria-label={`View ${product.name} live`}><ExternalLink className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ProductFormSheet 
        open={isFormOpen} 
        onOpenChange={handleFormOpenChange}
        product={editingProduct}
        onSuccess={(savedProduct) => {
          setIsFormOpen(false);
          setEditingProduct(null);
          if (savedProduct) {
            setProducts((current) => {
              const exists = current.some((item) => item.id === savedProduct.id);
              return exists
                ? current.map((item) => (item.id === savedProduct.id ? savedProduct : item))
                : [savedProduct, ...current];
            });
          }
          router.refresh();
        }} 
      />
    </div>
  );
}
