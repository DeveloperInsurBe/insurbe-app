"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MotionConfig, motion, useReducedMotion } from "framer-motion";

import type { MonthPoint } from "./data";
import { SERIES } from "./series";

type SeriesKey = (typeof SERIES)[number]["key"];

/**
 * Fade-and-rise entrance; honours prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.floor(entry.contentRect.width)),
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

function niceMax(value: number) {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude * 4 >= value) ?? 10;
  return step * magnitude * 4;
}

/**
 * Path for a bar segment with rounded top corners only.
 */
function roundedTop(x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h);

  return `M${x},${y + h}V${y + radius}Q${x},${y} ${x + radius},${y}H${
    x + w - radius
  }Q${x + w},${y} ${x + w},${y + radius}V${y + h}Z`;
}

/**
 * 12-month stacked bars (TK / DAK / Private) with hover tooltip and a
 * table view.
 */
export function TrendChart({ data }: { data: MonthPoint[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const reduceMotion = useReducedMotion();

  const height = 220;
  const margin = { top: 8, right: 4, bottom: 24, left: 28 };
  const innerW = Math.max(width - margin.left - margin.right, 0);
  const innerH = height - margin.top - margin.bottom;

  const totals = data.map((point) => point.TK + point.DAK + point.private);
  const max = niceMax(Math.max(...totals, 0));
  const band = data.length ? innerW / data.length : 0;
  const barW = Math.max(Math.min(band * 0.56, 30), 4);
  const y = (value: number) => (value / max) * innerH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));

  const seriesTotals = SERIES.map((series) => ({
    ...series,
    total: data.reduce((sum, point) => sum + point[series.key], 0),
  }));

  const hovered = hover !== null ? data[hover] : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {seriesTotals.map((series) => (
            <span key={series.key} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: series.color }} />
              {series.label}
              <span className="font-semibold text-gray-900">{series.total}</span>
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowTable((value) => !value)}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-[#820ad1] hover:bg-[#820ad1]/5"
        >
          {showTable ? "Show chart" : "Show table"}
        </button>
      </div>

      {showTable ? (
        <div className="mt-3 max-h-[240px] overflow-auto rounded-xl border border-gray-100">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gray-50 text-gray-500">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Month</th>
                {SERIES.map((series) => (
                  <th key={series.key} className="px-3 py-2 text-right font-semibold">
                    {series.label}
                  </th>
                ))}
                <th className="px-3 py-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((point, index) => (
                <tr key={point.month} className="border-t border-gray-100">
                  <td className="px-3 py-1.5 text-gray-700">{point.month}</td>
                  {SERIES.map((series) => (
                    <td key={series.key} className="px-3 py-1.5 text-right tabular-nums text-gray-900">
                      {point[series.key]}
                    </td>
                  ))}
                  <td className="px-3 py-1.5 text-right font-semibold tabular-nums text-gray-900">
                    {totals[index]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={ref} className="relative mt-3 h-[220px] w-full select-none">
          {width > 0 ? (
            <svg
              width={width}
              height={height}
              role="img"
              aria-label="Applications per month for the last 12 months, stacked by TK, DAK and private"
              onMouseLeave={() => setHover(null)}
            >
              <g transform={`translate(${margin.left},${margin.top})`}>
                {/* GRID */}
                {ticks.map((tick) => (
                  <g key={tick} transform={`translate(0,${innerH - y(tick)})`}>
                    <line x1={0} x2={innerW} stroke="#eef0f3" strokeWidth={1} />
                    <text
                      x={-8}
                      dy="0.32em"
                      textAnchor="end"
                      className="fill-gray-400 text-[10px] tabular-nums"
                    >
                      {tick}
                    </text>
                  </g>
                ))}

                {data.map((point, index) => {
                  const x = index * band + (band - barW) / 2;
                  let base = innerH;
                  const visible = SERIES.filter((series) => point[series.key] > 0);

                  return (
                    <g key={point.month}>
                      {hover === index ? (
                        <rect
                          x={index * band + 2}
                          y={0}
                          width={Math.max(band - 4, 0)}
                          height={innerH}
                          rx={6}
                          fill="#820ad1"
                          fillOpacity={0.05}
                        />
                      ) : null}

                      <motion.g
                        initial={reduceMotion ? false : { scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.6, delay: 0.15 + index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                        style={{ originY: 1, transformBox: "fill-box" }}
                      >
                        {visible.map((series, seriesIndex) => {
                          const h = y(point[series.key]);
                          const gap = seriesIndex > 0 ? 2 : 0;
                          const segmentH = Math.max(h - gap, 1);
                          base -= h;
                          const isTop = seriesIndex === visible.length - 1;

                          return isTop ? (
                            <path
                              key={series.key}
                              d={roundedTop(x, base, barW, segmentH, 4)}
                              fill={series.color}
                            />
                          ) : (
                            <rect
                              key={series.key}
                              x={x}
                              y={base}
                              width={barW}
                              height={segmentH}
                              fill={series.color}
                            />
                          );
                        })}
                      </motion.g>

                      {/* X LABEL (every other month on narrow screens) */}
                      {band >= 34 || index % 2 === data.length % 2 ? (
                        <text
                          x={index * band + band / 2}
                          y={innerH + 16}
                          textAnchor="middle"
                          className={`text-[10px] ${hover === index ? "fill-gray-900 font-semibold" : "fill-gray-400"}`}
                        >
                          {point.label}
                        </text>
                      ) : null}

                      {/* HIT TARGET */}
                      <rect
                        x={index * band}
                        y={0}
                        width={band}
                        height={innerH + margin.bottom}
                        fill="transparent"
                        onMouseEnter={() => setHover(index)}
                        onClick={() => setHover(index)}
                      />
                    </g>
                  );
                })}

                <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke="#d1d5db" strokeWidth={1} />
              </g>
            </svg>
          ) : null}

          {hovered && hover !== null ? (
            <div
              className="pointer-events-none absolute top-0 z-10 w-36 rounded-xl border border-gray-200 bg-white/95 p-2.5 text-xs shadow-lg backdrop-blur"
              style={{
                left: Math.min(
                  Math.max(margin.left + hover * band + band / 2 - 72, 0),
                  Math.max(width - 144, 0),
                ),
              }}
            >
              <p className="font-semibold text-gray-900">
                {new Date(`${hovered.month}-01T00:00:00Z`).toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </p>
              {[...SERIES].reverse().map((series) => (
                <p key={series.key} className="mt-1 flex items-center justify-between gap-2 text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm" style={{ background: series.color }} />
                    {series.label}
                  </span>
                  <span className="font-semibold tabular-nums text-gray-900">
                    {hovered[series.key as SeriesKey]}
                  </span>
                </p>
              ))}
              <p className="mt-1.5 flex justify-between border-t border-gray-100 pt-1.5 font-semibold text-gray-900">
                <span>Total</span>
                <span className="tabular-nums">{totals[hover]}</span>
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

/**
 * Ranked horizontal bars for one measure (single hue).
 */
export function BarList({
  items,
  color = "#820ad1",
  formatValue = (value: number) => String(value),
  emptyText = "No data yet",
}: {
  items: { label: string; value: number; hint?: string; href?: string }[];
  color?: string;
  formatValue?: (value: number) => string;
  emptyText?: string;
}) {
  const reduceMotion = useReducedMotion();
  const max = Math.max(...items.map((item) => item.value), 0);

  if (!items.length || max === 0) {
    return <p className="py-6 text-center text-xs text-gray-400">{emptyText}</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => {
        const label = (
          <span className="truncate text-sm font-medium text-gray-800">{item.label}</span>
        );

        return (
          <li key={`${item.label}-${index}`}>
            <div className="flex items-baseline justify-between gap-3">
              {item.href ? (
                <Link href={item.href} className="min-w-0 truncate hover:text-[#820ad1]">
                  {label}
                </Link>
              ) : (
                label
              )}
              <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-900">
                {formatValue(item.value)}
                {item.hint ? (
                  <span className="ml-1 text-xs font-normal text-gray-400">{item.hint}</span>
                ) : null}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <motion.div
                className="h-full rounded-full"
                style={{ background: color }}
                initial={reduceMotion ? false : { width: 0 }}
                animate={{ width: `${(item.value / max) * 100}%` }}
                transition={{ duration: 0.7, delay: 0.2 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Horizontal stacked bar for commission status (status colours, always
 * paired with a text label and amount).
 */
export function StatusStack({
  items,
}: {
  items: { label: string; value: number; count: number; color: string }[];
}) {
  const reduceMotion = useReducedMotion();
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div>
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-gray-100">
        {total > 0
          ? items
              .filter((item) => item.value > 0)
              .map((item, index) => (
                <motion.div
                  key={item.label}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{ background: item.color }}
                  initial={reduceMotion ? false : { width: 0 }}
                  animate={{ width: `${(item.value / total) * 100}%` }}
                  transition={{ duration: 0.7, delay: 0.25 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                />
              ))
          : null}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl bg-gray-50 p-2.5">
            <dt className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
              <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
              {item.label}
            </dt>
            <dd className="mt-1 text-base font-black tabular-nums text-gray-900">
              €{item.value}
              <span className="ml-1 text-[11px] font-medium text-gray-400">
                {item.count} {item.count === 1 ? "app" : "apps"}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
