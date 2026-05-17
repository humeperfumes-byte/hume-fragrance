"use server";

import { cookies } from "next/headers";

export async function loginAdmin(token: string) {
  const expectedToken = process.env.ADMIN_API_TOKEN;
  if (!expectedToken) return { success: true };

  if (token === expectedToken) {
    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    cookieStore.set("hume_admin_internal", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return { success: true };
  }

  return { success: false, error: "Invalid API Token" };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  cookieStore.delete("hume_admin_internal");
}
