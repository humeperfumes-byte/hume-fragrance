"use client";

import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import NavigationLoadingToast from "@/components/NavigationLoadingToast";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

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
