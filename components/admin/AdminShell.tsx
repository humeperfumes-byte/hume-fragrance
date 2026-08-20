"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  ChevronRight,
  Download,
  FileText,
  Handshake,
  ImageIcon,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessagesSquare,
  MessageSquareText,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  ShoppingBasket,
  ShoppingCart,
  Sparkles,
  Ticket,
  Truck,
  Warehouse,
  Users,
  QrCode,
} from "lucide-react";
import { logoutAdmin } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { parseAdminMarket } from "@/lib/admin-market";
import { AdminDateWindowControl } from "@/components/admin/AdminDateWindowControl";
import { AdminAiInsightDock } from "@/components/admin/AdminAiInsights";

const navItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "QR Campaigns", url: "/admin/flyer-campaigns", icon: QrCode },
  { title: "QR Studio", url: "/admin/qr-generator", icon: QrCode },
  { title: "AI Visibility", url: "/admin/ai-visibility", icon: Sparkles },
  { title: "Catalog", url: "/admin/products", icon: Package },
  { title: "Content", url: "/admin/blogs", icon: FileText },
  { title: "Images", url: "/admin/images", icon: ImageIcon },
  { title: "Reviews", url: "/admin/reviews", icon: MessageSquareText },
  { title: "Templates", url: "/admin/templates", icon: MessagesSquare },
  { title: "Partnerships", url: "/admin/partnerships", icon: Handshake },
  { title: "Feedback", url: "/admin/feedback", icon: MessageSquare },
  { title: "Orders", url: "/admin/orders", icon: ShoppingBag },
  { title: "Invoice Engine", url: "/bill", icon: FileText },
  { title: "Tracking", url: "/admin/tracking", icon: Truck },
  { title: "Stock Requests", url: "/admin/stock-notify", icon: Bell },
  { title: "Stock", url: "/admin/stock", icon: Warehouse },
  { title: "Checkouts", url: "/admin/checkouts", icon: ShoppingCart },
  { title: "Cart Leads", url: "/admin/cart", icon: ShoppingBasket },
  { title: "Coupons", url: "/admin/coupon-leads", icon: Ticket },
  { title: "Customers", url: "/admin/customers", icon: Users },
  { title: "Login Activity", url: "/admin/login-activity", icon: LogIn },
  { title: "Settings", url: "/admin/settings", icon: Settings },
  { title: "Data Export", url: "/admin/data-export", icon: Download },
];

const navGroups = [
  {
    label: "Workspace",
    items: navItems.filter((item) =>
      [
        "Dashboard",
        "QR Campaigns",
        "QR Studio",
        "AI Visibility",
        "Catalog",
        "Content",
        "Images",
        "Reviews",
        "Templates",
        "Partnerships",
      ].includes(item.title),
    ),
  },
  {
    label: "Sales",
    items: navItems.filter((item) =>
      [
        "Orders",
        "Invoice Engine",
        "Tracking",
        "Checkouts",
        "Cart Leads",
        "Coupons",
      ].includes(item.title),
    ),
  },
  {
    label: "Inventory",
    items: navItems.filter((item) => ["Stock", "Stock Requests"].includes(item.title)),
  },
  {
    label: "People & system",
    items: navItems.filter((item) =>
      ["Customers", "Feedback", "Login Activity", "Settings", "Data Export"].includes(item.title),
    ),
  },
];

