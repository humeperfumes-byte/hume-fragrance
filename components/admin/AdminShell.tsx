"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Brain,
  Download,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
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
  { title: "Intelligence", url: "/admin/intelligence", icon: Brain },
  { title: "AI Visibility", url: "/admin/ai-visibility", icon: Sparkles },
  { title: "Orders", url: "/admin/orders", icon: ShoppingBag },
  { title: "Tracking", url: "/admin/tracking", icon: Truck },
  { title: "Checkouts", url: "/admin/checkouts", icon: ShoppingCart },
  { title: "Cart Leads", url: "/admin/cart", icon: ShoppingBasket },
  { title: "Coupon Leads", url: "/admin/coupon-leads", icon: Ticket },
  { title: "Customers", url: "/admin/customers", icon: Users },
  { title: "Catalog", url: "/admin/products", icon: Package },
  { title: "Content", url: "/admin/blogs", icon: FileText },
  { title: "Data Export", url: "/admin/data-export", icon: Download },
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
    <div className="flex h-full flex-col bg-[#111111]">
      <div className="border-b border-white/10 px-5 py-5">
        <h2 className="text-base font-semibold text-white">HUME Admin</h2>
        <p className="mt-1 text-xs text-white/45">Operations</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-xs font-medium text-white/35">Main</p>
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.url);
            return (
              <Link
                key={item.url}
                href={`${item.url}${marketQuery}`}
                onClick={onNavigate}
                className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-black"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
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

  const updateMarket = (nextMarket: "india" | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("market", nextMarket);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="admin-shell dark min-h-screen overflow-x-hidden bg-[#111111] text-foreground">
      <div className="flex min-h-screen min-w-0">
        <aside className="hidden w-60 shrink-0 border-r border-white/10 md:block">
          <AdminNav />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 max-w-full shrink-0 items-center gap-2 border-b border-white/10 bg-[#111111]/95 px-3 backdrop-blur sm:gap-3 md:px-6">
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
              <p className="truncate text-xs font-medium text-white/70 sm:text-sm">Operations Dashboard</p>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] p-1 sm:gap-2">
              <button
                type="button"
                onClick={() => updateMarket("india")}
                className={`h-8 rounded px-2 text-xs font-semibold transition-colors sm:px-3 ${
                  market === "india"
                    ? "bg-white text-black"
                    : "text-white/55 hover:bg-white/8 hover:text-white"
                }`}
              >
                India
              </button>
              <button
                type="button"
                onClick={() => updateMarket("all")}
                className={`h-8 rounded px-2 text-xs font-semibold transition-colors sm:px-3 ${
                  market === "all"
                    ? "bg-white text-black"
                    : "text-white/55 hover:bg-white/8 hover:text-white"
                }`}
              >
                All
              </button>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-white/55">Online</span>
            </div>
          </header>

          <main className="custom-scrollbar min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] border-white/10 bg-[#111111] p-0 text-white">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <AdminNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
