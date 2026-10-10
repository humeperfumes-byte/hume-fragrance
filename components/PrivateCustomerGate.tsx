"use client";
import { usePathname } from "next/navigation";
import { isPrivateCustomerPath } from "@/lib/private-customer-path";
export default function PrivateCustomerGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return isPrivateCustomerPath(pathname) ? null : children;
}
