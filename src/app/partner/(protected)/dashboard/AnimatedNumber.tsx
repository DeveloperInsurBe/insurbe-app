"use client";

import { useEffect, useLayoutEffect, useState } from "react";

// Runs before paint in the browser (no flash of the final value), and is a plain
// effect during SSR where layout effects don't exist.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type AnimatedNumberProps = {
  value: number;
  /** Text shown before the number, e.g. "EUR ". */
  prefix?: string;
  /** Wait before the count starts, so it lines up with the entrance animation. */
  delay?: number;
  duration?: number;
};

// Counts up from 0 to `value`. The final text is exactly String(value), so what
// the page shows once settled is identical to a plain `{value}`.
export default function AnimatedNumber({
  value,
  prefix = "",
  delay = 250,
  duration = 1100,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(String(value));

  useIsoLayoutEffect(() => {
    if (value === 0) {
      setDisplay("0");
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(String(value));
      return;
    }

    const decimals = (String(value).split(".")[1] ?? "").length;
    const zero = (0).toFixed(decimals);
    setDisplay(zero);

    let raf = 0;
    const start = performance.now() + delay;

    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      if (t >= 1) {
        setDisplay(String(value));
        return;
      }
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay((value * eased).toFixed(decimals));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, delay, duration]);

  return (
    <span className="tabular-nums">
      {prefix}
      {display}
    </span>
  );
}
