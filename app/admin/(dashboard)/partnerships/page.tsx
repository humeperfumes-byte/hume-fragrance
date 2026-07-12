import { PartnershipEmailPanel } from "@/components/admin/PartnershipEmailPanel";

export const dynamic = "force-dynamic";

export default function PartnershipsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-xs font-medium text-white/45">B2B Wholesale Desk</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Partnership pitches</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/45">
          Compose, live preview, and dispatch boutique retail partnership proposals directly to foreign store buyers and facilities.
        </p>
      </div>

      <PartnershipEmailPanel />
    </div>
  );
}
