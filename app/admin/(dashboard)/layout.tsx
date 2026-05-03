import { redirect } from "next/navigation";
import { checkAdminToken } from "@/lib/admin-auth";
import { AppSidebar } from "@/components/admin/AppSidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await checkAdminToken();
  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="dark bg-[#0a0a0a] text-foreground min-h-screen">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 w-full flex flex-col min-h-screen overflow-hidden bg-[#0a0a0a]">
          <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/5 px-6 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10">
            <SidebarTrigger className="-ml-1 text-white/70 hover:text-white" />
            <div className="h-4 w-[1px] bg-white/10 mx-2" />
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Midnight Command Center</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/50">Core Online</span>
            </div>
          </header>
          <div className="flex-1 p-8 md:p-10 overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
