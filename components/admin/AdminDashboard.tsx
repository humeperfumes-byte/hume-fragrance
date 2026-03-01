"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { PerfumeData } from "@/data/perfumes";
import type { BlogPost } from "@/data/blogPosts";
import { isVisibleNatureCategory } from "@/lib/nature-categories";

type ProductForm = {
  name: string;
  inspiration: string;
  inspirationBrand: string;
  woreBy: string;
  woreByImageUrl: string;
  category: string;
  categoryId: string;
  categoryIdsCsv: string;
  gender: "Men" | "Women" | "Unisex";
  imagesCsv: string;
  price: string;
  description: string;
  seoDescription: string;
  seoKeywordsCsv: string;
  notesTopCsv: string;
  notesHeartCsv: string;
  notesBaseCsv: string;
  duration: string;
  sillage: string;
  seasonCsv: string;
  occasionCsv: string;
  size: string;
};

type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywordsCsv: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  featured: boolean;
};

const initialProductForm: ProductForm = {
  name: "",
  inspiration: "",
  inspirationBrand: "",
  woreBy: "",
  woreByImageUrl: "https://placehold.co/600x600?text=Celeb",
  category: "",
  categoryId: "",
  categoryIdsCsv: "",
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
  seasonCsv: "",
  occasionCsv: "",
  size: "50ml",
};

