import { redirect } from "next/navigation";
import { checkAdminToken } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await checkAdminToken();
  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
