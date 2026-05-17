"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

type BlogFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function BlogFormSheet({ open, onOpenChange, onSuccess }: BlogFormSheetProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywordsCsv: "",
    category: "Fragrance Guides",
    author: "HUME Editorial",
    date: new Date().toISOString().slice(0, 10),
    readTime: "5 min read",
    featured: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt,
      content: form.content,
      seoTitle: form.seoTitle || form.title,
      seoDescription: form.seoDescription || form.excerpt,
      seoKeywords: form.seoKeywordsCsv.split(",").map(s => s.trim()).filter(Boolean),
      category: form.category,
      author: form.author,
      date: form.date,
      readTime: form.readTime,
      featured: form.featured,
    };

    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to create");
      
      toast({ title: "Article published successfully!" });
      onSuccess();
      // Reset main fields
      setForm({ ...form, title: "", slug: "", excerpt: "", content: "", featured: false }); 
    } catch {
      toast({ title: "Error creating article", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-3xl w-full overflow-y-auto p-0 flex flex-col h-full border-l border-border/50 font-sans">
        <div className="p-6 border-b border-border/50 bg-secondary/10">
          <SheetTitle className="text-xl font-semibold">New Editorial Article</SheetTitle>
          <SheetDescription>Write and publish content to the HUME blog.</SheetDescription>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="flex-1 p-4 sm:p-6">
            <Tabs defaultValue="editor" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl h-auto p-1 bg-secondary/30 mb-6">
                <TabsTrigger value="editor" className="rounded-lg text-xs">Editor</TabsTrigger>
                <TabsTrigger value="seo" className="rounded-lg text-xs">SEO & Metadata</TabsTrigger>
              </TabsList>
              
              <TabsContent value="editor" className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Article Title</Label>
                  <Input id="title" value={form.title} onChange={handleChange} className="rounded-xl text-lg h-12" required />
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="slug">Custom URL Slug (Optional)</Label>
                    <Input id="slug" placeholder="leave-blank-to-auto-generate" value={form.slug} onChange={handleChange} className="rounded-xl text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" value={form.category} onChange={handleChange} className="rounded-xl text-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Short Excerpt</Label>
                  <Textarea id="excerpt" value={form.excerpt} onChange={handleChange} className="rounded-xl min-h-[80px] text-sm" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Full Markdown Content</Label>
                  <Textarea id="content" value={form.content} onChange={handleChange} className="rounded-xl min-h-[350px] font-mono text-sm leading-relaxed" required />
                  <p className="text-xs text-muted-foreground mt-1">Use Markdown for formatting: **bold**, ## Headings, etc.</p>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="author">Author Name</Label>
                    <Input id="author" value={form.author} onChange={handleChange} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Publish Date</Label>
                    <Input id="date" type="date" value={form.date} onChange={handleChange} className="rounded-xl" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="readTime">Estimated Read Time</Label>
                    <Input id="readTime" value={form.readTime} onChange={handleChange} className="rounded-xl" />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch 
                      id="featured" 
                      checked={form.featured} 
                      onCheckedChange={(checked) => setForm({ ...form, featured: checked })} 
                    />
                    <Label htmlFor="featured" className="cursor-pointer">Feature this article on the blog homepage</Label>
                  </div>
                </div>

                <div className="space-y-2 border-t border-border/50 pt-5 mt-5">
                  <Label htmlFor="seoTitle">SEO Title Override</Label>
                  <Input id="seoTitle" placeholder="Defaults to Article Title" value={form.seoTitle} onChange={handleChange} className="rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoDescription">Meta Description</Label>
                  <Textarea id="seoDescription" placeholder="Defaults to Excerpt" value={form.seoDescription} onChange={handleChange} className="rounded-xl" />
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
              {loading ? "Publishing..." : "Publish Article"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
