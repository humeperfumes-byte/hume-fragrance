import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ClientGlobalOverlays from "@/components/ClientGlobalOverlays";
import BrowserRecoveryGuard from "@/components/BrowserRecoveryGuard";
import ConsentCaptureBanner from "@/components/ConsentCaptureBanner";
import ConsentTimelineTracker from "@/components/ConsentTimelineTracker";
import CartAnalyticsTracker from "@/components/CartAnalyticsTracker";
import ScrollRestoration from "@/components/ScrollRestoration";
import { SITE_URL } from "@/lib/site";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HUME Fragrance | Premium Inspired Perfumes in India | Shop Now",
    template: "%s | HUME Perfumes",
  },
  description:
    "HUME Fragrance is an Indian perfume brand from Kannauj that creates premium inspired alternatives to designer fragrances like Creed Aventus, Dior Sauvage and Tom Ford Oud Wood. EDP concentration, 8-12hr longevity, designed for Indian weather. Starting INR 499. Free shipping.",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  keywords: [
    "HUME Fragrance",
    "HUME perfume",
    "HUME perfumes India",
    "luxury fragrances",
    "modern perfume house",
    "premium fragrance interpretations",
    "affordable luxury perfume",
    "inspired perfumes India",
    "designer perfume alternatives",
    "best perfumes for Indian weather",
  ],
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "HUME Fragrance",
    url: SITE_URL,
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "HUME Fragrance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HUME Fragrance",
    description:
      "Premium inspired perfumes for men & women in India with refined quality and modern luxury.",
    images: ["/icon.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cloudflareBeaconToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body
        suppressHydrationWarning
        className={`${montserrat.variable} ${cormorant.variable} antialiased`}
      >
        <Providers>
          <BrowserRecoveryGuard />
          {children}
          <ClientGlobalOverlays />
          <ConsentCaptureBanner />
          <Suspense fallback={null}>
            <ConsentTimelineTracker />
          </Suspense>
          <Suspense fallback={null}>
            <CartAnalyticsTracker />
          </Suspense>
          <Suspense fallback={null}>
            <ScrollRestoration />
          </Suspense>
        </Providers>
        {cloudflareBeaconToken ? (
          <Script
            id="cloudflare-web-analytics"
            defer
            strategy="afterInteractive"
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: cloudflareBeaconToken })}
          />
        ) : null}
      </body>
    </html>
  );
}
