"use client";

import { useState } from "react";
import { CalendarRange, Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ADMIN_TIME_WINDOW_OPTIONS, parseAdminTimeWindow } from "@/lib/admin-time-window";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function toDateInput(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AdminDateWindowControl() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = parseAdminTimeWindow(
    searchParams.get("hours"),
    searchParams.get("from"),
    searchParams.get("to"),
  );
  const [customOpen, setCustomOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(() => toDateInput(current.since));
  const [customTo, setCustomTo] = useState(() => toDateInput(current.until));

  const updateWindow = (hours: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("hours", String(hours));
    params.delete("from");
    params.delete("to");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const applyCustomWindow = () => {
    if (!customFrom || !customTo) return;
    const from = new Date(`${customFrom}T00:00:00`);
    const to = new Date(`${customTo}T23:59:59.999`);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete("hours");
    params.set("from", from.toISOString());
    params.set("to", to.toISOString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setCustomOpen(false);
  };

  const handleCustomOpenChange = (open: boolean) => {
    if (open) {
      setCustomFrom(toDateInput(current.since));
      setCustomTo(toDateInput(current.until));
    }
    setCustomOpen(open);
  };

  return (
    <div className="flex shrink-0 items-center gap-1.5">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-[13px] border border-white/[0.09] bg-[#1b1b1e] text-left shadow-[inset_0_1px_rgba(255,255,255,.05)] outline-none transition hover:border-[#c9b3ff]/25 hover:bg-[#202024] focus-visible:ring-2 focus-visible:ring-[#c9b3ff]/35 xl:w-[190px] xl:justify-start xl:px-2"
          aria-label={`Date window: ${current.label}`}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] border border-[#c9b3ff]/15 bg-[#c9b3ff]/[0.08] text-[#d7c8ff]">
            <CalendarRange className="h-3.5 w-3.5" />
          </span>
          <span className="hidden min-w-0 flex-1 xl:block">
            <span className="block text-[8px] font-bold uppercase tracking-[0.17em] text-white/30">Date window</span>
            <span className="mt-0.5 block truncate text-xs font-semibold text-white/80">{current.label}</span>
          </span>
          <ChevronDown className="hidden h-3.5 w-3.5 shrink-0 text-white/30 transition-transform group-data-[state=open]:rotate-180 xl:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={9}
        className="z-[80] w-[220px] rounded-[18px] border border-white/10 bg-[#19191d]/[0.98] p-2 text-white shadow-[0_24px_70px_rgba(0,0,0,.58),inset_0_1px_rgba(255,255,255,.05)] backdrop-blur-xl"
      >
        <DropdownMenuLabel className="px-2.5 pb-2 pt-1.5">
          <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#c9b3ff]/65">Reporting period</span>
          <span className="mt-1 block text-xs font-normal text-white/35">Apply across the admin panel</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-1 mb-1.5 bg-white/[0.07]" />
        {ADMIN_TIME_WINDOW_OPTIONS.map((option) => {
          const active = option.hours === current.hours;
          return (
            <DropdownMenuItem
              key={option.hours}
              onSelect={() => updateWindow(option.hours)}
              className={`mb-0.5 flex h-10 cursor-pointer items-center rounded-[11px] px-2.5 text-xs font-medium outline-none transition focus:bg-white/[0.055] focus:text-white ${
                active
                  ? "bg-[#c9b3ff] text-[#16131b] focus:bg-[#d3c1ff] focus:text-[#16131b]"
                  : "text-white/58 hover:bg-white/[0.045] hover:text-white"
              }`}
            >
              <span className={`mr-2.5 h-1.5 w-1.5 rounded-full ${active ? "bg-[#5f478f]" : "bg-white/15"}`} />
              <span className="flex-1">{option.label}</span>
              {active ? <Check className="h-3.5 w-3.5" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>

    <Popover open={customOpen} onOpenChange={handleCustomOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-[13px] border text-xs font-semibold outline-none transition md:w-[92px] md:px-3 ${
            current.isCustom
              ? "border-[#c9b3ff]/35 bg-[#c9b3ff] text-[#16131b] shadow-[0_8px_25px_rgba(201,179,255,.13)]"
              : "border-white/[0.09] bg-[#1b1b1e] text-white/55 hover:border-[#c9b3ff]/25 hover:bg-[#202024] hover:text-white"
          }`}
          aria-label="Select a custom date range"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden md:inline">Custom</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={9}
        className="z-[80] w-[310px] rounded-[20px] border border-white/10 bg-[#19191d]/[0.98] p-4 text-white shadow-[0_24px_70px_rgba(0,0,0,.58),inset_0_1px_rgba(255,255,255,.05)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#c9b3ff]/15 bg-[#c9b3ff]/[0.08] text-[#d7c8ff]"><CalendarRange className="h-4 w-4" /></span>
          <div><p className="text-sm font-semibold text-white">Custom timeline</p><p className="mt-0.5 text-[10px] text-white/35">Choose any start and end date</p></div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <label className="space-y-1.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">From</span>
            <input type="date" value={customFrom} max={customTo || undefined} onChange={(event) => setCustomFrom(event.target.value)} className="h-10 w-full rounded-xl border border-white/10 bg-black/25 px-2.5 text-xs text-white outline-none [color-scheme:dark] focus:border-[#c9b3ff]/40" />
          </label>
          <label className="space-y-1.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">To</span>
            <input type="date" value={customTo} min={customFrom || undefined} max={toDateInput(new Date())} onChange={(event) => setCustomTo(event.target.value)} className="h-10 w-full rounded-xl border border-white/10 bg-black/25 px-2.5 text-xs text-white outline-none [color-scheme:dark] focus:border-[#c9b3ff]/40" />
          </label>
        </div>
        <button type="button" onClick={applyCustomWindow} disabled={!customFrom || !customTo || customFrom > customTo} className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-[#c9b3ff] text-xs font-bold text-[#16131b] transition hover:bg-[#d5c6ff] disabled:cursor-not-allowed disabled:opacity-40">Apply custom timeline</button>
      </PopoverContent>
    </Popover>
    </div>
  );
}
