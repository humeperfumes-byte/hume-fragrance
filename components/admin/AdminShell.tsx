"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  Download,
  FileText,
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
  Users,
} from "lucide-react";
import { logoutAdmin } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { parseAdminMarket } from "@/lib/admin-market";

const navItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "AI Visibility", url: "/admin/ai-visibility", icon: Sparkles },
  { title: "Catalog", url: "/admin/products", icon: Package },
  { title: "Content", url: "/admin/blogs", icon: FileText },
  { title: "Images", url: "/admin/images", icon: ImageIcon },
  { title: "Reviews", url: "/admin/reviews", icon: MessageSquareText },
  { title: "Templates", url: "/admin/templates", icon: MessagesSquare },
  { title: "Feedback", url: "/admin/feedback", icon: MessageSquare },
  { title: "Orders", url: "/admin/orders", icon: ShoppingBag },
  { title: "Tracking", url: "/admin/tracking", icon: Truck },
  { title: "Stock Requests", url: "/admin/stock-notify", icon: Bell },
  { title: "Checkouts", url: "/admin/checkouts", icon: ShoppingCart },
  { title: "Cart Leads", url: "/admin/cart", icon: ShoppingBasket },
  { title: "Coupon Leads", url: "/admin/coupon-leads", icon: Ticket },
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
        "AI Visibility",
        "Catalog",
        "Content",
        "Images",
        "Reviews",
        "Templates",
      ].includes(item.title),
    ),
  },
  {
    label: "Sales",
    items: navItems.filter((item) =>
      [
        "Orders",
        "Tracking",
        "Stock Requests",
        "Checkouts",
        "Cart Leads",
        "Coupon Leads",
      ].includes(item.title),
    ),
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
  const marketQuery = `?${navParams.toString()}`;

  const handleLogout = async () => {
    await logoutAdmin();
    toast({ title: "Logged out successfully" });
    onNavigate?.();
    router.push("/admin/login");
  };

  return (
    <div className="flex h-full flex-col bg-[#0c0c0c]">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white text-sm font-bold text-black">
            H
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold leading-tight text-white">HUME Admin</h2>
            <p className="mt-0.5 text-xs text-white/40">Operations desk</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/25">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname.startsWith(item.url);
                  return (
                    <Link
                      key={item.url}
                      href={`${item.url}${marketQuery}`}
                      onClick={onNavigate}
                      className={`group flex h-10 items-center gap-3 rounded-lg border px-3 text-sm font-medium transition-colors ${
                        active
                          ? "border-white/12 bg-white text-black"
                          : "border-transparent text-white/60 hover:border-white/10 hover:bg-white/[0.045] hover:text-white"
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          active ? "text-black" : "text-white/35 group-hover:text-white/80"
                        }`}
                      />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-white/60 transition-colors hover:bg-red-500/10 hover:text-red-300"
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

  const updateMarket = (nextMarket: "india" | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("market", nextMarket);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="admin-shell dark min-h-screen overflow-x-hidden bg-[#0b0b0b] text-foreground">
      <div className="flex min-h-screen min-w-0">
        <aside className="hidden w-[17rem] shrink-0 border-r border-white/10 bg-[#0c0c0c] md:block">
          <AdminNav />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 max-w-full shrink-0 items-center gap-2 border-b border-white/10 bg-[#0d0d0d]/95 px-3 backdrop-blur sm:gap-3 md:px-6">
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
            <div className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.035] p-1 sm:gap-2">
              <button
                type="button"
                onClick={() => updateMarket("india")}
                className={`h-8 rounded-md px-2 text-xs font-semibold transition-colors sm:px-3 ${
                  market === "india"
                    ? "bg-white text-black"
                    : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                India
              </button>
              <button
                type="button"
                onClick={() => updateMarket("all")}
                className={`h-8 rounded-md px-2 text-xs font-semibold transition-colors sm:px-3 ${
                  market === "all"
                    ? "bg-white text-black"
                    : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                All
              </button>
            </div>
            <div className="hidden items-center gap-2 rounded-lg border border-emerald-400/15 bg-emerald-400/10 px-3 py-2 md:flex">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              <span className="text-xs font-semibold text-emerald-100/80">Live</span>
            </div>
          </header>

          <main className="custom-scrollbar min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto bg-[linear-gradient(180deg,#101010_0%,#0b0b0b_220px)] p-3 sm:p-4 md:p-6 xl:p-8">
            {children}
          </main>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[290px] border-white/10 bg-[#0c0c0c] p-0 text-white">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <AdminNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
