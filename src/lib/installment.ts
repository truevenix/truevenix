import type { CSSProperties } from "react";

/* ------------------------------------------------------------------ *
 * Money
 * ------------------------------------------------------------------ */

/** ₦72,000 — no decimals, Nigerian grouping. */
export function naira(amount: number): string {
  return `\u20A6${Math.round(amount).toLocaleString("en-NG")}`;
}

/** 72000 -> "72,000" (when the ₦ is rendered as its own element). */
export function amountOnly(amount: number): string {
  return Math.round(amount).toLocaleString("en-NG");
}

/**
 * Split a total into `count` instalments that sum back to the total exactly.
 * Values are rounded to the nearest ₦100 so the schedule reads cleanly; any
 * rounding difference is absorbed by the final payment.
 */
export function splitInstallments(total: number, count: number): number[] {
  if (count <= 1) return [total];

  const STEP = 100;
  const per = Math.ceil(total / count / STEP) * STEP;
  const last = total - per * (count - 1);

  // Guard against pathological totals (very small values) where rounding up
  // would make the final payment negative — fall back to a flat split.
  if (last <= 0) {
    const flat = Math.floor(total / count);
    const parts = Array.from({ length: count }, () => flat);
    parts[count - 1] = total - flat * (count - 1);
    return parts;
  }

  const parts = Array.from({ length: count }, () => per);
  parts[count - 1] = last;
  return parts;
}

/** True when every instalment is the same figure ("4 × ₦18,000"). */
export function isFlatSplit(parts: number[]): boolean {
  return parts.every((p) => p === parts[0]);
}

export type Installment = {
  index: number;
  amount: number;
  /** "Today" for the first charge, else "13 Sep" style. */
  label: string;
  /** "Paid" | "Due" copy for the trailing status. */
  status: "paid" | "scheduled";
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Builds the payment schedule shown inside the phone: first charge today,
 * the rest on the same day of each following month.
 */
export function buildSchedule(
  total: number,
  count: number,
  from: Date = new Date(),
): Installment[] {
  const parts = splitInstallments(total, count);

  return parts.map((amount, index) => {
    if (index === 0) {
      return { index, amount, label: "Today", status: "paid" as const };
    }
    const d = new Date(from.getFullYear(), from.getMonth() + index, 1);
    // clamp the day so 31 Jan + 1 month never spills into March
    const daysInMonth = new Date(
      d.getFullYear(),
      d.getMonth() + 1,
      0,
    ).getDate();
    const day = Math.min(from.getDate(), daysInMonth);

    return {
      index,
      amount,
      label: `${day} ${MONTHS[d.getMonth()]}`,
      status: "scheduled" as const,
    };
  });
}

/* 
 * Theming — mirrors the `withAlpha` helper used by the RN mockups so the
 * section can be driven by the same category theme as the Expo app.
 */

export function withAlpha(hex: string, pct: number): string {
  const alpha = Math.round((pct / 100) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${alpha}`;
}

type ThemeStyle = CSSProperties & Record<`--${string}`, string>;

/** Expands a single brand colour into the tint ramp the section consumes. */
export function themeVars(primary?: string): ThemeStyle {
  // Get the current theme color from CSS variables if not provided
  const getPrimaryColor = (): string => {
    if (primary) return primary;
    
    // Try to get from CSS variable (set by your theme provider)
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const cssColor = getComputedStyle(root).getPropertyValue('--theme-primary').trim();
      if (cssColor) return cssColor;
    }
    
    // Fallback to default
    return TV_PRIMARY;
  };

  const themePrimary = getPrimaryColor();

  return {
    "--tv-primary": themePrimary,
    "--tv-primary-04": withAlpha(themePrimary, 4),
    "--tv-primary-08": withAlpha(themePrimary, 8),
    "--tv-primary-12": withAlpha(themePrimary, 12),
    "--tv-primary-20": withAlpha(themePrimary, 20),
    "--tv-primary-35": withAlpha(themePrimary, 35),
    "--tv-primary-60": withAlpha(themePrimary, 60),
  } as ThemeStyle;
}

// These constants remain unchanged for backward compatibility
export const TV_PRIMARY = "#EC5518";
export const TV_INK = "#191F27";
export const TV_SHELL = "#0B0F19";