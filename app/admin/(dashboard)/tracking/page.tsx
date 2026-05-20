import { Metadata } from "next";
import TrackingSystemClient from "./TrackingSystemClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shipment Tracking | HUME Admin",
};

export default function TrackingPage() {
  return <TrackingSystemClient />;
}
