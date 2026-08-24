const NAVIGATION_STACK_KEY = "hume_mobile_navigation_stack_v1";
const MAX_STACK_LENGTH = 40;

const TOP_LEVEL_PATHS = new Set([
  "/",
  "/shop",
  "/hume-special",
  "/bestseller",
  "/discovery-set",
  "/blog",
  "/naturals",
  "/spaces",
]);

export function isMobileNavigationHub(pathname: string) {
  return TOP_LEVEL_PATHS.has(pathname);
}

export type StorefrontBreadcrumb = { label: string; href?: string };

const ROUTE_LABELS: Record<string, string> = {
  account: "Account",
  accessory: "Accessory",
  blog: "Blog",
  checkout: "Checkout",
  contact: "Contact",
  "corporate-gifting": "Corporate Gifting",
  "discovery-set": "Discovery Set",
  feedback: "Feedback",
  invoice: "Invoice",
  naturals: "Naturals",
  product: "Product",
  search: "Search",
  shop: "Shop",
  spaces: "Spaces",
  "track-order": "Track Order",
  "wedding-gifts": "Wedding Gifts",
};

function titleCaseRoutePart(value: string) {
  const decoded = decodeURIComponent(value).replace(/^hume-/, "");
  const productName = decoded.split("-inspired-by-")[0];
  return (ROUTE_LABELS[productName] || productName.replaceAll("-", " "))
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getStorefrontBreadcrumbs(pathname: string): StorefrontBreadcrumb[] {
  if (isMobileNavigationHub(pathname) || pathname.startsWith("/admin")) return [];

  const parts = pathname.split("/").filter(Boolean);
  const current = titleCaseRoutePart(parts.at(-1) || "Home");
  const home: StorefrontBreadcrumb = { label: "Home", href: "/" };

  if (pathname.startsWith("/product/") || pathname.startsWith("/accessory/") || pathname.startsWith("/recommendations/") || pathname.startsWith("/alternatives/") || pathname.startsWith("/alternatives-to/") || pathname.startsWith("/inspired-by/") || pathname.startsWith("/best/") || pathname.startsWith("/coming-soon/")) {
    return [home, { label: "Shop", href: "/shop" }, { label: current }];
  }
  if (pathname.startsWith("/blog/")) return [home, { label: "Blog", href: "/blog" }, { label: current }];
  if (pathname.startsWith("/track-order/")) return [home, { label: "Track Order", href: "/track-order" }, { label: current }];
  if (pathname.startsWith("/discovery-set/")) return [home, { label: "Discovery Set", href: "/discovery-set" }, { label: current }];
  if (pathname.startsWith("/naturals/")) return [home, { label: "Naturals", href: "/naturals" }, { label: current }];
  if (pathname.startsWith("/spaces/")) return [home, { label: "Spaces", href: "/spaces" }, { label: current }];
  if (pathname === "/checkout") return [home, { label: "Shop", href: "/shop" }, { label: "Checkout" }];

  return [home, { label: ROUTE_LABELS[parts[0]] || current }];
}

export function getMobileBackFallback(pathname: string) {
  if (pathname.startsWith("/product/") || pathname.startsWith("/accessory/")) return "/shop";
  if (pathname.startsWith("/blog/")) return "/blog";
  if (pathname.startsWith("/track-order/")) return "/track-order";
  if (pathname.startsWith("/discovery-set/")) return "/discovery-set";
  if (pathname.startsWith("/naturals/")) return "/naturals";
  if (pathname.startsWith("/spaces/")) return "/spaces";
  if (
    pathname.startsWith("/recommendations/") ||
    pathname.startsWith("/alternatives/") ||
    pathname.startsWith("/alternatives-to/") ||
    pathname.startsWith("/inspired-by/") ||
    pathname.startsWith("/best/") ||
    pathname.startsWith("/coming-soon/")
  ) return "/shop";
  if (pathname === "/checkout") return "/shop";
  return "/";
}

export function readMobileNavigationStack() {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(NAVIGATION_STACK_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === "string") : [];
  } catch {
    return [];
  }
}

export function recordMobileNavigation(locationKey: string) {
  const current = readMobileNavigationStack();
  if (current.at(-1) === locationKey) return current;

  const previousIndex = current.lastIndexOf(locationKey);
  const next = previousIndex >= 0
    ? current.slice(0, previousIndex + 1)
    : [...current, locationKey].slice(-MAX_STACK_LENGTH);
  try {
    window.sessionStorage.setItem(NAVIGATION_STACK_KEY, JSON.stringify(next));
  } catch {
    // Navigation still works through the contextual fallback when storage is unavailable.
  }
  return next;
}
