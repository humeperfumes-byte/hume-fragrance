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
  { title: "Intelligence", url: "/admin/intelligence", icon: Brain },
  { title: "Orders", url: "/admin/orders", icon: ShoppingBag },
  { title: "Checkouts", url: "/admin/checkouts", icon: ShoppingCart },
  { title: "Catalog", url: "/admin/products", icon: Package },
  { title: "Content", url: "/admin/blogs", icon: FileText },
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
    <Sidebar className="border-r border-white/10 bg-[#111111]">
      <SidebarHeader className="px-5 py-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-white">HUME Admin</h2>
          <p className="text-xs font-medium text-white/45">Operations</p>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-3 px-3 text-xs font-medium text-white/35">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname.startsWith(item.url)}
                    className="group h-10 rounded-md px-3 transition-colors hover:bg-white/5 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-white/55 transition-colors group-hover:text-white/80" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-white/10 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout} 
              className="h-10 rounded-md text-white/55 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
