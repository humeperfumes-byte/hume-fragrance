"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { LayoutDashboard, ShoppingBag, ShoppingCart, Package, FileText, LogOut, Brain } from "lucide-react";
import { logoutAdmin } from "@/app/admin/actions";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

const navItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Behavioral Intelligence", url: "/admin/intelligence", icon: Brain },
  { title: "Orders", url: "/admin/orders", icon: ShoppingBag },
  { title: "Checkouts CRM", url: "/admin/checkouts", icon: ShoppingCart },
  { title: "Catalog", url: "/admin/products", icon: Package },
  { title: "Blog Posts", url: "/admin/blogs", icon: FileText },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAdmin();
    toast({ title: "Logged out successfully" });
    router.push("/admin/login");
  };

  return (
    <Sidebar className="border-r border-white/5 bg-[#0a0a0a]">
      <SidebarHeader className="px-6 py-10">
        <div className="flex flex-col">
          <h2 className="font-serif text-3xl tracking-[0.05em] font-medium text-white">HUME</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-[1px] w-4 bg-primary/40" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Control Room</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold mb-4">Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname.startsWith(item.url)}
                    className="h-11 rounded-xl px-4 transition-all duration-300 hover:bg-white/5 active:scale-95 group data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-[18px] w-[18px] transition-colors group-hover:text-primary" />
                      <span className="text-[13px] font-medium tracking-wide">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 bg-black/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout} 
              className="text-white/40 hover:text-red-400 hover:bg-red-500/5 h-11 rounded-xl transition-all duration-300"
            >
              <LogOut className="h-[18px] w-[18px]" />
              <span className="text-[13px] font-medium">Logout Session</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
