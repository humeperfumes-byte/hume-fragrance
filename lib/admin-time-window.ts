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

export function parseAdminTimeWindow(value: string | string[] | null | undefined) {
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
  };
}
