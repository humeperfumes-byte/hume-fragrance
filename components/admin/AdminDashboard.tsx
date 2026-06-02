"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { formatINR } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { displayPhoneNumber } from "@/lib/phone";

type ProductForm = {
  name: string;
  inspiration: string;
  inspirationBrand: string;
  visibility: "public" | "seo_only";
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

type CheckoutDraftRecord = {
  id: string;
  sessionId: string;
  status: string;
  path: string | null;
  acquisitionSource: string | null;
  acquisitionCategory: string | null;
  acquisitionReferrerHost: string | null;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  notes: string | null;
  lastEditedField: string | null;
  subtotal: string | null;
  shippingFee: string | null;
  grandTotal: string | null;
  cartSnapshot: Array<{
    id: string;
    name: string;
    inspiration?: string;
    size?: string;
    quantity: number;
    price: number;
    isGift?: boolean;
  }>;
  country: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
  whatsappInitiatedAt: string | null;
};

type DashboardAnalytics = {
  ok: boolean;
  windowHours: number;
  overview: {
    uniqueViewers: number;
    uniqueCartVisitors: number;
    totalPageViews: number;
    totalCartOpens: number;
    totalAddToCart: number;
    totalQuantityUpdates: number;
    totalRemoveFromCart: number;
    activeDrafts: number;
    whatsappInitiatedDrafts: number;
    abandonedDraftValue: number;
  };
  productPerformance: Array<{
    productId: string;
    name: string;
    clicks: number;
    addToCart: number;
    lastInteractionAt: string;
  }>;
  sourceBreakdown: Array<{
    source: string;
    category: string;
    count: number;
  }>;
  highlightedSources: Array<{
    source: string;
    category: string;
    count: number;
  }>;
  topViewedPages: Array<{
    path: string;
    views: number;
  }>;
};

const initialProductForm: ProductForm = {
  name: "",
  inspiration: "",
  inspirationBrand: "",
  visibility: "public",
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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Request failed.";
}

function getDraftValue(draft: CheckoutDraftRecord): number {
  return Number.parseFloat(String(draft.grandTotal ?? "0") || "0");
}

function scoreCheckoutDraft(draft: CheckoutDraftRecord): number {
  let score = 0;
  const value = getDraftValue(draft);

  if (value >= 2500) score += 40;
  else if (value >= 1500) score += 30;
  else if (value >= 1000) score += 20;
  else if (value >= 500) score += 10;

  if (draft.phone) score += 25;
  if (draft.fullName) score += 10;
  if (draft.email) score += 5;
  if (draft.city && draft.state) score += 10;
  if (draft.addressLine1) score += 10;
  if (draft.pincode) score += 5;
  if ((draft.cartSnapshot?.length || 0) >= 2) score += 5;
  if (draft.status === "complete") score += 10;
  if (draft.status === "whatsapp_initiated") score -= 20;

  const hoursSinceUpdate = (Date.now() - new Date(draft.updatedAt).getTime()) / (1000 * 60 * 60);
  if (hoursSinceUpdate <= 1) score += 15;
  else if (hoursSinceUpdate <= 24) score += 8;
  else if (hoursSinceUpdate <= 72) score += 3;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getLeadTemperature(score: number): "Hot" | "Warm" | "Cold" {
  if (score >= 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
}

function buildRecoveryMessage(draft: CheckoutDraftRecord): string {
  const cartSummary = (draft.cartSnapshot || [])
    .map((item) => `${item.name} x${item.quantity}`)
    .join(", ");
  const name = draft.fullName?.trim() || "there";
  const amount = getDraftValue(draft);

  return [
    `Hi ${name},`,
    "",
    "Your HUME order is still saved with us.",
    cartSummary ? `You were checking out: ${cartSummary}.` : null,
    amount > 0 ? `Order value: ${formatINR(amount)}.` : null,
    "If you'd like, we can help you complete it right away on WhatsApp.",
  ]
    .filter(Boolean)
    .join("\n");
}

function normalizeWhatsAppNumber(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export default function AdminDashboard() {
  const [adminToken, setAdminToken] = useState("");
  const [products, setProducts] = useState<PerfumeData[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [checkoutDrafts, setCheckoutDrafts] = useState<CheckoutDraftRecord[]>([]);
  const [dashboardAnalytics, setDashboardAnalytics] = useState<DashboardAnalytics | null>(null);
  const [timeWindowHours, setTimeWindowHours] = useState("24");
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

  const loadDashboardAnalytics = useCallback(async () => {
    if (!adminToken.trim()) {
      setDashboardAnalytics(null);
      return;
    }

    const url = new URL("/api/admin/dashboard", window.location.origin);
    url.searchParams.set("hours", timeWindowHours);

    const responseWithWindow = await fetch(url.toString(), {
      headers: {
        "x-admin-token": adminToken.trim(),
      },
      cache: "no-store",
    });

    if (!responseWithWindow.ok) {
      const data = await responseWithWindow.json().catch(() => null);
      throw new Error(data?.error || "Failed to load dashboard analytics");
    }

    const data = await responseWithWindow.json();
    setDashboardAnalytics(data);
  }, [adminToken, timeWindowHours]);

  const loadCheckoutDrafts = useCallback(async () => {
    if (!adminToken.trim()) {
      setCheckoutDrafts([]);
      return;
    }

    const url = new URL("/api/admin/checkout-drafts", window.location.origin);
    url.searchParams.set("hours", timeWindowHours);

    const response = await fetch(url.toString(), {
      headers: {
        "x-admin-token": adminToken.trim(),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error || "Failed to load checkout drafts");
    }

    const data = await response.json();
    setCheckoutDrafts(Array.isArray(data) ? data : []);
  }, [adminToken, timeWindowHours]);

  const loadAll = useCallback(async () => {
    const productEndpoint = adminToken.trim() ? "/api/products?includeHidden=1" : "/api/products";
    const [productsRes, postsRes] = await Promise.all([
      fetch(productEndpoint, {
        headers: adminToken.trim() ? { "x-admin-token": adminToken.trim() } : undefined,
      }),
      fetch("/api/blog"),
    ]);

    const [productsData, postsData] = await Promise.all([
      productsRes.json(),
      postsRes.json(),
    ]);

    setProducts(Array.isArray(productsData) ? productsData : []);
    setPosts(Array.isArray(postsData) ? postsData : []);
  }, [adminToken]);

  useEffect(() => {
    loadAll().catch((error) => {
      console.error(error);
      setStatus("Failed to load existing data.");
    });
  }, [loadAll]);

  useEffect(() => {
    if (!adminToken.trim()) return;
    loadDashboardAnalytics().catch((error) => {
      console.error(error);
      setStatus(getErrorMessage(error));
    });
    loadCheckoutDrafts().catch((error) => {
      console.error(error);
      setStatus(getErrorMessage(error));
    });
  }, [adminToken, loadCheckoutDrafts, loadDashboardAnalytics]);

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
      visibility: productForm.visibility,
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
    } catch (error: unknown) {
      setStatus(getErrorMessage(error) || "Failed to create product.");
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
    } catch (error: unknown) {
      setStatus(getErrorMessage(error) || "Failed to create blog post.");
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
    } catch (error: unknown) {
      setStatus(getErrorMessage(error) || "Failed to delete product.");
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
    } catch (error: unknown) {
      setStatus(getErrorMessage(error) || "Failed to delete blog post.");
    } finally {
      setBusy(false);
    }
  }

  const checkoutDraftStats = useMemo(() => {
    const active = checkoutDrafts.filter((draft) => draft.status !== "started").length;
    const whatsappInitiated = checkoutDrafts.filter((draft) => draft.status === "whatsapp_initiated").length;
    const recoverable = checkoutDrafts.filter(
      (draft) => draft.status !== "whatsapp_initiated" && (draft.phone || draft.fullName || draft.email),
    ).length;

    return { active, whatsappInitiated, recoverable };
  }, [checkoutDrafts]);

  const meaningfulProductPerformance = useMemo(
    () =>
      (dashboardAnalytics?.productPerformance ?? []).filter(
        (product) => product.clicks > 0 || product.addToCart > 0,
      ),
    [dashboardAnalytics],
  );

  const scoredCheckoutDrafts = useMemo(
    () =>
      [...checkoutDrafts]
        .map((draft) => {
          const leadScore = scoreCheckoutDraft(draft);
          return {
            ...draft,
            leadScore,
            leadTemperature: getLeadTemperature(leadScore),
          };
        })
        .sort((a, b) => {
          if (b.leadScore !== a.leadScore) return b.leadScore - a.leadScore;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }),
    [checkoutDrafts],
  );

  const checkoutSourceInsights = useMemo(() => {
    const map = new Map<string, { source: string; drafts: number; value: number }>();
    scoredCheckoutDrafts.forEach((draft) => {
      const source = draft.acquisitionSource || "Unknown";
      const existing = map.get(source);
      const value = getDraftValue(draft);
      if (existing) {
        existing.drafts += 1;
        existing.value += value;
        return;
      }
      map.set(source, { source, drafts: 1, value });
    });

    return Array.from(map.values()).sort((a, b) => b.drafts - a.drafts || b.value - a.value);
  }, [scoredCheckoutDrafts]);

  const handleCopyRecoveryMessage = async (draft: CheckoutDraftRecord) => {
    try {
      await navigator.clipboard.writeText(buildRecoveryMessage(draft));
      toast({
        title: "Reminder copied",
        description: "Recovery message is ready to paste.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Copy failed",
        description: "Please try again.",
      });
    }
  };

  const handleWhatsAppRecovery = (draft: CheckoutDraftRecord) => {
    const phone = normalizeWhatsAppNumber(draft.phone);
    const message = encodeURIComponent(buildRecoveryMessage(draft));
    const url = phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

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

      <Tabs defaultValue="dashboard" className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <TabsList className="h-auto flex-wrap justify-start gap-2 rounded-2xl bg-secondary/30 p-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="blogs">Blog Posts</TabsTrigger>
            <TabsTrigger value="checkout-drafts">Abandoned Checkouts</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-2">
            <span className="text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
              Time Window
            </span>
            <select
              value={timeWindowHours}
              onChange={(e) => setTimeWindowHours(e.target.value)}
              className="rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none"
            >
              <option value="24">24 Hours</option>
              <option value="168">7 Days</option>
              <option value="360">15 Days</option>
            </select>
          </div>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          <Card className="overflow-hidden rounded-[2rem] border-border/80">
            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/50 via-background to-secondary/20">
              <CardTitle className=" text-2xl">HUME Control Room</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your live snapshot of traffic, cart intent, product interest, and recovery opportunities.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {!adminToken.trim() ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  Add your admin token above to unlock dashboard analytics and checkout recovery data.
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-border/70 bg-card p-5">
                      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">Unique Viewers</p>
                      <p className="mt-2 text-2xl font-semibold">{dashboardAnalytics?.overview.uniqueViewers ?? 0}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Distinct visitors who viewed pages in the tracked window.</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-card p-5">
                      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">Unique Cart Visitors</p>
                      <p className="mt-2 text-2xl font-semibold">{dashboardAnalytics?.overview.uniqueCartVisitors ?? 0}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Distinct visitors who tapped the cart button.</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-card p-5">
                      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">Add To Cart</p>
                      <p className="mt-2 text-2xl font-semibold">{dashboardAnalytics?.overview.totalAddToCart ?? 0}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Total product adds recorded across the site.</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-card p-5">
                      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">Abandoned Draft Value</p>
                      <p className="mt-2 text-2xl font-semibold">INR {Math.round(dashboardAnalytics?.overview.abandonedDraftValue ?? 0)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Potential order value sitting in incomplete checkouts.</p>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-2xl border border-border/70 bg-card p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">Top Product Interest</h3>
                          <p className="text-sm text-muted-foreground">Only products with real clicks or add-to-cart events are shown.</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            Promise.all([loadDashboardAnalytics(), loadCheckoutDrafts()]).catch((error) => {
                              console.error(error);
                              setStatus(getErrorMessage(error));
                            });
                          }}
                        >
                          Refresh
                        </Button>
                      </div>

                      {meaningfulProductPerformance.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                          No product click data yet. Once visitors start tapping product cards, the leaders will appear here.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {meaningfulProductPerformance.map((product) => (
                            <div key={product.productId} className="grid gap-3 rounded-xl border border-border/60 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.productId}</p>
                              </div>
                              <div className="text-sm">
                                <p className="text-muted-foreground">Clicks</p>
                                <p className="text-lg font-semibold">{product.clicks}</p>
                              </div>
                              <div className="text-sm">
                                <p className="text-muted-foreground">Add to Cart</p>
                                <p className="text-lg font-semibold">{product.addToCart}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-2xl border border-border/70 bg-card p-5">
                        <h3 className="text-xl font-semibold">Acquisition Sources</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Best-known source based on UTM parameters first, then referrer fallback.
                        </p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {(dashboardAnalytics?.highlightedSources ?? []).map((source) => (
                            <div key={source.source} className="rounded-xl border border-border/60 p-3">
                              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                                {source.category}
                              </p>
                              <p className="mt-1 font-medium">{source.source}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{source.count} visits</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-card p-5">
                        <h3 className="text-xl font-semibold">Traffic Quality</h3>
                        <div className="mt-4 space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Total Page Views</span>
                            <span>{dashboardAnalytics?.overview.totalPageViews ?? 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Cart Opens</span>
                            <span>{dashboardAnalytics?.overview.totalCartOpens ?? 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Quantity Updates</span>
                            <span>{dashboardAnalytics?.overview.totalQuantityUpdates ?? 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Remove from Cart</span>
                            <span>{dashboardAnalytics?.overview.totalRemoveFromCart ?? 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-card p-5">
                        <h3 className="text-xl font-semibold">Checkout Recovery</h3>
                        <div className="mt-4 space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Active Drafts</span>
                            <span>{dashboardAnalytics?.overview.activeDrafts ?? 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Recoverable Leads</span>
                            <span>{checkoutDraftStats.recoverable}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">WhatsApp Initiated</span>
                            <span>{dashboardAnalytics?.overview.whatsappInitiatedDrafts ?? 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-card p-5">
                        <h3 className="text-xl font-semibold">Top Viewed Pages</h3>
                        <div className="mt-4 space-y-3">
                          {(dashboardAnalytics?.topViewedPages ?? []).slice(0, 6).map((page) => (
                            <div key={page.path} className="flex items-center justify-between text-sm">
                              <span className="max-w-[75%] truncate text-muted-foreground">{page.path}</span>
                              <span className="font-medium">{page.views}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-card p-5">
                        <h3 className="text-xl font-semibold">All Sources</h3>
                        <div className="mt-4 space-y-3">
                          {(dashboardAnalytics?.sourceBreakdown ?? []).slice(0, 10).map((source) => (
                            <div key={`${source.source}-${source.category}`} className="flex items-center justify-between text-sm">
                              <div>
                                <p className="font-medium">{source.source}</p>
                                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{source.category}</p>
                              </div>
                              <span>{source.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                <Input
                  placeholder="Visibility: public or seo_only"
                  value={productForm.visibility}
                  onChange={(e) =>
                    setProductForm((s) => ({
                      ...s,
                      visibility: (e.target.value as ProductForm["visibility"]) || "public",
                    }))
                  }
                  required
                />
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
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {product.visibility ?? "public"}
                    </p>
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

        <TabsContent value="checkout-drafts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Abandoned Checkout Recovery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                These are saved checkout drafts captured while customers type delivery details, so we can understand intent and recover serious leads faster.
              </p>

              {!adminToken.trim() ? (
                <p className="text-sm text-muted-foreground">
                  Add your admin token above to load checkout drafts securely.
                </p>
              ) : (
                <>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-sm text-muted-foreground">Active Drafts</p>
                      <p className="mt-1 text-2xl font-semibold">{checkoutDraftStats.active}</p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-sm text-muted-foreground">Recoverable Leads</p>
                      <p className="mt-1 text-2xl font-semibold">{checkoutDraftStats.recoverable}</p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-sm text-muted-foreground">WhatsApp Initiated</p>
                      <p className="mt-1 text-2xl font-semibold">{checkoutDraftStats.whatsappInitiated}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-2xl border border-border/70 bg-card p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold">Source-Based Recovery Insights</h3>
                          <p className="text-sm text-muted-foreground">
                            See which channels are bringing the strongest abandoned checkout intent.
                          </p>
                        </div>
                        <span className="rounded-full bg-secondary px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                          Top Sources
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {checkoutSourceInsights.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
                            Source insights will appear once checkout drafts are captured.
                          </div>
                        ) : (
                          checkoutSourceInsights.slice(0, 6).map((source) => (
                            <div
                              key={source.source}
                              className="rounded-xl border border-border/70 bg-secondary/20 p-4"
                            >
                              <p className="text-sm font-medium">{source.source}</p>
                              <p className="mt-1 text-2xl font-semibold">{source.drafts}</p>
                              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                Drafts
                              </p>
                              <p className="mt-3 text-sm text-muted-foreground">
                                Value: <span className="font-medium text-foreground">{formatINR(source.value)}</span>
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-card p-5">
                      <div>
                        <h3 className="text-lg font-semibold">Lead Scoring Guide</h3>
                        <p className="text-sm text-muted-foreground">
                          Scores consider order value, form completion, cart size, and freshness of the lead.
                        </p>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-emerald-800">Hot Lead</span>
                            <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-white">
                              70+
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-emerald-900">
                            High cart value, strong contact info, and recent activity. Recover first.
                          </p>
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-amber-800">Warm Lead</span>
                            <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-white">
                              40-69
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-amber-900">
                            Useful contact data and visible interest. Good for soft follow-up.
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-800">Cold Lead</span>
                            <span className="rounded-full bg-slate-500 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-white">
                              0-39
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-800">
                            Low completion or weak intent so far. Keep for observation or later nurture.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() =>
                        loadCheckoutDrafts().catch((error) => {
                          console.error(error);
                          setStatus(getErrorMessage(error));
                        })
                      }
                      disabled={busy}
                    >
                      Refresh Drafts
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {scoredCheckoutDrafts.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                        No checkout drafts captured yet.
                      </div>
                    ) : (
                      scoredCheckoutDrafts.map((draft) => {
                        const cartSummary = Array.isArray(draft.cartSnapshot)
                          ? draft.cartSnapshot
                              .map((item) => `${item.name} x${item.quantity}${item.isGift ? " [gift]" : ""}`)
                              .join(", ")
                          : "";

                        const location = [draft.city, draft.state, draft.pincode].filter(Boolean).join(", ");
                        const leadToneStyles =
                          draft.leadTemperature === "Hot"
                            ? "bg-emerald-600 text-white"
                            : draft.leadTemperature === "Warm"
                              ? "bg-amber-500 text-white"
                              : "bg-slate-500 text-white";

                        return (
                          <div key={draft.id} className="rounded-xl border border-border p-4">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold">
                                    {draft.fullName || displayPhoneNumber(draft.phone) || draft.email || "Anonymous draft"}
                                  </p>
                                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    {draft.status.replace(/_/g, " ")}
                                  </span>
                                  <span className={`rounded-full px-2.5 py-1 text-xs uppercase tracking-[0.18em] ${leadToneStyles}`}>
                                    {draft.leadTemperature}
                                  </span>
                                </div>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  {draft.acquisitionSource ? (
                                    <p>
                                      Source: {draft.acquisitionSource}
                                      {draft.acquisitionCategory ? ` (${draft.acquisitionCategory})` : ""}
                                    </p>
                                  ) : null}
                                  {draft.phone ? <p>Phone: {displayPhoneNumber(draft.phone)}</p> : null}
                                  {draft.email ? <p>Email: {draft.email}</p> : null}
                                  {location ? <p>Location: {location}</p> : null}
                                  {draft.path ? <p>Path: {draft.path}</p> : null}
                                  {draft.lastEditedField ? <p>Last edited field: {draft.lastEditedField}</p> : null}
                                </div>
                              </div>

                              <div className="min-w-[220px] rounded-lg bg-secondary/40 p-3 text-sm">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Lead Score</p>
                                <p className="mt-1 text-xl font-semibold">{draft.leadScore}/100</p>
                                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Order Value</p>
                                <p className="mt-1 text-xl font-semibold">{draft.grandTotal ? `INR ${draft.grandTotal}` : "—"}</p>
                                <p className="mt-2 text-muted-foreground">
                                  Updated: {new Date(draft.updatedAt).toLocaleString("en-IN")}
                                </p>
                                {draft.whatsappInitiatedAt ? (
                                  <p className="mt-1 text-emerald-700">
                                    WhatsApp started: {new Date(draft.whatsappInitiatedAt).toLocaleString("en-IN")}
                                  </p>
                                ) : null}
                              </div>
                            </div>

                            {cartSummary ? (
                              <div className="mt-4 rounded-lg border border-border/70 p-3 text-sm">
                                <p className="mb-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">Cart Snapshot</p>
                                <p>{cartSummary}</p>
                              </div>
                            ) : null}

                            {draft.addressLine1 || draft.addressLine2 || draft.notes ? (
                              <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <div className="rounded-lg border border-border/70 p-3 text-sm">
                                  <p className="mb-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">Address</p>
                                  <p>{[draft.addressLine1, draft.addressLine2].filter(Boolean).join(", ") || "—"}</p>
                                </div>
                                <div className="rounded-lg border border-border/70 p-3 text-sm">
                                  <p className="mb-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">Notes</p>
                                  <p>{draft.notes || "—"}</p>
                                </div>
                              </div>
                            ) : null}

                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                type="button"
                                className="rounded-full bg-emerald-600 px-5 text-white hover:bg-emerald-700"
                                onClick={() => handleWhatsAppRecovery(draft)}
                              >
                                Send Reminder
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="rounded-full px-5"
                                onClick={() => void handleCopyRecoveryMessage(draft)}
                              >
                                Copy Reminder
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
