"use client";

import { useEffect, useState } from "react";
import SiteLoading from "@/components/SiteLoading";

export default function Loading() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 15000);
    return () => window.clearTimeout(timer);
  }, []);
  return <div>
    <SiteLoading dark title="Opening your workspace" description="Preparing your store dashboard." />
    {slow && <div className="px-5 pb-10 text-center text-sm text-white/70">
      <p>This page is taking longer than expected.</p>
      <button type="button" className="mt-4 rounded-lg border border-white/20 px-5 py-3" onClick={() => window.location.reload()}>Reload workspace</button>
      <button type="button" onClick={() => window.location.assign("/admin/login")} className="ml-4 underline">Return to sign-in</button>
    </div>}
  </div>;
}
