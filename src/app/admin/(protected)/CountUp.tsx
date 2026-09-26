"use client";

import { useEffect, useLayoutEffect, useState } from "react";

// Layout effect in the browser (no flash of the final value), plain effect on the server.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const FORMATS = {
  number: new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }),
  euro: new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }),
};

/**
 * Counts up from 0 to `value` on mount. The settled text is exactly the
 * formatted value, so it reads the same as the static number it replaces.
 */
export default function CountUp({
  value,
  format = "number",
  prefix = "",
  delay = 150,
  duration = 900,
}: {
  value: number;
  format?: keyof typeof FORMATS;
  /** Plain text before the number, e.g. "€" for amounts shown as "€5". */
  prefix?: string;
  delay?: number;
  duration?: number;
}) {
  const formatter = FORMATS[format];
  const [display, setDisplay] = useState(value);

  useIsoLayoutEffect(() => {
    if (!value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    setDisplay(0);

    let frame = 0;
    const start = performance.now() + delay;

    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      const eased = 1 - Math.pow(1 - t, 3);

      setDisplay(t >= 1 ? value : Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, delay, duration]);

  return (
    <span className="tabular-nums">
      {prefix}
      {formatter.format(display)}
    </span>
  );
}
