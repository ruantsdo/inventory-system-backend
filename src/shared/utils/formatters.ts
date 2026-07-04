import { format, isValid, parse } from "date-fns";

export function formatDate(date: string): Date {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const parsed = parse(date, "dd/MM/yyyy", new Date());
    if (isValid(parsed)) {
      return new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
    }
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const parsed = parse(date, "yyyy-MM-dd", new Date());
    if (isValid(parsed)) {
      return new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
    }
  }

  const patternFormats = [
    "yyyy-MM-dd HH:mm:ss.SSSX",
    "yyyy-MM-dd HH:mm:ss.SSSXX",
    "yyyy-MM-dd HH:mm:ss.SSSXXX",
  ];

  for (const fmt of patternFormats) {
    try {
      const parsed = parse(date, fmt, new Date());
      if (isValid(parsed)) {
        return new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
      }
    } catch {}
  }

  const parsed = new Date(date);
  if (!isValid(parsed)) {
    throw new Error(`Data inválida: ${date}`);
  }

  const hasTimezone = /Z|[-+]\d{2}(?::?\d{2})?$/.test(date);
  if (hasTimezone) {
    return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
  }
  return new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
}

export function isValidDate(date: string): boolean {
  try {
    formatDate(date);
    return true;
  } catch {
    return false;
  }
}

export function formatToBRDate(date: Date): string {
  const isUtcMidnight =
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0;

  if (isUtcMidnight) {
    const localDate = new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0
    );
    return format(localDate, "dd/MM/yyyy");
  }
  return format(date, "dd/MM/yyyy");
}

export function formatToPatternDate(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (!isValid(d)) {
    throw new Error(`Data inválida: ${date}`);
  }

  const isUtcMidnight =
    d.getUTCHours() === 0 &&
    d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0 &&
    d.getUTCMilliseconds() === 0;

  if (isUtcMidnight) {
    const localDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
    return format(localDate, "yyyy-MM-dd HH:mm:ss.SSSXXX");
  }

  return format(d, "yyyy-MM-dd HH:mm:ss.SSSXXX");
}
