import { Settings, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { AdminSettingsControls } from "@/components/admin/AdminSettingsControls";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge className="mb-3 border-violet-400/20 bg-violet-400/10 text-violet-100 hover:bg-violet-400/10">
            <Settings className="mr-1 h-3.5 w-3.5" />
            Settings
          </Badge>
          <h1 className="text-2xl font-semibold text-white">Admin Settings</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/45">
            This area is reserved for future switches, storefront controls, notification options, and operations settings.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
            <SlidersHorizontal className="h-7 w-7 text-white/40" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-white">Switches coming soon</h2>
          <p className="mt-3 text-sm leading-6 text-white/45">
            We will use this page for controlled feature toggles and brand operations settings after the exact rules are finalized.
            No live setting is active here yet.
          </p>
        </div>
      </section>

      <AdminSettingsControls />
    </div>
  );
}
