"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

type ProductFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function ProductFormSheet({ open, onOpenChange, onSuccess }: ProductFormSheetProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    inspiration: "",
    inspirationBrand: "",
    visibility: "public",
    category: "",
    categoryId: "",
    gender: "Unisex",
    imagesCsv: "",
    price: "",
    description: "",
    seoDescription: "",
    seoKeywordsCsv: "",
    notesTopCsv: "",
    notesHeartCsv: "",
    notesBaseCsv: "",
    duration: "",
    sillage: "",
    size: "50ml",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      id: `${slugify(form.name)}-${Date.now().toString(36)}`,
      name: form.name,
      inspiration: form.inspiration,
      inspirationBrand: form.inspirationBrand,
      visibility: form.visibility,
      woreBy: null,
      woreByImageUrl: "https://placehold.co/600x600?text=Celeb",
      category: form.category,
      categoryId: form.categoryId || slugify(form.category),
      categoryIds: [],
      gender: form.gender,
      images: form.imagesCsv.split(",").map(s => s.trim()).filter(Boolean),
      price: Number(form.price),
      priceCurrency: "INR",
      description: form.description,
      seoDescription: form.seoDescription,
      seoKeywords: form.seoKeywordsCsv.split(",").map(s => s.trim()).filter(Boolean),
      notes: {
        top: form.notesTopCsv.split(",").map(s => s.trim()).filter(Boolean),
        heart: form.notesHeartCsv.split(",").map(s => s.trim()).filter(Boolean),
        base: form.notesBaseCsv.split(",").map(s => s.trim()).filter(Boolean),
      },
      longevity: {
        duration: form.duration,
        sillage: form.sillage,
        season: [],
        occasion: [],
      },
      size: form.size,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to create");
      
      toast({ title: "Product created successfully!" });
      onSuccess();
      setForm({ ...form, name: "", inspiration: "", price: "", imagesCsv: "", description: "" }); // Reset some fields
    } catch {
      toast({ title: "Error creating product", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full overflow-y-auto p-0 flex flex-col h-full border-l border-border/50 font-sans">
        <div className="p-6 border-b border-border/50 bg-secondary/10">
          <SheetTitle className="text-xl font-semibold">New Fragrance</SheetTitle>
          <SheetDescription>Add a new product to your catalog.</SheetDescription>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="flex-1 p-4 sm:p-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl h-auto p-1 bg-secondary/30 mb-6 sm:grid-cols-4">
                <TabsTrigger value="basic" className="rounded-lg text-xs">Basic</TabsTrigger>
                <TabsTrigger value="profile" className="rounded-lg text-xs">Profile</TabsTrigger>
                <TabsTrigger value="media" className="rounded-lg text-xs">Media</TabsTrigger>
                <TabsTrigger value="seo" className="rounded-lg text-xs">SEO</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" value={form.name} onChange={handleChange} className="rounded-xl" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (INR)</Label>
                    <Input id="price" type="number" value={form.price} onChange={handleChange} className="rounded-xl" required />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="inspirationBrand">Inspiration Brand</Label>
                    <Input id="inspirationBrand" value={form.inspirationBrand} onChange={handleChange} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inspiration">Inspiration Name</Label>
                    <Input id="inspiration" value={form.inspiration} onChange={handleChange} className="rounded-xl" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" value={form.category} onChange={handleChange} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visibility">Visibility</Label>
                    <select id="visibility" value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })} className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      <option value="public">Public</option>
                      <option value="seo_only">Hidden (SEO Only)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea id="description" value={form.description} onChange={handleChange} className="rounded-xl min-h-[120px]" />
                </div>
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notesTopCsv">Top Notes (comma separated)</Label>
                  <Input id="notesTopCsv" value={form.notesTopCsv} onChange={handleChange} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notesHeartCsv">Heart Notes (comma separated)</Label>
                  <Input id="notesHeartCsv" value={form.notesHeartCsv} onChange={handleChange} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notesBaseCsv">Base Notes (comma separated)</Label>
                  <Input id="notesBaseCsv" value={form.notesBaseCsv} onChange={handleChange} className="rounded-xl" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Longevity / Duration</Label>
                    <Input id="duration" placeholder="e.g. 8-10 Hours" value={form.duration} onChange={handleChange} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sillage">Sillage</Label>
                    <Input id="sillage" placeholder="e.g. Strong" value={form.sillage} onChange={handleChange} className="rounded-xl" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imagesCsv">Image URLs (comma separated)</Label>
                  <Textarea id="imagesCsv" placeholder="https://..." value={form.imagesCsv} onChange={handleChange} className="rounded-xl min-h-[100px]" />
                  <p className="text-xs text-muted-foreground">The first image will be the primary thumbnail.</p>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">Meta Description</Label>
                  <Textarea id="seoDescription" value={form.seoDescription} onChange={handleChange} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoKeywordsCsv">Keywords (comma separated)</Label>
                  <Input id="seoKeywordsCsv" value={form.seoKeywordsCsv} onChange={handleChange} className="rounded-xl" />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="p-6 border-t border-border/50 bg-background flex justify-end gap-3 mt-auto">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={loading} className="rounded-xl">
              {loading ? "Saving..." : "Publish Product"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
