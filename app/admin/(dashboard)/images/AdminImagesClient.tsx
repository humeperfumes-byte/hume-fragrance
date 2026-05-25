"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import {
  Copy,
  ExternalLink,
  ImageIcon,
  Link as LinkIcon,
  Loader2,
  MessageCircle,
  Trash2,
  Upload,
} from "lucide-react";

import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type AdminImageAsset = {
  id: string;
  label: string;
  url: string;
  link: string | null;
  usage: string;
  tags: string[];
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
  updatedAt: string;
};

type DisplayImageAsset = AdminImageAsset & {
  builtIn?: boolean;
};

type AdminImagesClientProps = {
  initialImages: AdminImageAsset[];
};

const BUILT_IN_IMAGES: DisplayImageAsset[] = [
  {
    id: "builtin-order-success",
    label: "Order Success Template",
    url: "/images/email/order%20confirmation%20email%20hero%20image.png",
    link: null,
    usage: "order_success",
    tags: ["order", "success", "whatsapp"],
    mimeType: "image/png",
    sizeBytes: null,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    builtIn: true,
  },
];

const usageOptions = [
  { value: "order_success", label: "Order success" },
  { value: "offer", label: "Offer" },
  { value: "shipping", label: "Shipping" },
  { value: "general", label: "General" },
];

function absoluteUrl(url: string) {
  if (url.startsWith("http")) return url;
  if (typeof window === "undefined") return url;
  return `${window.location.origin}${url}`;
}

function formatSize(bytes: number | null) {
  if (!bytes) return "Built in";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function AdminImagesClient({ initialImages }: AdminImagesClientProps) {
  const [images, setImages] = useState<AdminImageAsset[]>(initialImages);
  const [uploadLabel, setUploadLabel] = useState("");
  const [uploadUsage, setUploadUsage] = useState("offer");
  const [uploadTags, setUploadTags] = useState("");
  const [urlLabel, setUrlLabel] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [urlUsage, setUrlUsage] = useState("offer");
  const [urlTags, setUrlTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [savingUrl, setSavingUrl] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allImages = useMemo<DisplayImageAsset[]>(() => {
    const builtInIds = new Set(BUILT_IN_IMAGES.map((image) => image.url));
    return [
      ...BUILT_IN_IMAGES,
      ...images.filter((image) => !builtInIds.has(image.url)).map((image) => ({ ...image, builtIn: false })),
    ];
  }, [images]);

  async function copyText(text: string, title: string) {
    await navigator.clipboard.writeText(text);
    toast({ title });
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast({ title: "Select an image first", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("label", uploadLabel || file.name.replace(/\.[^.]+$/, ""));
      formData.append("usage", uploadUsage);
      formData.append("tags", uploadTags);

      const response = await fetch("/api/admin/images/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");

      setImages((current) => [data.image as AdminImageAsset, ...current]);
      setUploadLabel("");
      setUploadTags("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast({ title: "Image uploaded" });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Upload failed",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveUrl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingUrl(true);
    try {
      const response = await fetch("/api/admin/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: urlLabel,
          url: urlValue,
          usage: urlUsage,
          tags: parseTags(urlTags),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Save failed");

      setImages((current) => [data.image as AdminImageAsset, ...current]);
      setUrlLabel("");
      setUrlValue("");
      setUrlTags("");
      toast({ title: "Image link saved" });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Save failed",
        variant: "destructive",
      });
    } finally {
      setSavingUrl(false);
    }
  }

  async function deleteImage(asset: DisplayImageAsset) {
    if (asset.builtIn) return;

    setDeletingId(asset.id);
    try {
      const response = await fetch(`/api/admin/images/${asset.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Delete failed");

      setImages((current) => current.filter((image) => image.id !== asset.id));
      toast({ title: "Image removed" });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Delete failed",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-300">
              <ImageIcon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl text-white">Image Library</h1>
              <p className="mt-1 text-sm text-white/45">
                Save customer update, order success, and offer images for quick reuse.
              </p>
            </div>
          </div>
        </div>
        <p className="max-w-md rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-5 text-white/45">
          WhatsApp web links can include image URLs in the message. Auto-attached media will need WhatsApp Business API later.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleUpload} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 text-white">
              <Upload className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-white">Upload Image</h2>
              <p className="text-xs text-white/40">PNG, JPG, WebP, or GIF up to 4 MB.</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 sm:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Image file</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="block w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-black"
              />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Label</span>
              <input
                value={uploadLabel}
                onChange={(event) => setUploadLabel(event.target.value)}
                placeholder="Order success image"
                className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-emerald-300/50"
              />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Usage</span>
              <select
                value={uploadUsage}
                onChange={(event) => setUploadUsage(event.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition-colors focus:border-emerald-300/50"
              >
                {usageOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Tags</span>
              <input
                value={uploadTags}
                onChange={(event) => setUploadTags(event.target.value)}
                placeholder="order, success, offer"
                className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-emerald-300/50"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 text-sm font-semibold text-black transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload to library
          </button>
        </form>

        <form onSubmit={handleSaveUrl} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 text-white">
              <LinkIcon className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-white">Save Image Link</h2>
              <p className="text-xs text-white/40">Use an existing CDN, public, or local image URL.</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Label</span>
              <input
                value={urlLabel}
                onChange={(event) => setUrlLabel(event.target.value)}
                placeholder="Summer offer image"
                required
                className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-emerald-300/50"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Image URL</span>
              <input
                value={urlValue}
                onChange={(event) => setUrlValue(event.target.value)}
                placeholder="https://... or /images/..."
                required
                className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-emerald-300/50"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Usage</span>
                <select
                  value={urlUsage}
                  onChange={(event) => setUrlUsage(event.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition-colors focus:border-emerald-300/50"
                >
                  {usageOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Tags</span>
                <input
                  value={urlTags}
                  onChange={(event) => setUrlTags(event.target.value)}
                  placeholder="offer, sale"
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-emerald-300/50"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingUrl}
            className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white text-sm font-semibold text-black transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
            Save link
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Saved Images</h2>
          <span className="text-xs text-white/35">{allImages.length} images</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {allImages.map((asset) => {
            const publicUrl = absoluteUrl(asset.url);
            return (
              <article key={asset.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                <div className="aspect-[1.6] bg-white/[0.04]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.url}
                    alt={asset.label}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-white">{asset.label}</h3>
                      <p className="mt-1 text-xs text-white/38">
                        {asset.usage.replace(/_/g, " ")} - {formatSize(asset.sizeBytes)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
                        asset.builtIn
                          ? "bg-sky-400/12 text-sky-200"
                          : "bg-emerald-400/12 text-emerald-200",
                      )}
                    >
                      {asset.builtIn ? "Built in" : "Saved"}
                    </span>
                  </div>

                  {asset.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {asset.tags.slice(0, 5).map((tag) => (
                        <span key={tag} className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] text-white/45">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => copyText(publicUrl, "Image URL copied")}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy URL
                    </button>
                    <button
                      type="button"
                      onClick={() => copyText(`${asset.label}: ${publicUrl}`, "WhatsApp image line copied")}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/8 text-xs font-semibold text-emerald-100 transition-colors hover:bg-emerald-300/12"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WA line
                    </button>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open
                    </a>
                    <button
                      type="button"
                      disabled={asset.builtIn || deletingId === asset.id}
                      onClick={() => deleteImage(asset)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-300/15 bg-rose-300/7 text-xs font-semibold text-rose-100 transition-colors hover:bg-rose-300/12 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      {deletingId === asset.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
