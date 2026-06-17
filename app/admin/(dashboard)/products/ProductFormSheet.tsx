"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import type { Product } from "@/db/schema";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ProductForForm = Omit<Product, "price"> & {
  price: string | number;
  categoryIds?: string[];
};

type ProductFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (product?: Product) => void;
  product?: Product | null;
};

type ProductFormState = {
  name: string;
  inspiration: string;
  inspirationBrand: string;
  visibility: "public" | "seo_only";
  category: string;
  categoryId: string;
  categoryIdsCsv: string;
  gender: "Men" | "Women" | "Unisex";
  imagesCsv: string;
  price: string;
  bestSeller: boolean;
  humeSpecial: boolean;
  limitedStock: boolean;
  soldOut: boolean;
  comingSoon: boolean;
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
  woreBy: string;
  woreByImageUrl: string;
};

const DEFAULT_CELEB_IMAGE = "https://placehold.co/600x600?text=Celeb";

const emptyForm: ProductFormState = {
  name: "",
  inspiration: "",
  inspirationBrand: "",
  visibility: "public",
  category: "",
  categoryId: "",
  categoryIdsCsv: "",
  gender: "Unisex",
  imagesCsv: "",
  price: "",
  bestSeller: false,
  humeSpecial: false,
  limitedStock: false,
  soldOut: false,
  comingSoon: false,
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
  woreBy: "",
  woreByImageUrl: DEFAULT_CELEB_IMAGE,
};

const badgeOptions = [
  ["bestSeller", "Best seller"],
  ["humeSpecial", "HUME special"],
  ["comingSoon", "Coming soon"],
  ["limitedStock", "Low stock"],
  ["soldOut", "Sold out"],
] as const;

type BadgeKey = (typeof badgeOptions)[number][0];

const inputClassName =
  "h-10 rounded-lg border-white/10 bg-white/[0.04] text-sm text-white shadow-none placeholder:text-white/25 focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/25 focus-visible:ring-offset-0";
const textareaClassName =
  "rounded-lg border-white/10 bg-white/[0.04] text-sm leading-6 text-white shadow-none placeholder:text-white/25 focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/25 focus-visible:ring-offset-0";
const labelClassName = "text-xs font-semibold text-white/55";
const helperClassName = "text-xs leading-5 text-white/35";
const selectClassName =
  "flex h-10 w-full items-center rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition focus:border-white/30 focus:ring-1 focus:ring-white/25 [&>option]:bg-[#111111]";

