"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ADMIN_TIME_WINDOW_OPTIONS, parseAdminTimeWindow } from "@/lib/admin-time-window";

export function AdminDateWindowControl() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = parseAdminTimeWindow(searchParams.get("hours")).hours;

  const updateWindow = (hours: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("hours", hours);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex w-full min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 sm:w-auto">
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
        Window
      </span>
      <select
        value={current}
        onChange={(event) => updateWindow(event.target.value)}
        className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm font-medium text-white outline-none sm:flex-none"
      >
        {ADMIN_TIME_WINDOW_OPTIONS.map((option) => (
          <option key={option.hours} value={option.hours}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
