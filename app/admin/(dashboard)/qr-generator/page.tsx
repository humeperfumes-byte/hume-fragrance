import type { Metadata } from "next";
import QRGeneratorStudio from "./QRGeneratorStudio";
export const metadata: Metadata = {
  title: "QR Codes | HUME Admin",
  description: "Create dynamic QR codes for any destination and track visits.",
};
export const dynamic = "force-dynamic";
export default function AdminQRPage() {
  return <QRGeneratorStudio />;
}
