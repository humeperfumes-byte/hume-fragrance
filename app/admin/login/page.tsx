import { redirect } from "next/navigation";
import { checkAdminToken } from "@/lib/admin-auth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await checkAdminToken()) redirect("/admin/dashboard");
  return <AdminLoginForm />;
}
