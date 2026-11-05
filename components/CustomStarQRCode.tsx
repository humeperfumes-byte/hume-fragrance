"use client";

import { useMemo } from "react";
import { makeQrSvg } from "@/lib/qr-svg";

// Retained for legacy imports; use the same design as admin previews and downloads.
export default function CustomStarQRCode({ value, size = 500, className = "" }: {
  value: string;
  size?: number;
  className?: string;
}) {
  const svg = useMemo(() => {
    return makeQrSvg(value || "https://www.humefragrance.com");
  }, [value]);
  return <div role="img" aria-label="QR code" className={`inline-block bg-white [&_svg]:h-full [&_svg]:w-full ${className}`} style={{ width: size, height: size, maxWidth: "100%" }} dangerouslySetInnerHTML={{ __html: svg }} />;
}
