"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
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
import {
  BadgeCheck,
  Box,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Cloud,
  Copy,
  Crown,
  FileText,
  FlaskConical,
  Globe2,
  ImageIcon,
  IndianRupee,
  Layers3,
  Library,
  Link2,
  Loader2,
  Search,
  Sparkles,
  Tags,
  Trash2,
  UploadCloud,
} from "lucide-react";

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
  showInDiscoverySet: boolean;
  recommendedSample: boolean;
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

type CloudinaryStatus = {
  configured: boolean;
  cloudName: string;
  uploadFolder: string;
};

type LibraryImage = {
  id: string;
  label: string;
  url: string;
  usage: string;
  tags: string[];
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  format: string | null;
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
  showInDiscoverySet: false,
  recommendedSample: false,
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
  ["limitedStock", "Only 2 left"],
  ["soldOut", "Sold out"],
  ["showInDiscoverySet", "Show in Discovery Set"],
  ["recommendedSample", "Recommend in Discovery Set"],
] as const;

type BadgeKey = (typeof badgeOptions)[number][0];

const inputClassName =
  "h-12 rounded-xl border-white/[0.09] bg-[#111113] px-4 text-sm font-medium text-white shadow-[inset_0_1px_rgba(255,255,255,.025)] placeholder:text-white/22 hover:border-white/[0.14] focus-visible:border-[#c9b3ff]/45 focus-visible:ring-2 focus-visible:ring-[#c9b3ff]/10 focus-visible:ring-offset-0";
const textareaClassName =
  "rounded-xl border-white/[0.09] bg-[#111113] px-4 py-3 text-sm leading-6 text-white shadow-[inset_0_1px_rgba(255,255,255,.025)] placeholder:text-white/22 hover:border-white/[0.14] focus-visible:border-[#c9b3ff]/45 focus-visible:ring-2 focus-visible:ring-[#c9b3ff]/10 focus-visible:ring-offset-0";
const labelClassName =
  "text-[10px] font-bold uppercase tracking-[0.14em] text-white/40";
const helperClassName = "text-[11px] leading-5 text-white/30";
const selectClassName =
  "flex h-12 w-full items-center rounded-xl border border-white/[0.09] bg-[#111113] px-4 py-2 text-sm font-medium text-white outline-none transition hover:border-white/[0.14] focus:border-[#c9b3ff]/45 focus:ring-2 focus:ring-[#c9b3ff]/10 [&>option]:bg-[#111113]";

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

