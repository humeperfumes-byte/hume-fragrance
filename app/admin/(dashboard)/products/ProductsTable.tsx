"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/db/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";
import { ProductFormSheet } from "./ProductFormSheet";

export function ProductsTable({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      setProducts(products.filter(p => p.id !== id));
      toast({ title: "Product deleted" });
      router.refresh();
    } catch (err) {
      toast({ title: "Error deleting product", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsFormOpen(true)} className="rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
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
                products.map((product) => (
                  <TableRow key={product.id} className="border-border/50 hover:bg-secondary/10 transition-colors">
                    <TableCell>
                      <div className="h-12 w-12 rounded-lg bg-secondary/50 overflow-hidden border border-border/50">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
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
                      {product.visibility === "public" 
                        ? <Badge className="bg-emerald-500/10 text-emerald-600 border-none shadow-none hover:bg-emerald-500/20">Public</Badge>
                        : <Badge variant="secondary" className="border-none shadow-none">Hidden (SEO)</Badge>
                      }
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
                          <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
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
