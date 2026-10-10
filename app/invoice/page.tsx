import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { checkAdminToken } from "@/lib/admin-auth";
import InvoiceWorkspace from "@/components/invoice/InvoiceWorkspace";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Invoice workspace | HUME", robots: { index: false, follow: false } };
export default async function InvoicePage() {
  if (!await checkAdminToken()) redirect("/admin/login");
  return <InvoiceWorkspace />;
}
