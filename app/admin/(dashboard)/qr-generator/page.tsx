import type { Metadata } from "next";
import QRGeneratorStudio from "./QRGeneratorStudio";

export const metadata: Metadata = {
  title: "Brand QR Generator Studio | HUME Admin",
  description: "Design custom star-pattern QR codes with custom logos, body patterns, and SVG exports.",
};

export const dynamic = "force-dynamic";

export default function AdminQRStudioPage() {
  return <QRGeneratorStudio />;
}