const initialBlogForm: BlogForm = {
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
};

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminDashboard() {
  const [adminToken, setAdminToken] = useState("");
  const [products, setProducts] = useState<PerfumeData[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [productForm, setProductForm] = useState<ProductForm>(initialProductForm);
  const [blogForm, setBlogForm] = useState<BlogForm>(initialBlogForm);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem("admin_api_token");
    if (stored) setAdminToken(stored);
  }, []);

  const dbCategoryOptions = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((product) => {
      (product.dbCategoryTags ?? product.categoryTags ?? []).forEach((tag) => {
        if (!tag?.id) return;
        if (!isVisibleNatureCategory(tag.id) || !isVisibleNatureCategory(tag.label || tag.id)) return;
        map.set(tag.id, tag.label || tag.id);
      });
      (product.dbCategoryIds ?? product.categoryIds ?? []).forEach((id) => {
        if (!id || map.has(id)) return;
        if (!isVisibleNatureCategory(id)) return;
        map.set(
          id,
          id.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        );
      });
    });
    return Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [products]);

  useEffect(() => {
    window.localStorage.setItem("admin_api_token", adminToken);
  }, [adminToken]);

  async function loadAll() {
    const [productsRes, postsRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/blog"),
    ]);

    const [productsData, postsData] = await Promise.all([
      productsRes.json(),
      postsRes.json(),
    ]);

    setProducts(Array.isArray(productsData) ? productsData : []);
    setPosts(Array.isArray(postsData) ? postsData : []);
  }

  useEffect(() => {
    loadAll().catch((error) => {
      console.error(error);
      setStatus("Failed to load existing data.");
    });
  }, []);

  const authHeaders = useMemo(() => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (adminToken.trim()) {
      headers["x-admin-token"] = adminToken.trim();
    }
    return headers;
  }, [adminToken]);

  async function createProduct() {
    const payload = {
      id: `${slugify(productForm.name)}-${Date.now().toString(36)}`,
      name: productForm.name,
      inspiration: productForm.inspiration,
      inspirationBrand: productForm.inspirationBrand,
      woreBy: productForm.woreBy || null,
      woreByImageUrl:
        productForm.woreByImageUrl || "https://placehold.co/600x600?text=Celeb",
      category: productForm.category,
      categoryId: productForm.categoryId,
      categoryIds: splitCsv(productForm.categoryIdsCsv),
      gender: productForm.gender,
      images: splitCsv(productForm.imagesCsv),
      price: Number(productForm.price),
      priceCurrency: "INR" as const,
      description: productForm.description,
      seoDescription: productForm.seoDescription,
      seoKeywords: splitCsv(productForm.seoKeywordsCsv),
      notes: {
        top: splitCsv(productForm.notesTopCsv),
        heart: splitCsv(productForm.notesHeartCsv),
        base: splitCsv(productForm.notesBaseCsv),
      },
      longevity: {
        duration: productForm.duration,
        sillage: productForm.sillage,
        season: splitCsv(productForm.seasonCsv),
        occasion: splitCsv(productForm.occasionCsv),
      },
      size: productForm.size,
    };

    const response = await fetch("/api/products", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "Failed to create product");
    }
  }

  async function createBlogPost() {
    const payload = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: blogForm.title,
      slug: blogForm.slug || slugify(blogForm.title),
      excerpt: blogForm.excerpt,
      content: blogForm.content,
      seoTitle: blogForm.seoTitle,
      seoDescription: blogForm.seoDescription,
      seoKeywords: splitCsv(blogForm.seoKeywordsCsv),
      category: blogForm.category,
      author: blogForm.author,
      date: blogForm.date,
      readTime: blogForm.readTime,
      featured: blogForm.featured,
    };

    const response = await fetch("/api/blog", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "Failed to create blog post");
    }
  }

  async function deleteProduct(id: string) {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "Failed to delete product");
    }
  }

  async function deletePost(slug: string) {
    const response = await fetch(`/api/blog/${slug}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "Failed to delete blog post");
    }
  }

  async function onCreateProductSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      await createProduct();
      setStatus("Product created.");
      setProductForm(initialProductForm);
      await loadAll();
    } catch (error: any) {
      setStatus(error?.message || "Failed to create product.");
    } finally {
      setBusy(false);
    }
  }

  async function onCreatePostSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      await createBlogPost();
      setStatus("Blog post created.");
      setBlogForm(initialBlogForm);
      await loadAll();
    } catch (error: any) {
      setStatus(error?.message || "Failed to create blog post.");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteProduct(id: string) {
    if (!window.confirm("Delete this product?")) return;
    setBusy(true);
    setStatus("");
    try {
      await deleteProduct(id);
      setStatus("Product deleted.");
      await loadAll();
    } catch (error: any) {
      setStatus(error?.message || "Failed to delete product.");
    } finally {
      setBusy(false);
    }
  }

  async function onDeletePost(slug: string) {
    if (!window.confirm("Delete this blog post?")) return;
    setBusy(true);
    setStatus("");
    try {
      await deletePost(slug);
      setStatus("Blog post deleted.");
      await loadAll();
    } catch (error: any) {
      setStatus(error?.message || "Failed to delete blog post.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-luxury py-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="admin-token">Admin API Token</Label>
          <Input
            id="admin-token"
            type="password"
            placeholder="Set ADMIN_API_TOKEN on server, then paste token here"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            This token is sent only for create/update/delete API requests.
          </p>
          {status ? <p className="text-sm">{status}</p> : null}
        </CardContent>
      </Card>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="blogs">Blog Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Product</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onCreateProductSubmit} className="grid gap-3">
                <Input placeholder="Name" value={productForm.name} onChange={(e) => setProductForm((s) => ({ ...s, name: e.target.value }))} required />
                <Input placeholder="Inspiration" value={productForm.inspiration} onChange={(e) => setProductForm((s) => ({ ...s, inspiration: e.target.value }))} required />
                <Input placeholder="Inspiration Brand" value={productForm.inspirationBrand} onChange={(e) => setProductForm((s) => ({ ...s, inspirationBrand: e.target.value }))} required />
                <Input placeholder="Worn by (optional celeb name)" value={productForm.woreBy} onChange={(e) => setProductForm((s) => ({ ...s, woreBy: e.target.value }))} />
                <Input placeholder="Worn by image URL (Cloudinary)" value={productForm.woreByImageUrl} onChange={(e) => setProductForm((s) => ({ ...s, woreByImageUrl: e.target.value }))} required />
                <Input
                  list="admin-category-labels"
                  placeholder="Category (e.g., Fresh)"
                  value={productForm.category}
                  onChange={(e) => setProductForm((s) => ({ ...s, category: e.target.value }))}
                  required
                />
                <datalist id="admin-category-labels">
                  {dbCategoryOptions.map((item) => (
                    <option key={`label-${item.id}`} value={item.label} />
                  ))}
                </datalist>
                <Input
                  list="admin-category-ids"
                  placeholder="Category ID (e.g., fresh)"
                  value={productForm.categoryId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    const matched = dbCategoryOptions.find((item) => item.id === nextId);
                    setProductForm((s) => ({
                      ...s,
                      categoryId: nextId,
                      category: matched?.label || s.category,
                    }));
                  }}
                  required
                />
                <datalist id="admin-category-ids">
                  {dbCategoryOptions.map((item) => (
                    <option key={`id-${item.id}`} value={item.id} />
                  ))}
                </datalist>
                <Input
                  placeholder="Additional category IDs CSV (e.g., woody,smoky)"
                  value={productForm.categoryIdsCsv}
                  onChange={(e) => setProductForm((s) => ({ ...s, categoryIdsCsv: e.target.value }))}
                />
                <Input placeholder="Gender: Men, Women, Unisex" value={productForm.gender} onChange={(e) => setProductForm((s) => ({ ...s, gender: (e.target.value as ProductForm["gender"]) || "Unisex" }))} required />
                <Input placeholder="Price in INR (e.g., 1499)" value={productForm.price} onChange={(e) => setProductForm((s) => ({ ...s, price: e.target.value }))} required />
                <Input placeholder="Size (e.g., 50ml)" value={productForm.size} onChange={(e) => setProductForm((s) => ({ ...s, size: e.target.value }))} required />
                <Input placeholder="Images CSV (https://res.cloudinary.com/.../img1.jpg, https://res.cloudinary.com/.../img2.jpg)" value={productForm.imagesCsv} onChange={(e) => setProductForm((s) => ({ ...s, imagesCsv: e.target.value }))} required />
                <Input placeholder="SEO Keywords CSV" value={productForm.seoKeywordsCsv} onChange={(e) => setProductForm((s) => ({ ...s, seoKeywordsCsv: e.target.value }))} required />
                <Input placeholder="Top Notes CSV" value={productForm.notesTopCsv} onChange={(e) => setProductForm((s) => ({ ...s, notesTopCsv: e.target.value }))} required />
                <Input placeholder="Heart Notes CSV" value={productForm.notesHeartCsv} onChange={(e) => setProductForm((s) => ({ ...s, notesHeartCsv: e.target.value }))} required />
                <Input placeholder="Base Notes CSV" value={productForm.notesBaseCsv} onChange={(e) => setProductForm((s) => ({ ...s, notesBaseCsv: e.target.value }))} required />
                <Input placeholder="Longevity Duration (e.g., 8-10 hours)" value={productForm.duration} onChange={(e) => setProductForm((s) => ({ ...s, duration: e.target.value }))} required />
                <Input placeholder="Sillage" value={productForm.sillage} onChange={(e) => setProductForm((s) => ({ ...s, sillage: e.target.value }))} required />
                <Input placeholder="Season CSV" value={productForm.seasonCsv} onChange={(e) => setProductForm((s) => ({ ...s, seasonCsv: e.target.value }))} required />
                <Input placeholder="Occasion CSV" value={productForm.occasionCsv} onChange={(e) => setProductForm((s) => ({ ...s, occasionCsv: e.target.value }))} required />
                <Textarea placeholder="Description" value={productForm.description} onChange={(e) => setProductForm((s) => ({ ...s, description: e.target.value }))} required />
                <Textarea placeholder="SEO Description" value={productForm.seoDescription} onChange={(e) => setProductForm((s) => ({ ...s, seoDescription: e.target.value }))} required />
                <Button type="submit" disabled={busy}>Create Product</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Products ({products.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between border border-border p-3">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.id}</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => onDeleteProduct(product.id)} disabled={busy}>
                    Delete
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blogs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Blog Post</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onCreatePostSubmit} className="grid gap-3">
                <Input
                  placeholder="Title"
                  value={blogForm.title}
                  onChange={(e) =>
                    setBlogForm((s) => ({
                      ...s,
                      title: e.target.value,
                      slug: s.slug || slugify(e.target.value),
                    }))
                  }
                  required
                />
                <Input placeholder="Slug" value={blogForm.slug} onChange={(e) => setBlogForm((s) => ({ ...s, slug: slugify(e.target.value) }))} required />
                <Input placeholder="Category" value={blogForm.category} onChange={(e) => setBlogForm((s) => ({ ...s, category: e.target.value }))} required />
                <Input placeholder="Author" value={blogForm.author} onChange={(e) => setBlogForm((s) => ({ ...s, author: e.target.value }))} required />
                <Input type="date" value={blogForm.date} onChange={(e) => setBlogForm((s) => ({ ...s, date: e.target.value }))} required />
                <Input placeholder="Read Time" value={blogForm.readTime} onChange={(e) => setBlogForm((s) => ({ ...s, readTime: e.target.value }))} required />
                <Input placeholder="SEO Title" value={blogForm.seoTitle} onChange={(e) => setBlogForm((s) => ({ ...s, seoTitle: e.target.value }))} required />
                <Input placeholder="SEO Keywords CSV" value={blogForm.seoKeywordsCsv} onChange={(e) => setBlogForm((s) => ({ ...s, seoKeywordsCsv: e.target.value }))} required />
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={blogForm.featured}
                    onCheckedChange={(checked) => setBlogForm((s) => ({ ...s, featured: checked }))}
                  />
                  <Label>Featured</Label>
                </div>
                <Textarea placeholder="Excerpt" value={blogForm.excerpt} onChange={(e) => setBlogForm((s) => ({ ...s, excerpt: e.target.value }))} required />
                <Textarea placeholder="SEO Description" value={blogForm.seoDescription} onChange={(e) => setBlogForm((s) => ({ ...s, seoDescription: e.target.value }))} required />
                <Textarea placeholder="Content (markdown/plain text)" className="min-h-[180px]" value={blogForm.content} onChange={(e) => setBlogForm((s) => ({ ...s, content: e.target.value }))} required />
                <Button type="submit" disabled={busy}>Create Blog Post</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Blog Posts ({posts.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {posts.map((post) => (
                <div key={post.slug} className="flex items-center justify-between border border-border p-3">
                  <div>
                    <p className="font-medium">{post.title}</p>
                    <p className="text-sm text-muted-foreground">{post.slug}</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => onDeletePost(post.slug)} disabled={busy}>
                    Delete
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