function cloneEmptyForm() {
  return { ...emptyForm };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function csvToArray(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function arrayToCsv(value: string[] | null | undefined) {
  return Array.isArray(value) ? value.filter(Boolean).join(", ") : "";
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function getBadges(product: ProductForForm) {
  return (product.badges ?? {}) as Record<BadgeKey, boolean | undefined>;
}

function createFormFromProduct(product: ProductForForm): ProductFormState {
  const badges = getBadges(product);
  const notes = product.notes ?? { top: [], heart: [], base: [] };
  const longevity = product.longevity ?? {
    duration: "",
    sillage: "",
    season: [],
    occasion: [],
  };
  const categoryIds = product.categoryIds?.length
    ? product.categoryIds
    : [product.categoryId].filter(Boolean);

  return {
    name: product.name ?? "",
    inspiration: product.inspiration ?? "",
    inspirationBrand: product.inspirationBrand ?? "",
    visibility: product.visibility ?? "public",
    category: product.category ?? "",
    categoryId: product.categoryId ?? "",
    categoryIdsCsv: arrayToCsv(categoryIds),
    gender: product.gender ?? "Unisex",
    imagesCsv: arrayToCsv(product.images),
    price:
      product.price === null || product.price === undefined
        ? ""
        : String(product.price),
    bestSeller: Boolean(badges.bestSeller),
    humeSpecial: Boolean(badges.humeSpecial),
    limitedStock: Boolean(badges.limitedStock),
    soldOut: Boolean(badges.soldOut),
    comingSoon: Boolean(badges.comingSoon),
    description: product.description ?? "",
    seoDescription: product.seoDescription ?? "",
    seoKeywordsCsv: arrayToCsv(product.seoKeywords),
    notesTopCsv: arrayToCsv(notes.top),
    notesHeartCsv: arrayToCsv(notes.heart),
    notesBaseCsv: arrayToCsv(notes.base),
    duration: longevity.duration ?? "",
    sillage: longevity.sillage ?? "",
    seasonCsv: arrayToCsv(longevity.season),
    occasionCsv: arrayToCsv(longevity.occasion),
    size: product.size ?? "50ml",
    woreBy: product.woreBy ?? "",
    woreByImageUrl: product.woreByImageUrl || DEFAULT_CELEB_IMAGE,
  };
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-white/40">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  htmlFor,
  label,
  helper,
  className,
  children,
}: {
  htmlFor: string;
  label: string;
  helper?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className={labelClassName}>
        {label}
      </Label>
      {children}
      {helper ? <p className={helperClassName}>{helper}</p> : null}
    </div>
  );
}

export function ProductFormSheet({
  open,
  onOpenChange,
  onSuccess,
  product,
}: ProductFormSheetProps) {
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(() => cloneEmptyForm());
  const isEditing = Boolean(product);

  useEffect(() => {
    if (!open) return;

    let active = true;

    if (!product) {
      setForm(cloneEmptyForm());
      setDetailLoading(false);
      setDetailError(null);
      return;
    }

    setForm(createFormFromProduct(product as ProductForForm));
    setDetailLoading(true);
    setDetailError(null);

    fetch(`/api/products/${encodeURIComponent(product.id)}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load full product details");
        return (await response.json()) as ProductForForm;
      })
      .then((fullProduct) => {
        if (!active) return;
        setForm(
          createFormFromProduct({ ...(product as ProductForForm), ...fullProduct }),
        );
      })
      .catch(() => {
        if (!active) return;
        setDetailError(
          "Full product details could not load. Close this panel and try again before saving.",
        );
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, product]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { id, value } = event.target;
    setForm((current) => ({ ...current, [id]: value }) as ProductFormState);
  };

  const handleCheckedChange = (id: BadgeKey, checked: boolean) => {
    setForm((current) => ({ ...current, [id]: checked }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (isEditing && (detailLoading || detailError)) {
      toast({
        title: "Product details are not ready",
        description: detailError ?? "Wait for the product fields to finish loading.",
        variant: "destructive",
      });
      return;
    }

    const price = Number(form.price);
    const images = csvToArray(form.imagesCsv);
    const resolvedCategoryId = form.categoryId.trim() || slugify(form.category);
    const categoryIds = uniqueValues([
      resolvedCategoryId,
      ...csvToArray(form.categoryIdsCsv),
    ]);

    if (!Number.isFinite(price) || price <= 0) {
      toast({
        title: "Enter a valid price",
        variant: "destructive",
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: "Add at least one product image",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const payload = {
      ...(isEditing ? {} : { id: `${slugify(form.name)}-${Date.now().toString(36)}` }),
      name: form.name.trim(),
      inspiration: form.inspiration.trim(),
      inspirationBrand: form.inspirationBrand.trim(),
      visibility: form.visibility,
      woreBy: form.woreBy.trim() || null,
      woreByImageUrl: form.woreByImageUrl.trim() || DEFAULT_CELEB_IMAGE,
      category: form.category.trim(),
      categoryId: resolvedCategoryId,
      categoryIds,
      gender: form.gender,
      images,
      price,
      priceCurrency: "INR",
      badges: {
        bestSeller: form.bestSeller,
        humeSpecial: form.humeSpecial,
        limitedStock: form.limitedStock,
        soldOut: form.soldOut,
        comingSoon: form.comingSoon,
      },
      description: form.description.trim(),
      seoDescription: form.seoDescription.trim(),
      seoKeywords: csvToArray(form.seoKeywordsCsv),
      notes: {
        top: csvToArray(form.notesTopCsv),
        heart: csvToArray(form.notesHeartCsv),
        base: csvToArray(form.notesBaseCsv),
      },
      longevity: {
        duration: form.duration.trim(),
        sillage: form.sillage.trim(),
        season: csvToArray(form.seasonCsv),
        occasion: csvToArray(form.occasionCsv),
      },
      size: form.size.trim(),
    };

    try {
      const response = await fetch(
        isEditing && product
          ? `/api/products/${encodeURIComponent(product.id)}`
          : "/api/products",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(errorText || "Product save failed");
      }

      const savedProduct = (await response.json()) as Product;
      toast({
        title: isEditing
          ? "Product updated successfully"
          : "Product created successfully",
      });
      if (!isEditing) setForm(cloneEmptyForm());
      onSuccess(savedProduct);
    } catch (error) {
      toast({
        title: isEditing ? "Error updating product" : "Error creating product",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="admin-shell dark flex h-full w-full flex-col overflow-hidden border-l border-white/10 bg-[#0b0b0b] p-0 font-sans text-white sm:max-w-[860px]">
        <div className="shrink-0 border-b border-white/10 bg-[#111111] px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4 pr-9">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-semibold text-white/55">
                  Catalog editor
                </span>
                <span
                  className={cn(
                    "rounded-md px-2 py-1 text-[11px] font-semibold",
                    form.visibility === "public"
                      ? "bg-emerald-500/10 text-emerald-200"
                      : "bg-white/[0.06] text-white/55",
                  )}
                >
                  {form.visibility === "public" ? "Public" : "Hidden SEO"}
                </span>
              </div>
              <SheetTitle className="truncate text-lg font-semibold leading-tight text-white sm:text-xl">
                {isEditing ? form.name || "Edit fragrance" : "New fragrance"}
              </SheetTitle>
              <SheetDescription className="mt-1 max-w-2xl text-xs leading-5 text-white/45">
                {isEditing
                  ? "Review, edit, and save catalog details for this product."
                  : "Create a new catalog product with storefront, SEO, and profile data."}
              </SheetDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            {detailLoading ? (
              <div className="mb-4 rounded-lg border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
                Loading full product details before edit...
              </div>
            ) : null}
            {detailError ? (
              <div className="mb-4 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                {detailError}
              </div>
            ) : null}

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="mb-5 grid h-auto w-full grid-cols-4 gap-1 rounded-lg border border-white/10 bg-black/25 p-1 text-white/45">
                <TabsTrigger
                  value="basic"
                  className="h-9 rounded-md text-xs font-semibold text-white/55 shadow-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-none"
                >
                  Basic
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="h-9 rounded-md text-xs font-semibold text-white/55 shadow-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-none"
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="media"
                  className="h-9 rounded-md text-xs font-semibold text-white/55 shadow-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-none"
                >
                  Media
                </TabsTrigger>
                <TabsTrigger
                  value="seo"
                  className="h-9 rounded-md text-xs font-semibold text-white/55 shadow-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-none"
                >
                  SEO
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-0 space-y-4">
                <FormSection title="Product identity">
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
                    <Field htmlFor="name" label="Product name">
                      <Input
                        id="name"
                        value={form.name}
                        onChange={handleChange}
                        className={inputClassName}
                        required
                      />
                    </Field>
                    <Field htmlFor="price" label="Price">
                      <Input
                        id="price"
                        type="number"
                        value={form.price}
                        onChange={handleChange}
                        className={inputClassName}
                        required
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field htmlFor="inspirationBrand" label="Inspiration brand">
                      <Input
                        id="inspirationBrand"
                        value={form.inspirationBrand}
                        onChange={handleChange}
                        className={inputClassName}
                        required
                      />
                    </Field>
                    <Field htmlFor="inspiration" label="Inspiration name">
                      <Input
                        id="inspiration"
                        value={form.inspiration}
                        onChange={handleChange}
                        className={inputClassName}
                        required
                      />
                    </Field>
                  </div>
                </FormSection>

                <FormSection
                  title="Catalog routing"
                  description="These fields control filters, product pages, and hidden SEO visibility."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field htmlFor="category" label="Category label">
                      <Input
                        id="category"
                        value={form.category}
                        onChange={handleChange}
                        className={inputClassName}
                        required
                      />
                    </Field>
                    <Field htmlFor="categoryId" label="Primary category ID">
                      <Input
                        id="categoryId"
                        value={form.categoryId}
                        onChange={handleChange}
                        placeholder="fresh"
                        className={inputClassName}
                      />
                    </Field>
                  </div>

                  <Field
                    htmlFor="categoryIdsCsv"
                    label="All category IDs"
                    helper="Comma separated. Keep every related category here so shop filters and SEO pages stay connected."
                  >
                    <Input
                      id="categoryIdsCsv"
                      value={form.categoryIdsCsv}
                      onChange={handleChange}
                      placeholder="fresh, citrus, aquatic"
                      className={inputClassName}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field htmlFor="gender" label="Gender">
                      <select
                        id="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className={selectClassName}
                      >
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                      </select>
                    </Field>
                    <Field htmlFor="size" label="Size">
                      <Input
                        id="size"
                        value={form.size}
                        onChange={handleChange}
                        className={inputClassName}
                        required
                      />
                    </Field>
                    <Field htmlFor="visibility" label="Visibility">
                      <select
                        id="visibility"
                        value={form.visibility}
                        onChange={handleChange}
                        className={selectClassName}
                      >
                        <option value="public">Public</option>
                        <option value="seo_only">Hidden SEO only</option>
                      </select>
                    </Field>
                  </div>
                </FormSection>

                <FormSection title="Storefront copy and badges">
                  <Field htmlFor="description" label="Full description">
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={handleChange}
                      className={cn(textareaClassName, "min-h-[120px]")}
                    />
                  </Field>

                  <div className="grid gap-2 sm:grid-cols-5">
                    {badgeOptions.map(([id, label]) => {
                      const checked = Boolean(form[id]);
                      return (
                        <label
                          key={id}
                          className={cn(
                            "flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition",
                            checked
                              ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                              : "border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/[0.06]",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) =>
                              handleCheckedChange(id, event.target.checked)
                            }
                            className="h-3.5 w-3.5 accent-emerald-400"
                          />
                          <span className="truncate">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </FormSection>
              </TabsContent>

              <TabsContent value="profile" className="mt-0 space-y-4">
                <FormSection title="Fragrance notes">
                  <Field htmlFor="notesTopCsv" label="Top notes">
                    <Input
                      id="notesTopCsv"
                      value={form.notesTopCsv}
                      onChange={handleChange}
                      className={inputClassName}
                    />
                  </Field>
                  <Field htmlFor="notesHeartCsv" label="Heart notes">
                    <Input
                      id="notesHeartCsv"
                      value={form.notesHeartCsv}
                      onChange={handleChange}
                      className={inputClassName}
                    />
                  </Field>
                  <Field htmlFor="notesBaseCsv" label="Base notes">
                    <Input
                      id="notesBaseCsv"
                      value={form.notesBaseCsv}
                      onChange={handleChange}
                      className={inputClassName}
                    />
                  </Field>
                </FormSection>

                <FormSection title="Performance">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field htmlFor="duration" label="Longevity">
                      <Input
                        id="duration"
                        placeholder="8-10 Hours"
                        value={form.duration}
                        onChange={handleChange}
                        className={inputClassName}
                      />
                    </Field>
                    <Field htmlFor="sillage" label="Sillage">
                      <Input
                        id="sillage"
                        placeholder="Strong"
                        value={form.sillage}
                        onChange={handleChange}
                        className={inputClassName}
                      />
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field htmlFor="seasonCsv" label="Seasons">
                      <Input
                        id="seasonCsv"
                        value={form.seasonCsv}
                        onChange={handleChange}
                        placeholder="Summer, Winter"
                        className={inputClassName}
                      />
                    </Field>
                    <Field htmlFor="occasionCsv" label="Occasions">
                      <Input
                        id="occasionCsv"
                        value={form.occasionCsv}
                        onChange={handleChange}
                        placeholder="Daily Wear, Party"
                        className={inputClassName}
                      />
                    </Field>
                  </div>
                </FormSection>
              </TabsContent>

              <TabsContent value="media" className="mt-0 space-y-4">
                <FormSection title="Product images">
                  <Field
                    htmlFor="imagesCsv"
                    label="Image URLs"
                    helper="Comma separated. The first URL becomes the product thumbnail."
                  >
                    <Textarea
                      id="imagesCsv"
                      placeholder="https://..."
                      value={form.imagesCsv}
                      onChange={handleChange}
                      className={cn(textareaClassName, "min-h-[140px]")}
                    />
                  </Field>
                </FormSection>

                <FormSection title="Celebrity favorite">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field htmlFor="woreBy" label="Worn by">
                      <Input
                        id="woreBy"
                        value={form.woreBy}
                        onChange={handleChange}
                        placeholder="Optional celebrity name"
                        className={inputClassName}
                      />
                    </Field>
                    <Field htmlFor="woreByImageUrl" label="Worn by image URL">
                      <Input
                        id="woreByImageUrl"
                        value={form.woreByImageUrl}
                        onChange={handleChange}
                        className={inputClassName}
                      />
                    </Field>
                  </div>
                </FormSection>
              </TabsContent>

              <TabsContent value="seo" className="mt-0 space-y-4">
                <FormSection title="Search metadata">
                  <Field htmlFor="seoDescription" label="Meta description">
                    <Textarea
                      id="seoDescription"
                      value={form.seoDescription}
                      onChange={handleChange}
                      className={cn(textareaClassName, "min-h-[110px]")}
                    />
                  </Field>
                  <Field htmlFor="seoKeywordsCsv" label="Keywords">
                    <Input
                      id="seoKeywordsCsv"
                      value={form.seoKeywordsCsv}
                      onChange={handleChange}
                      className={inputClassName}
                    />
                  </Field>
                </FormSection>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-white/10 bg-[#111111] px-5 py-4 sm:px-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || (isEditing && (detailLoading || Boolean(detailError)))}
              className="h-10 rounded-lg bg-white px-5 text-sm font-semibold text-black hover:bg-white/90 disabled:bg-white/20 disabled:text-white/35"
            >
              {loading ? "Saving..." : isEditing ? "Save changes" : "Publish product"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
