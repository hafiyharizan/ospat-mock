const DATE_FMT = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Australia/Brisbane",
});

const TIME_FMT = new Intl.DateTimeFormat("en-AU", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Australia/Brisbane",
});

const DATETIME_FMT = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Australia/Brisbane",
});

export function formatDate(iso: string): string {
  return DATE_FMT.format(new Date(iso));
}

export function formatTime(iso: string): string {
  return TIME_FMT.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return DATETIME_FMT.format(new Date(iso));
}

export function formatPct(value: number, signed = false): string {
  const fixed = value.toFixed(1);
  if (signed && value > 0) return `+${fixed}%`;
  return `${fixed}%`;
}

export function formatScore(value: number): string {
  return value.toFixed(0);
}
