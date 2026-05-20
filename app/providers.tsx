"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/context/CartContext";
import NavigationLoadingToast from "@/components/NavigationLoadingToast";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const CartDrawer = dynamic(() => import("@/components/CartDrawer"), {
  ssr: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <CartProvider>
          {children}
          <NavigationLoadingToast />
          <Toaster />
          <Sonner />
          <CartDrawer />
        </CartProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
