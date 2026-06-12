"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Product } from "@/db/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";
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
    };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      setProducts(products.filter(p => p.id !== id));
      toast({ title: "Product deleted" });
      router.refresh();
    } catch {
      toast({ title: "Error deleting product", variant: "destructive" });
    }
  };

  const handleToggleBadge = async (
    product: Product,
    badge: "bestSeller" | "humeSpecial" | "limitedStock" | "soldOut" | "comingSoon",
    enabled: boolean,
  ) => {
    const nextBadges = { ...getBadges(product), [badge]: enabled };

    try {
      const res = await fetch(`/api/products/${product.id}`, {
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
      const res = await fetch(`/api/products/${product.id}`, {
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
        <Button onClick={() => setIsFormOpen(true)} className="rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/20">
              <TableRow className="border-border/50">
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[80px]">Image</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Product</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Category</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Price</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-center">Status</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No products found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const badges = getBadges(product);
                  return (
                  <TableRow key={product.id} className="border-border/50 hover:bg-secondary/10 transition-colors">
                    <TableCell>
                      <div className="h-12 w-12 rounded-lg bg-secondary/50 overflow-hidden border border-border/50">
                        {product.images && product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={64}
                            height={64}
                            sizes="48px"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">No img</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{product.name}</span>
                        <span className="text-xs text-muted-foreground">Inspired by: {product.inspirationBrand} {product.inspiration}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{product.category}</TableCell>
                    <TableCell className="text-right font-medium">{formatINR(Number(product.price))}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {product.visibility === "public" 
                          ? <Badge className="bg-emerald-500/10 text-emerald-600 border-none shadow-none hover:bg-emerald-500/20">Public</Badge>
                          : <Badge variant="secondary" className="border-none shadow-none">Hidden (SEO)</Badge>
                        }
                        {badges.bestSeller ? <Badge className="border-none bg-black text-white shadow-none">Best</Badge> : null}
                        {badges.humeSpecial ? <Badge className="border-none bg-emerald-500/10 text-emerald-600 shadow-none">Special</Badge> : null}
                        {badges.comingSoon ? <Badge className="border-none bg-sky-500/15 text-sky-700 shadow-none">Coming soon</Badge> : null}
                        {badges.limitedStock ? <Badge className="border-none bg-amber-500/15 text-amber-700 shadow-none">Low stock</Badge> : null}
                        {badges.soldOut ? <Badge className="border-none bg-red-500/15 text-red-600 shadow-none">Sold out</Badge> : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => window.open(`/product/${product.id}`, '_blank')}>
                            View Live
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleToggleVisibility(product)}
                          >
                            {product.visibility === "public"
                              ? "Hide from main site"
                              : "Show in main site"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleToggleBadge(product, "limitedStock", !badges.limitedStock)}
                          >
                            {badges.limitedStock ? "Clear low stock" : "Mark low stock"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleToggleBadge(product, "comingSoon", !badges.comingSoon)}
                          >
                            {badges.comingSoon ? "Remove coming soon" : "Add to coming soon"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleToggleBadge(product, "soldOut", !badges.soldOut)}
                          >
                            {badges.soldOut ? "Mark in stock" : "Mark sold out"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleToggleBadge(product, "bestSeller", !badges.bestSeller)}
                          >
                            {badges.bestSeller ? "Remove best seller" : "Mark best seller"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleToggleBadge(product, "humeSpecial", !badges.humeSpecial)}
                          >
                            {badges.humeSpecial ? "Remove HUME special" : "Mark HUME special"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ProductFormSheet 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSuccess={() => {
          setIsFormOpen(false);
          router.refresh();
        }} 
      />
    </div>
  );
}