function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const market = parseAdminMarket(searchParams.get("market"));
  const navParams = new URLSearchParams();
  navParams.set("market", market);
  const hours = searchParams.get("hours");
  if (hours) navParams.set("hours", hours);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (from) navParams.set("from", from);
  if (to) navParams.set("to", to);
  const marketQuery = `?${navParams.toString()}`;

  const handleLogout = async () => {
    await logoutAdmin();
    toast({ title: "Logged out successfully" });
    onNavigate?.();
    router.push("/admin/login");
  };

  return (
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_10%_0%,rgba(201,179,255,.055),transparent_23%),#101012]">
      <div className="px-3 pb-2 pt-3">
        <div className="flex items-center gap-3 rounded-[20px] border border-white/[0.08] bg-[#19191c] p-3 shadow-[inset_0_1px_rgba(255,255,255,.04),0_14px_40px_rgba(0,0,0,.16)]">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[#c9b3ff]/25 bg-[linear-gradient(145deg,rgba(201,179,255,.16),rgba(201,179,255,.055))] text-sm font-bold text-[#ddd2ff] shadow-[inset_0_1px_rgba(255,255,255,.1)]">H<span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#19191c] bg-[#80f0b2]" /></div>
          <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate text-sm font-semibold leading-tight text-white">HUME</h2><span className="rounded-full bg-[#c9b3ff]/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[.12em] text-[#c9b3ff]/75">Admin</span></div><p className="mt-1 truncate text-[10px] text-white/32">Operations command system</p></div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-white/25"><ChevronRight className="h-3.5 w-3.5" /></div>
        </div>
      </div>

      <nav className="custom-scrollbar flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-4">
          {navGroups.map((group) => (
            <div key={group.label} className="rounded-[18px] border border-white/[0.045] bg-white/[0.012] p-1.5">
              <div className="mb-1.5 flex items-center gap-2 px-2.5 pt-2"><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/24">{group.label}</p><span className="h-px flex-1 bg-gradient-to-r from-white/[0.08] to-transparent" /></div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname.startsWith(item.url);
                  return (
                    <Link
                      key={item.url}
                      href={`${item.url}${marketQuery}`}
                      onClick={onNavigate}
                      className={`group relative flex h-11 items-center gap-3 overflow-hidden rounded-[13px] border px-2.5 text-sm font-medium transition duration-300 ${
                        active
                          ? "border-white bg-white text-[#111114] shadow-[0_8px_24px_rgba(0,0,0,.22)]"
                          : "border-transparent text-white/52 hover:border-white/[0.08] hover:bg-white/[0.045] hover:text-white"
                      }`}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] border transition ${active ? "border-black/[0.07] bg-black/[0.045] text-[#17131e]" : "border-white/[0.06] bg-white/[0.025] text-white/30 group-hover:border-[#c9b3ff]/15 group-hover:bg-[#c9b3ff]/[0.07] group-hover:text-[#d3c2ff]"}`}><item.icon className="h-3.5 w-3.5" /></span>
                      <span className="min-w-0 flex-1 truncate">{item.title}</span>
                      {active ? <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#9d80ee] shadow-[0_0_8px_rgba(157,128,238,.7)]" /><ChevronRight className="h-3.5 w-3.5 text-black/35" /></span> : <ChevronRight className="h-3.5 w-3.5 translate-x-1 text-white/0 transition group-hover:translate-x-0 group-hover:text-white/30" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="p-3 pt-1">
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-10 w-full items-center gap-3 rounded-[13px] border border-transparent px-3 text-sm font-medium text-white/42 transition hover:border-rose-400/10 hover:bg-rose-400/[0.055] hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const market = parseAdminMarket(searchParams.get("market"));
  const currentItem =
    navItems
      .filter((item) => pathname.startsWith(item.url))
      .sort((a, b) => b.url.length - a.url.length)[0] ?? navItems[0];

  const updateMarket = (nextMarket: "india" | "out_of_india") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("market", nextMarket);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="admin-shell dark min-h-screen overflow-x-hidden bg-[#0e0e10] text-foreground">
      <div className="flex min-h-screen min-w-0">
        <aside className="hidden w-[17rem] shrink-0 border-r border-white/[0.08] bg-[#111113] md:block">
          <AdminNav />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 max-w-full shrink-0 items-center gap-2 border-b border-white/[0.08] bg-[#111113]/95 px-3 backdrop-blur-xl sm:gap-3 md:px-6">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="h-9 w-9 rounded-md text-white/75 hover:bg-white/8 hover:text-white md:hidden"
              aria-label="Open admin navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold uppercase tracking-[0.13em] text-white/30">
                HUME fragrance
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-white sm:text-base">
                {currentItem.title}
              </p>
            </div>
            <AdminDateWindowControl />
            <AdminAiInsightDock />
            <div className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.035] p-1 sm:gap-2">
              <button
                type="button"
                onClick={() => updateMarket("india")}
                className={`h-8 rounded-md px-2 text-xs font-semibold transition-colors sm:px-3 ${
                  market === "india"
                    ? "bg-[#c9b3ff] text-[#121016]"
                    : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                India
              </button>
              <button
                type="button"
                onClick={() => updateMarket("out_of_india")}
                className={`h-8 rounded-md px-2 text-xs font-semibold transition-colors sm:px-3 ${
                  market === "out_of_india"
                    ? "bg-[#c9b3ff] text-[#121016]"
                    : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                Out of India
              </button>
            </div>
            <div className="hidden items-center gap-2 rounded-lg border border-emerald-400/15 bg-emerald-400/10 px-3 py-2 xl:flex">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              <span className="text-xs font-semibold text-emerald-100/80">Live</span>
            </div>
          </header>

          <main className="custom-scrollbar min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto bg-[radial-gradient(circle_at_80%_-10%,rgba(201,179,255,.055),transparent_24%),#0e0e10] p-3 sm:p-4 md:p-5 xl:p-6">
            <div className="admin-page-frame">{children}</div>
          </main>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[290px] border-white/10 bg-[#111113] p-0 text-white">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <AdminNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
