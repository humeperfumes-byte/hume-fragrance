"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Clock3,
  PackageSearch,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PerfumeData, getAverageRating } from "@/data/perfumes";
import { formatINR } from "@/lib/currency";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import { getProductPath } from "@/lib/product-route";
import { getClientCachedProducts } from "@/lib/client-products-cache";
import {
  getStoredCheckoutSessionId,
  readStoredCustomerAccount,
} from "@/lib/customer-account";
import { showNavigationLoadingToast } from "@/lib/navigation-loading";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

type AccountOrderItem = {
  id: string;
  name: string;
  inspiration?: string;
  size?: string;
  quantity: number;
  price: number;
  isGift?: boolean;
};

type AccountOrder = {
  id: string;
  orderNumber: string;
  status: string;
  checkoutChannel: string;
  paymentMethod: string | null;
  fulfillmentCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  trackingStatus: string | null;
  grandTotal: number | null;
  cartSnapshot: AccountOrderItem[];
  createdAt: string;
};

type AccountSearchResponse = {
  ok?: boolean;
  orders?: AccountOrder[];
};

type QuickAction = {
  label: string;
  detail: string;
  href: string;
  icon: typeof Search;
  tone: "dark" | "green" | "light";
};

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function isLikelyTrackingId(value: string) {
  const normalized = value.trim().replace(/\s+/g, "").toUpperCase();
  return /^[A-Z]{1,3}\d{8,14}[A-Z]{0,3}$/.test(normalized);
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}

function titleStatus(status: string) {
  return status
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function highlightMatch(text: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return text;
  const index = text.toLowerCase().indexOf(trimmed.toLowerCase());
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <span className="rounded bg-emerald-100 px-0.5 text-emerald-900">
        {text.slice(index, index + trimmed.length)}
      </span>
      {text.slice(index + trimmed.length)}
    </>
  );
}

function actionMatches(action: QuickAction, query: string) {
  if (!query) return true;
  const searchable = normalize(`${action.label} ${action.detail}`);
  return query
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => searchable.includes(term));
}

function productMatches(product: PerfumeData, query: string) {
  if (!query) return false;
  const searchable = normalize(
    [
      product.name,
      product.inspiration,
      product.inspirationBrand,
      product.category,
      product.gender,
    ].join(" "),
  );

  return query
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => searchable.includes(term));
}

function orderMatches(order: AccountOrder, query: string) {
  if (!query) return false;
  const searchable = normalize(
    [
      order.orderNumber,
      order.status,
      order.checkoutChannel,
      order.paymentMethod,
      order.fulfillmentCarrier,
      order.trackingNumber,
      order.trackingStatus,
      ...order.cartSnapshot.map((item) => item.name),
    ]
      .filter(Boolean)
      .join(" "),
  );

  return query
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => searchable.includes(term));
}

function sectionTitle(label: string, count?: number) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
        {label}
      </p>
      {typeof count === "number" ? (
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500">
          {count}
        </span>
      ) : null}
    </div>
  );
}

