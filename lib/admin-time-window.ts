export type AdminTimeWindowOption = {
  label: string;
  hours: number;
};

export const ADMIN_TIME_WINDOW_OPTIONS: AdminTimeWindowOption[] = [
  { label: "Last 24 Hours", hours: 24 },
  { label: "Last 2 Days", hours: 48 },
  { label: "Last 3 Days", hours: 72 },
  { label: "Last 5 Days", hours: 120 },
  { label: "Last 7 Days", hours: 168 },
  { label: "Last 10 Days", hours: 240 },
  { label: "Last 15 Days", hours: 360 },
  { label: "Last 30 Days", hours: 720 },
  { label: "Last 90 Days", hours: 2160 },
];

function parseCustomDate(value: string | string[] | null | undefined): Date | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatRangeDate(value: Date): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(value);
}

export function parseAdminTimeWindow(
  value: string | string[] | null | undefined,
  from?: string | string[] | null,
  to?: string | string[] | null,
) {
  const customFrom = parseCustomDate(from);
  const customTo = parseCustomDate(to);
  if (customFrom && customTo && customFrom.getTime() <= customTo.getTime()) {
    const hours = Math.max(1, Math.ceil((customTo.getTime() - customFrom.getTime()) / (60 * 60 * 1000)));
    return {
      hours,
      label: `${formatRangeDate(customFrom)} – ${formatRangeDate(customTo)}`,
      since: customFrom,
      until: customTo,
      isCustom: true,
    };
  }

  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw || "24");
  const hours = ADMIN_TIME_WINDOW_OPTIONS.some((option) => option.hours === parsed)
    ? parsed
    : 24;
  const option = ADMIN_TIME_WINDOW_OPTIONS.find((entry) => entry.hours === hours) ?? ADMIN_TIME_WINDOW_OPTIONS[0];

  return {
    hours,
    label: option.label,
    since: new Date(Date.now() - hours * 60 * 60 * 1000),
    until: new Date(),
    isCustom: false,
  };
}