function getImageUrlDetails(imageUrl: string) {
  try {
    const parsedUrl = new URL(imageUrl);
    const rawFileName = parsedUrl.pathname.split("/").filter(Boolean).pop();

    return {
      fileName: rawFileName ? decodeURIComponent(rawFileName) : "Product image",
      source: parsedUrl.hostname.includes("cloudinary.com")
        ? "Cloudinary"
        : parsedUrl.hostname,
      isCloudinary: parsedUrl.hostname.includes("cloudinary.com"),
    };
  } catch {
    return {
      fileName: "Product image",
      source: "External image",
      isCloudinary: false,
    };
  }
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
    showInDiscoverySet: Boolean(badges.showInDiscoverySet),
    recommendedSample: Boolean(badges.recommendedSample),
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
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[22px] border border-white/[0.085] bg-[#19191c] p-5 shadow-[inset_0_1px_rgba(255,255,255,.035),0_16px_45px_rgba(0,0,0,.1)] sm:p-6">
      <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-[#c9b3ff]/[0.035] blur-2xl" />
      <div className="relative mb-5 flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[#c9b3ff]/15 bg-[#c9b3ff]/[0.075] text-[#d8cbff]">
          {icon ?? <Layers3 className="h-3.5 w-3.5" />}
        </span>
        <div>
        <h3 className="text-sm font-semibold tracking-[-0.01em] text-white">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-white/35">{description}</p>
        ) : null}
        </div>
      </div>
      <div className="relative space-y-5">{children}</div>
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
  const [uploadingImages, setUploadingImages] = useState(false);
  const [importingImageUrl, setImportingImageUrl] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [cloudinaryStatus, setCloudinaryStatus] =
    useState<CloudinaryStatus | null>(null);
  const [form, setForm] = useState<ProductFormState>(() => cloneEmptyForm());
  const productImageInputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    if (!open) return;

    let active = true;
    fetch("/api/admin/images/upload", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not check Cloudinary");
        return (await response.json()) as CloudinaryStatus;
      })
      .then((status) => {
        if (active) setCloudinaryStatus(status);
      })
      .catch(() => {
        if (active) {
          setCloudinaryStatus({
            configured: false,
            cloudName: "",
            uploadFolder: "hume-fragrance",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLibraryLoading(true);
    fetch("/api/admin/images", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load image library");
        return (await response.json()) as { images?: LibraryImage[] };
      })
      .then((data) => {
        if (active) setLibraryImages(data.images || []);
      })
      .catch(() => {
        if (active) setLibraryImages([]);
      })
      .finally(() => {
        if (active) setLibraryLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { id, value } = event.target;
    setForm((current) => ({ ...current, [id]: value }) as ProductFormState);
  };

  const handleCheckedChange = (id: BadgeKey, checked: boolean) => {
    setForm((current) => ({ ...current, [id]: checked }));
  };

  const updateProductImages = (imageUrls: string[]) => {
    setForm((current) => ({
      ...current,
      imagesCsv: uniqueValues(imageUrls).join(", "),
    }));
  };

  const makeImagePrimary = (imageIndex: number) => {
    const imageUrls = csvToArray(form.imagesCsv);
    const selectedImage = imageUrls[imageIndex];
    if (!selectedImage || imageIndex === 0) return;
    updateProductImages([
      selectedImage,
      ...imageUrls.filter((_, index) => index !== imageIndex),
    ]);
  };

  const moveProductImage = (imageIndex: number, nextIndex: number) => {
    const imageUrls = csvToArray(form.imagesCsv);
    if (
      imageIndex < 0 ||
      nextIndex < 0 ||
      imageIndex >= imageUrls.length ||
      nextIndex >= imageUrls.length ||
      imageIndex === nextIndex
    ) return;
    const next = [...imageUrls];
    const [moved] = next.splice(imageIndex, 1);
    next.splice(nextIndex, 0, moved);
    updateProductImages(next);
  };

  const dropProductImage = (event: DragEvent<HTMLElement>, targetIndex: number) => {
    event.preventDefault();
    if (draggedImageIndex === null) return;
    moveProductImage(draggedImageIndex, targetIndex);
    setDraggedImageIndex(null);
  };

  const addLibraryImage = (imageUrl: string) => {
    setForm((current) => ({
      ...current,
      imagesCsv: uniqueValues([...csvToArray(current.imagesCsv), imageUrl]).join(", "),
    }));
    toast({ title: "Image added to product gallery" });
  };

  const importExternalImage = async (imageUrl: string, imageIndex: number) => {
    if (!/^https?:\/\//i.test(imageUrl)) {
      toast({ title: "Only full external URLs can be moved to Cloudinary", variant: "destructive" });
      return;
    }
    setImportingImageUrl(imageUrl);
    try {
      const response = await fetch("/api/admin/images/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: imageUrl,
          label: `${form.name || "Product"} image ${imageIndex + 1}`,
          usage: "product",
          tags: ["product", slugify(form.name)].filter(Boolean),
        }),
      });
      const result = (await response.json()) as { error?: string; image?: LibraryImage };
      if (!response.ok || !result.image?.url) throw new Error(result.error || "Image import failed");
      const imageUrls = csvToArray(form.imagesCsv);
      imageUrls[imageIndex] = result.image.url;
      updateProductImages(imageUrls);
      setLibraryImages((current) => [result.image as LibraryImage, ...current]);
      toast({ title: "External image moved to Cloudinary" });
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Image import failed", variant: "destructive" });
    } finally {
      setImportingImageUrl(null);
    }
  };

  const removeProductImage = (imageIndex: number) => {
    updateProductImages(
      csvToArray(form.imagesCsv).filter((_, index) => index !== imageIndex),
    );
  };

  const copyImageUrl = async (imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast({ title: "Image URL copied" });
    } catch {
      toast({
        title: "Could not copy the image URL",
        variant: "destructive",
      });
    }
  };

  const uploadProductImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    if (cloudinaryStatus?.configured === false) {
      toast({
        title: "Cloudinary setup is required",
        description: "Add the Cloudinary credentials to .env.local first.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    let uploadError: string | null = null;

    try {
      for (const file of selectedFiles) {
        const uploadForm = new FormData();
        uploadForm.append("file", file);
        uploadForm.append(
          "label",
          `${form.name || "Product"} - ${file.name.replace(/\.[^.]+$/, "")}`,
        );
        uploadForm.append("usage", "product");
        uploadForm.append(
          "tags",
          ["product", slugify(form.name)].filter(Boolean).join(","),
        );

        const response = await fetch("/api/admin/images/upload", {
          method: "POST",
          body: uploadForm,
        });
        const result = (await response.json()) as {
          error?: string;
          image?: { url?: string };
        };

        if (!response.ok || !result.image?.url) {
          throw new Error(result.error || `Could not upload ${file.name}`);
        }
        uploadedUrls.push(result.image.url);
      }
    } catch (error) {
      uploadError = error instanceof Error ? error.message : "Image upload failed";
    } finally {
      if (uploadedUrls.length > 0) {
        setForm((current) => ({
          ...current,
          imagesCsv: uniqueValues([
            ...csvToArray(current.imagesCsv),
            ...uploadedUrls,
          ]).join(", "),
        }));
      }
      if (productImageInputRef.current) {
        productImageInputRef.current.value = "";
      }
      setUploadingImages(false);
    }

    if (uploadError) {
      toast({
        title: uploadError,
        description:
          uploadedUrls.length > 0
            ? `${uploadedUrls.length} image${uploadedUrls.length === 1 ? " was" : "s were"} uploaded before the error.`
            : undefined,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: `${uploadedUrls.length} image${uploadedUrls.length === 1 ? "" : "s"} uploaded to Cloudinary`,
    });
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
        showInDiscoverySet: form.showInDiscoverySet,
        recommendedSample: form.recommendedSample,
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

  const primaryImage = csvToArray(form.imagesCsv)[0];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="admin-shell dark flex h-full w-full flex-col overflow-hidden border-l border-white/[0.09] bg-[#101012] p-0 font-sans text-white shadow-[-36px_0_100px_rgba(0,0,0,.55)] sm:max-w-[940px] [&>button]:right-5 [&>button]:top-5 [&>button]:z-20 [&>button]:rounded-full [&>button]:border [&>button]:border-white/10 [&>button]:bg-white/[0.04] [&>button]:p-2 [&>button]:text-white/50 [&>button]:transition [&>button]:hover:bg-white/10 [&>button]:hover:text-white">
        <div className="relative shrink-0 overflow-hidden border-b border-white/[0.08] bg-[radial-gradient(circle_at_88%_-10%,rgba(201,179,255,.16),transparent_36%),linear-gradient(135deg,#17171a_0%,#121214_70%)] px-5 py-5 sm:px-7 sm:py-6">
          <div className="pointer-events-none absolute -right-8 -top-14 h-44 w-44 rounded-full border border-[#c9b3ff]/10" />
          <div className="pointer-events-none absolute right-8 top-2 h-28 w-28 rounded-full border border-[#c9b3ff]/[0.07]" />
          <div className="flex items-center gap-4 pr-12 sm:gap-5">
            <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-[20px] border border-white/10 bg-[#0f0f11] shadow-[inset_0_1px_rgba(255,255,255,.05),0_16px_34px_rgba(0,0,0,.28)] sm:h-[88px] sm:w-[88px]">
              {primaryImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={primaryImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <Box className="h-7 w-7 text-[#c9b3ff]/55" />
              )}
              <span className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#101012] bg-[#80f0b2]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c9b3ff]/15 bg-[#c9b3ff]/[0.08] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#d9ceff]">
                  <Sparkles className="h-3 w-3" /> Catalog editor
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.13em]",
                    form.visibility === "public"
                      ? "border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-200"
                      : "border-white/[0.08] bg-white/[0.04] text-white/45",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      form.visibility === "public"
                        ? "bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,.8)]"
                        : "bg-white/35",
                    )}
                  />
                  {form.visibility === "public" ? "Live" : "Hidden SEO"}
                </span>
              </div>
              <SheetTitle className="truncate text-xl font-semibold tracking-[-0.035em] text-white sm:text-2xl">
                {isEditing ? form.name || "Edit fragrance" : "Create new fragrance"}
              </SheetTitle>
              <SheetDescription className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/35">
                <span>{form.inspirationBrand || "HUME catalog"}</span>
                <span className="hidden h-1 w-1 rounded-full bg-white/20 sm:block" />
                <span>{form.category || "Category not assigned"}</span>
                {form.price ? (
                  <>
                    <span className="hidden h-1 w-1 rounded-full bg-white/20 sm:block" />
                    <span className="text-white/60">₹{form.price}</span>
                  </>
                ) : null}
              </SheetDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_100%_0%,rgba(201,179,255,.035),transparent_28%)] px-4 py-4 sm:px-7 sm:py-6">
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
              <TabsList className="sticky top-0 z-10 mb-6 grid h-auto w-full grid-cols-4 gap-1.5 rounded-[18px] border border-white/[0.085] bg-[#151517]/95 p-1.5 text-white/45 shadow-[0_12px_30px_rgba(0,0,0,.22),inset_0_1px_rgba(255,255,255,.035)] backdrop-blur-xl">
                <TabsTrigger
                  value="basic"
                  className="group h-11 gap-2 rounded-[13px] border border-transparent text-[11px] font-semibold text-white/40 shadow-none transition data-[state=active]:border-[#c9b3ff]/15 data-[state=active]:bg-[#c9b3ff] data-[state=active]:text-[#18131f] data-[state=active]:shadow-[0_8px_20px_rgba(201,179,255,.15)]"
                >
                  <Box className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Basic</span>
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="group h-11 gap-2 rounded-[13px] border border-transparent text-[11px] font-semibold text-white/40 shadow-none transition data-[state=active]:border-[#c9b3ff]/15 data-[state=active]:bg-[#c9b3ff] data-[state=active]:text-[#18131f] data-[state=active]:shadow-[0_8px_20px_rgba(201,179,255,.15)]"
                >
                  <FlaskConical className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger
                  value="media"
                  className="group h-11 gap-2 rounded-[13px] border border-transparent text-[11px] font-semibold text-white/40 shadow-none transition data-[state=active]:border-[#c9b3ff]/15 data-[state=active]:bg-[#c9b3ff] data-[state=active]:text-[#18131f] data-[state=active]:shadow-[0_8px_20px_rgba(201,179,255,.15)]"
                >
                  <ImageIcon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Media</span>
                </TabsTrigger>
                <TabsTrigger
                  value="seo"
                  className="group h-11 gap-2 rounded-[13px] border border-transparent text-[11px] font-semibold text-white/40 shadow-none transition data-[state=active]:border-[#c9b3ff]/15 data-[state=active]:bg-[#c9b3ff] data-[state=active]:text-[#18131f] data-[state=active]:shadow-[0_8px_20px_rgba(201,179,255,.15)]"
                >
                  <Search className="h-3.5 w-3.5" /> <span className="hidden sm:inline">SEO</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-0 space-y-4">
                <FormSection
                  title="Product identity"
                  icon={<Box className="h-3.5 w-3.5" />}
                >
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
                      <div className="relative">
                        <IndianRupee className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c9b3ff]/65" />
                        <Input
                          id="price"
                          type="number"
                          value={form.price}
                          onChange={handleChange}
                          className={cn(inputClassName, "pl-11")}
                          required
                        />
                      </div>
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
                  icon={<Globe2 className="h-3.5 w-3.5" />}
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

                  <div className="overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#111113]">
                    <button
                      type="button"
                      onClick={() => setLibraryOpen((current) => !current)}
                      className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition hover:bg-white/[0.025]"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white/45"><Library className="h-4 w-4" /></span>
                        <span><span className="block text-xs font-semibold text-white/72">Choose from image library</span><span className="mt-0.5 block text-[10px] text-white/28">Reuse an existing Cloudinary asset without uploading it again.</span></span>
                      </span>
                      <ChevronDown className={cn("h-4 w-4 shrink-0 text-white/30 transition", libraryOpen && "rotate-180")} />
                    </button>
                    {libraryOpen ? (
                      <div className="border-t border-white/[0.07] p-3">
                        {libraryLoading ? <div className="flex items-center gap-2 px-2 py-5 text-xs text-white/35"><Loader2 className="h-3.5 w-3.5 animate-spin" />Loading media library…</div> : null}
                        {!libraryLoading && libraryImages.length === 0 ? <p className="px-2 py-5 text-xs text-white/30">No saved media assets yet.</p> : null}
                        <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                          {libraryImages.map((asset) => {
                            const selected = csvToArray(form.imagesCsv).includes(asset.url);
                            return (
                              <button key={asset.id} type="button" disabled={selected} onClick={() => addLibraryImage(asset.url)} className={cn("group overflow-hidden rounded-xl border bg-black/20 text-left transition", selected ? "border-emerald-300/20 opacity-55" : "border-white/[0.07] hover:border-[#c9b3ff]/30")}>
                                <div className="aspect-square overflow-hidden bg-black/25">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={asset.url} alt={asset.label} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                                </div>
                                <div className="p-2"><p className="truncate text-[10px] font-semibold text-white/62">{asset.label}</p><p className="mt-1 text-[8px] uppercase tracking-[.1em] text-white/24">{selected ? "Already selected" : [asset.width && asset.height ? `${asset.width}×${asset.height}` : null, asset.format].filter(Boolean).join(" · ") || asset.usage}</p></div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
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

                <FormSection
                  title="Storefront copy and badges"
                  icon={<Tags className="h-3.5 w-3.5" />}
                >
                  <Field htmlFor="description" label="Full description">
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={handleChange}
                      className={cn(textareaClassName, "min-h-[120px]")}
                    />
                  </Field>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {badgeOptions.map(([id, label]) => {
                      const checked = Boolean(form[id]);
                      return (
                        <label
                          key={id}
                          className={cn(
                            "group flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition duration-200",
                            checked
                              ? "border-[#c9b3ff]/35 bg-[#c9b3ff]/[0.11] text-[#e2d9ff] shadow-[inset_0_1px_rgba(255,255,255,.04)]"
                              : "border-white/[0.08] bg-[#111113] text-white/45 hover:border-white/[0.15] hover:bg-white/[0.045] hover:text-white/70",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) =>
                              handleCheckedChange(id, event.target.checked)
                            }
                            className="sr-only"
                          />
                          <span
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] border transition",
                              checked
                                ? "border-[#c9b3ff]/20 bg-[#c9b3ff]/15 text-[#e4dcff]"
                                : "border-white/[0.07] bg-white/[0.025] text-white/25 group-hover:text-white/50",
                            )}
                          >
                            {checked ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            )}
                          </span>
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </FormSection>
              </TabsContent>

              <TabsContent value="profile" className="mt-0 space-y-4">
                <FormSection
                  title="Fragrance notes"
                  icon={<FlaskConical className="h-3.5 w-3.5" />}
                >
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

                <FormSection
                  title="Performance"
                  icon={<BadgeCheck className="h-3.5 w-3.5" />}
                >
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
                <FormSection
                  title="Product images"
                  description="The first image is used as the primary storefront visual."
                  icon={<ImageIcon className="h-3.5 w-3.5" />}
                >
                  <div className="flex flex-col gap-4 rounded-[18px] border border-[#c9b3ff]/15 bg-[linear-gradient(135deg,rgba(201,179,255,.085),rgba(201,179,255,.025))] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] border border-[#c9b3ff]/20 bg-[#c9b3ff]/10 text-[#ddd3ff]">
                        {uploadingImages ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UploadCloud className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-white">
                            Upload product images
                          </p>
                          {cloudinaryStatus ? (
                            <span
                              className={cn(
                                "rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-[.11em]",
                                cloudinaryStatus.configured
                                  ? "border-emerald-300/15 bg-emerald-300/[0.07] text-emerald-200"
                                  : "border-amber-300/15 bg-amber-300/[0.07] text-amber-100",
                              )}
                            >
                              {cloudinaryStatus.configured
                                ? `Cloudinary · ${cloudinaryStatus.cloudName}`
                                : "Cloudinary setup required"}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-[11px] leading-5 text-white/35">
                          Select multiple files. They upload securely and appear in
                          the library below.
                        </p>
                      </div>
                    </div>

                    <input
                      ref={productImageInputRef}
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                      onChange={uploadProductImages}
                      className="sr-only"
                    />
                    <Button
                      type="button"
                      onClick={() => productImageInputRef.current?.click()}
                      disabled={
                        uploadingImages || cloudinaryStatus?.configured === false
                      }
                      className="h-10 shrink-0 rounded-xl border border-[#c9b3ff]/20 bg-[#c9b3ff] px-4 text-xs font-bold text-[#17121e] hover:bg-[#d5c6ff] disabled:border-white/[0.06] disabled:bg-white/[0.06] disabled:text-white/25"
                    >
                      {uploadingImages ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UploadCloud className="mr-2 h-3.5 w-3.5" />
                      )}
                      {uploadingImages
                        ? "Uploading..."
                        : cloudinaryStatus?.configured === false
                          ? "Add credentials"
                          : "Choose images"}
                    </Button>
                  </div>

                  <Field
                    htmlFor="imagesCsv"
                    label="Raw image URL list"
                    helper="Paste one or several comma-separated URLs. The visual library below identifies every asset."
                  >
                    <Textarea
                      id="imagesCsv"
                      placeholder="https://..."
                      value={form.imagesCsv}
                      onChange={handleChange}
                      className={cn(
                        textareaClassName,
                        "min-h-[105px] font-mono text-[12px] leading-5 text-white/65",
                      )}
                    />
                  </Field>
                  {csvToArray(form.imagesCsv).length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-end justify-between gap-3 border-t border-white/[0.07] pt-5">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[.15em] text-white/35">
                            Visual asset library
                          </p>
                          <p className="mt-1 text-xs text-white/25">
                            Match each URL with the image customers will see.
                          </p>
                        </div>
                        <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[10px] font-semibold text-white/45">
                          {csvToArray(form.imagesCsv).length} image
                          {csvToArray(form.imagesCsv).length === 1 ? "" : "s"}
                        </span>
                      </div>

                      <div className="grid gap-3 xl:grid-cols-2">
                        {csvToArray(form.imagesCsv).map((imageUrl, index) => {
                          const imageDetails = getImageUrlDetails(imageUrl);
                          const libraryAsset = libraryImages.find((asset) => asset.url === imageUrl);

                          return (
                            <article
                              key={`${imageUrl}-${index}`}
                              draggable
                              onDragStart={() => setDraggedImageIndex(index)}
                              onDragEnd={() => setDraggedImageIndex(null)}
                              onDragOver={(event) => event.preventDefault()}
                              onDrop={(event) => dropProductImage(event, index)}
                              className={cn(
                                "group flex min-w-0 cursor-grab items-stretch gap-3 overflow-hidden rounded-[16px] border bg-[#111113] p-2.5 shadow-[inset_0_1px_rgba(255,255,255,.025)] transition active:cursor-grabbing",
                                draggedImageIndex === index && "opacity-45",
                                index === 0
                                  ? "border-[#c9b3ff]/25"
                                  : "border-white/[0.08] hover:border-white/[0.14]",
                              )}
                            >
                              <div className="relative h-[104px] max-h-[104px] w-[82px] min-w-[82px] max-w-[82px] shrink-0 self-start overflow-hidden rounded-[12px] border border-white/[0.08] bg-black/25">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={imageUrl}
                                  alt={`${form.name || "Product"} image ${index + 1}`}
                                  className="block h-[104px] max-h-[104px] w-[82px] max-w-[82px] object-cover transition duration-300 group-hover:scale-[1.03]"
                                />
                                <span className="absolute left-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full border border-white/15 bg-black/70 px-1.5 text-[9px] font-bold text-white/75 backdrop-blur">
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                              </div>

                              <div className="flex min-w-0 flex-1 flex-col py-1 pr-1">
                                <div className="flex min-w-0 items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      {index === 0 ? (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-[#c9b3ff]/20 bg-[#c9b3ff]/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[.12em] text-[#ded4ff]">
                                          <Crown className="h-2.5 w-2.5" /> Primary
                                        </span>
                                      ) : (
                                        <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[.12em] text-white/30">
                                          Gallery {index + 1}
                                        </span>
                                      )}
                                      <span
                                        className={cn(
                                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-[.1em]",
                                          imageDetails.isCloudinary
                                            ? "border-sky-300/15 bg-sky-300/[0.07] text-sky-200/70"
                                            : "border-white/[0.07] bg-white/[0.03] text-white/30",
                                        )}
                                      >
                                        <Cloud className="h-2.5 w-2.5" />
                                        {imageDetails.source}
                                      </span>
                                    </div>
                                    <p
                                      title={imageDetails.fileName}
                                      className="mt-2 truncate text-xs font-semibold text-white/75"
                                    >
                                      {imageDetails.fileName}
                                    </p>
                                    {libraryAsset ? <p className="mt-1 text-[9px] text-white/25">{[libraryAsset.width && libraryAsset.height ? `${libraryAsset.width}×${libraryAsset.height}` : null, libraryAsset.format?.toUpperCase(), libraryAsset.sizeBytes ? `${Math.max(1, Math.round(libraryAsset.sizeBytes / 1024))} KB` : null].filter(Boolean).join(" · ")}</p> : null}
                                  </div>
                                </div>

                                <div
                                  title={imageUrl}
                                  className="mt-2 flex min-w-0 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-black/20 px-2 py-1.5"
                                >
                                  <Link2 className="h-3 w-3 shrink-0 text-white/25" />
                                  <span className="truncate font-mono text-[9px] text-white/30">
                                    {imageUrl}
                                  </span>
                                </div>

                                <div className="mt-auto flex items-center gap-1.5 pt-2">
                                  <button type="button" onClick={() => moveProductImage(index, index - 1)} disabled={index === 0} title="Move image earlier" aria-label={`Move image ${index + 1} earlier`} className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-white/35 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"><ChevronUp className="h-3.5 w-3.5" /></button>
                                  <button type="button" onClick={() => moveProductImage(index, index + 1)} disabled={index === csvToArray(form.imagesCsv).length - 1} title="Move image later" aria-label={`Move image ${index + 1} later`} className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-white/35 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"><ChevronDown className="h-3.5 w-3.5" /></button>
                                  {index !== 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => makeImagePrimary(index)}
                                      className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-[#c9b3ff]/15 bg-[#c9b3ff]/[0.06] px-2 text-[8px] font-bold uppercase tracking-[.08em] text-[#d8ccff]/70 transition hover:bg-[#c9b3ff]/[0.12] hover:text-[#e5deff]"
                                    >
                                      <Crown className="h-3 w-3" /> Make primary
                                    </button>
                                  ) : null}
                                  {!imageDetails.isCloudinary && /^https?:\/\//i.test(imageUrl) ? (
                                    <button type="button" onClick={() => void importExternalImage(imageUrl, index)} disabled={Boolean(importingImageUrl)} className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-sky-300/15 bg-sky-300/[0.055] px-2 text-[8px] font-bold uppercase tracking-[.08em] text-sky-200/65 transition hover:bg-sky-300/[0.11] disabled:opacity-35">{importingImageUrl === imageUrl ? <Loader2 className="h-3 w-3 animate-spin" /> : <Cloud className="h-3 w-3" />}Move</button>
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() => copyImageUrl(imageUrl)}
                                    title="Copy image URL"
                                    aria-label={`Copy image ${index + 1} URL`}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-white/35 transition hover:bg-white/[0.07] hover:text-white"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeProductImage(index)}
                                    title="Remove image"
                                    aria-label={`Remove image ${index + 1}`}
                                    className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg border border-rose-400/10 bg-rose-400/[0.035] text-rose-300/45 transition hover:border-rose-400/20 hover:bg-rose-400/[0.09] hover:text-rose-200"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-32 flex-col items-center justify-center rounded-[18px] border border-dashed border-white/[0.09] bg-black/10 px-5 text-center">
                      <ImageIcon className="h-5 w-5 text-white/20" />
                      <p className="mt-2 text-xs font-semibold text-white/40">
                        No product images added yet
                      </p>
                      <p className="mt-1 text-[10px] text-white/25">
                        Paste a Cloudinary or external URL above to preview it here.
                      </p>
                    </div>
                  )}
                </FormSection>

                <FormSection
                  title="Celebrity favorite"
                  icon={<Sparkles className="h-3.5 w-3.5" />}
                >
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
                <FormSection
                  title="Search metadata"
                  icon={<Search className="h-3.5 w-3.5" />}
                >
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

          <div className="flex shrink-0 flex-col gap-3 border-t border-white/[0.08] bg-[#151517]/95 px-4 py-4 shadow-[0_-18px_45px_rgba(0,0,0,.2)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="hidden items-center gap-2.5 text-[11px] text-white/30 sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-white/[0.07] bg-white/[0.025] text-white/35">
                <FileText className="h-3.5 w-3.5" />
              </span>
              Storefront, discovery and SEO data update together.
            </div>
            <div className="grid w-full grid-cols-[minmax(0,.7fr)_minmax(0,1.3fr)] gap-2.5 sm:flex sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-12 rounded-xl border border-white/[0.09] bg-white/[0.025] px-5 text-sm font-semibold text-white/55 hover:border-white/[0.16] hover:bg-white/[0.065] hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || (isEditing && (detailLoading || Boolean(detailError)))}
                className="group h-12 rounded-xl border border-[#c9b3ff]/20 bg-[#c9b3ff] px-6 text-sm font-bold text-[#17121e] shadow-[0_10px_28px_rgba(201,179,255,.16),inset_0_1px_rgba(255,255,255,.45)] transition hover:-translate-y-0.5 hover:bg-[#d4c4ff] hover:shadow-[0_14px_34px_rgba(201,179,255,.24)] disabled:translate-y-0 disabled:border-white/5 disabled:bg-white/10 disabled:text-white/25 disabled:shadow-none"
              >
                {loading ? "Saving..." : isEditing ? "Save changes" : "Publish product"}
                {!loading ? (
                  <ChevronRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
                ) : null}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
