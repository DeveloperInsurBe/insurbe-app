/**
 * Series colours used across the admin portal (validated: CVD + normal
 * vision pass; DAK green is < 3:1 on white, so values are always shown as
 * text in the legend, tooltip and table view).
 *
 * Kept out of Charts.tsx: constants exported from a "use client" module
 * are client references on the server, not values.
 */
export const SERIES = [
  { key: "TK", label: "TK", color: "#3b82f6" },
  { key: "DAK", label: "DAK", color: "#10b981" },
  { key: "private", label: "Private", color: "#820ad1" },
] as const;