const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<PerfumeData[]>([]);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const timeout = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    let mounted = true;
    getClientCachedProducts()
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;
        setProducts(data);
      })
      .catch(() => {
        if (mounted) setProducts([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    const account = readStoredCustomerAccount(window.localStorage);
    const sessionId = account?.sessionId || getStoredCheckoutSessionId(window.localStorage);
    let active = true;

    if (!sessionId) {
      Promise.resolve().then(() => {
        if (active) setOrders([]);
      });
      return () => {
        active = false;
      };
    }

    fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((response) => response.json() as Promise<AccountSearchResponse>)
      .then((data) => {
        if (!active) return;
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      })
      .catch(() => {
        if (active) setOrders([]);
      });

    return () => {
      active = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timeout = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const normalizedQuery = normalize(query);
  const cleanTrackingQuery = query.trim().replace(/\s+/g, "").toUpperCase();

  const quickActions = useMemo<QuickAction[]>(() => {
    const actions: QuickAction[] = [
      {
        label: "My Account",
        detail: "Saved details and orders",
        href: "/account",
        icon: UserRound,
        tone: "dark",
      },
      {
        label: "Track Order",
        detail: "Open shipment tracking",
        href: "/track-order",
        icon: PackageSearch,
        tone: "green",
      },
      {
        label: "Shop All Perfumes",
        detail: "Browse every HUME fragrance",
        href: "/shop",
        icon: ShoppingBag,
        tone: "light",
      },
    ];

    if (isLikelyTrackingId(query)) {
      actions.unshift({
        label: `Track ${cleanTrackingQuery}`,
        detail: "Open this tracking ID directly",
        href: `/track-order/${encodeURIComponent(cleanTrackingQuery)}`,
        icon: Truck,
        tone: "green",
      });
    }

    return actions;
  }, [cleanTrackingQuery, query]);

  const actionResults = useMemo(
    () => quickActions.filter((action) => actionMatches(action, normalizedQuery)).slice(0, 4),
    [normalizedQuery, quickActions],
  );

  const productResults = useMemo(
    () =>
      normalizedQuery
        ? products.filter((product) => productMatches(product, normalizedQuery)).slice(0, 8)
        : products.slice(0, 6),
    [normalizedQuery, products],
  );

  const orderResults = useMemo(
    () =>
      normalizedQuery
        ? orders.filter((order) => orderMatches(order, normalizedQuery)).slice(0, 6)
        : orders.slice(0, 3),
    [normalizedQuery, orders],
  );

  const popularSearches = [
    "Sauvage",
    "Imagine",
    "Omb Leather",
    "Ultra Male",
    "HUME special",
    "track order",
  ];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) return;

    if (isLikelyTrackingId(query)) {
      onClose();
      showNavigationLoadingToast("Opening tracking");
      router.push(`/track-order/${encodeURIComponent(cleanTrackingQuery)}`);
      return;
    }

    if (productResults.length > 0) {
      const href = getProductPath(productResults[0]);
      onClose();
      showNavigationLoadingToast();
      router.push(href);
      return;
    }

    onClose();
    showNavigationLoadingToast();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  const overlay = (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[120] bg-[#f7f7f8]"
        >
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-x-hidden px-3 sm:px-5">
            <form
              onSubmit={handleSubmit}
              className="sticky top-0 z-10 flex min-w-0 items-center gap-2 border-b border-zinc-200 bg-[#f7f7f8]/95 py-2.5 backdrop-blur sm:gap-3 sm:py-3"
            >
              <Search size={18} className="shrink-0 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="h-10 min-w-0 flex-1 bg-transparent text-base font-medium tracking-tight text-zinc-950 outline-none placeholder:text-zinc-400 sm:h-12 sm:text-lg"
              />
              <button
                type="button"
                onClick={handleClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm transition-colors hover:text-zinc-950 sm:h-10 sm:w-10"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </form>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-3 sm:py-6">
              <div className="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-[0.78fr_1.22fr]">
                <aside className="space-y-4">
                  <section className="rounded-[1.35rem] border border-zinc-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                    {sectionTitle("Quick actions")}
                    <div className="space-y-2">
                      {actionResults.map((action) => (
                        <ActionResult
                          key={`${action.label}-${action.href}`}
                          action={action}
                          onClose={onClose}
                        />
                      ))}
                    </div>
                  </section>

                  <section className="rounded-[1.35rem] border border-zinc-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                    {sectionTitle("Try searching")}
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setQuery(term)}
                          className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-white hover:text-zinc-950"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </section>
                </aside>

                <div className="space-y-4">
                  <section className="rounded-[1.35rem] border border-zinc-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                    {sectionTitle("My orders and tracking", orderResults.length)}
                    {orders.length === 0 ? (
                      <EmptyState
                        icon={UserRound}
                        title="No account orders yet"
                        description="After checkout, your saved orders and tracking links will appear here."
                      />
                    ) : orderResults.length > 0 ? (
                      <div className="space-y-2">
                        {orderResults.map((order) => (
                          <OrderResult
                            key={order.id}
                            order={order}
                            query={query}
                            onClose={onClose}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={PackageSearch}
                        title="No matching orders"
                        description="Try order number, product name, status, or tracking ID."
                      />
                    )}
                  </section>

                  <section className="rounded-[1.35rem] border border-zinc-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                    {sectionTitle("Perfumes", productResults.length)}
                    {productResults.length > 0 ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {productResults.map((product) => (
                          <ProductResultCard
                            key={product.id}
                            perfume={product}
                            onClose={onClose}
                            query={query}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Sparkles}
                        title="No perfume match"
                        description="Search by perfume name, inspiration, brand direction, category, or gender."
                      />
                    )}
                  </section>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(overlay, document.body);
};

function ActionResult({
  action,
  onClose,
}: {
  action: QuickAction;
  onClose: () => void;
}) {
  const Icon = action.icon;
  const toneClass =
    action.tone === "dark"
      ? "bg-zinc-950 text-white"
      : action.tone === "green"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-zinc-100 text-zinc-700";

  return (
    <Link
      href={action.href}
      onClick={() => {
        onClose();
        showNavigationLoadingToast();
      }}
      className="group flex min-w-0 items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3 transition-colors hover:border-zinc-200 hover:bg-white"
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-zinc-950">
          {action.label}
        </span>
        <span className="block truncate text-xs text-zinc-500">
          {action.detail}
        </span>
      </span>
      <ArrowRight className="h-4 w-4 text-zinc-300 transition-colors group-hover:text-zinc-950" />
    </Link>
  );
}

function OrderResult({
  order,
  query,
  onClose,
}: {
  order: AccountOrder;
  query: string;
  onClose: () => void;
}) {
  const href = order.trackingNumber
    ? order.trackingUrl || `/track-order/${encodeURIComponent(order.trackingNumber)}`
    : "/account";
  const firstItem = order.cartSnapshot[0];

  return (
    <Link
      href={href}
      onClick={() => {
        onClose();
        showNavigationLoadingToast(order.trackingNumber ? "Opening tracking" : "Opening account");
      }}
      className="group flex min-w-0 gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3 transition-colors hover:border-zinc-200 hover:bg-white"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        {order.trackingNumber ? <Truck className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-zinc-950">
            {highlightMatch(order.orderNumber, query)}
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            {titleStatus(order.status)}
          </span>
        </span>
        <span className="mt-1 block truncate text-xs text-zinc-500">
          {firstItem ? `${firstItem.name} + ${Math.max(0, order.cartSnapshot.length - 1)} more` : "Order details"}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <Clock3 className="h-3 w-3" />
          {formatDate(order.createdAt)}
          {order.trackingNumber ? ` / ${order.trackingNumber}` : ""}
        </span>
      </span>
      <span className="shrink-0 text-sm font-semibold text-zinc-950">
        {order.grandTotal !== null ? formatINR(order.grandTotal) : ""}
      </span>
    </Link>
  );
}

function ProductResultCard({
  perfume,
  onClose,
  query,
}: {
  perfume: PerfumeData;
  onClose: () => void;
  query: string;
}) {
  const router = useRouter();
  const blurDataURL =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZyI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjQyIiBmaWxsPSIjZWVlY2VjIi8+PC9zdmc+";
  const avgRating = getAverageRating(perfume.reviews);
  const productPath = getProductPath(perfume);
  const cardImage = withCloudinaryTransforms(perfume.images[0], { width: 260 });

  return (
    <Link
      href={productPath}
      onClick={() => {
        onClose();
        showNavigationLoadingToast();
      }}
      onMouseEnter={() => router.prefetch(productPath)}
      className="group flex min-w-0 gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3 transition-colors hover:border-zinc-200 hover:bg-white"
    >
      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
        <Image
          src={cardImage}
          alt={perfume.name}
          fill
          sizes="80px"
          quality={55}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          placeholder="blur"
          blurDataURL={blurDataURL}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            {perfume.gender}
          </span>
          <span className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
            {perfume.category}
          </span>
        </div>
        <h4 className="line-clamp-1 text-sm font-semibold text-zinc-950">
          {highlightMatch(perfume.name, query)}
        </h4>
        <p className="mt-1 line-clamp-1 text-xs italic text-zinc-500">
          Inspired by {highlightMatch(perfume.inspiration, query)}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-950">
            {formatINR(perfume.price)}
          </span>
          <span className="text-xs text-zinc-400">* {avgRating}</span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Search;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[132px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-5 text-center">
      <Icon className="h-7 w-7 text-zinc-300" />
      <p className="mt-3 text-sm font-semibold text-zinc-900">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-500">{description}</p>
    </div>
  );
}

export default SearchOverlay;
