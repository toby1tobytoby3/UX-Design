// Area chart with a crosshair, a dot on every series, a date pill on the x-axis and a compact tooltip.
// Clean-room rebuild of the pattern in this entry (Bklit UI look), plus the part Bklit leaves out:
// keyboard reading (← → Home End), a live announcement and a data table, so the chart isn't mouse-only.
import { useId, useMemo, useState } from "react";

// ---- Placeholder data: swap for real values -------------------------------------------------------
const TITLE = "Revenue vs costs";
const SERIES = [
  { key: "revenue", label: "Revenue", stroke: "#3f3f46", fill: "#71717a" }, // zinc-700 / zinc-500
  { key: "costs", label: "Costs", stroke: "#a1a1aa", fill: "#d4d4d8" }, // zinc-400 / zinc-300
] as const;
const DATA = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2026, 0, i + 1),
  revenue: Math.round(9000 + 2400 * Math.sin(i / 4.5) + 600 * Math.sin(i / 1.7)),
  costs: Math.round(4200 - 1300 * Math.sin(i / 5 + 0.8)),
}));
// ------------------------------------------------------------------------------------------------

type Row = (typeof DATA)[number];
const W = 720, H = 280, PAD = { top: 16, right: 16, bottom: 36, left: 16 };
const fmtNum = new Intl.NumberFormat("en-GB");
const fmtDay = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
const fmtTick = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

// Smooth line through points (Catmull-Rom converted to cubic Béziers).
function smooth(pts: [number, number][]) {
  return pts.reduce((d, p, i, a) => {
    if (i === 0) return `M${p[0]},${p[1]}`;
    const p0 = a[i - 2] ?? a[i - 1], p1 = a[i - 1], p3 = a[i + 1] ?? p;
    const c1 = [p1[0] + (p[0] - p0[0]) / 6, p1[1] + (p[1] - p0[1]) / 6];
    const c2 = [p[0] - (p3[0] - p1[0]) / 6, p[1] - (p3[1] - p1[1]) / 6];
    return `${d} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p[0]},${p[1]}`;
  }, "");
}

export default function AreaCrosshairChart() {
  const id = useId();
  const [active, setActive] = useState<number | null>(null);

  const { x, y, paths, ticks } = useMemo(() => {
    const max = Math.max(...DATA.flatMap((d) => SERIES.map((s) => d[s.key]))) * 1.1;
    const x = (i: number) => PAD.left + (i / (DATA.length - 1)) * (W - PAD.left - PAD.right);
    const y = (v: number) => PAD.top + (1 - v / max) * (H - PAD.top - PAD.bottom);
    const base = H - PAD.bottom;
    const paths = SERIES.map((s) => {
      const line = smooth(DATA.map((d, i) => [x(i), y(d[s.key])]));
      return { ...s, line, area: `${line} L${x(DATA.length - 1)},${base} L${x(0)},${base} Z` };
    });
    const ticks = [0, 7, 15, 22, DATA.length - 1];
    return { x, y, paths, ticks };
  }, []);

  const row: Row | null = active === null ? null : DATA[active];
  const announce = row ? `${fmtDay.format(row.date)}: ${SERIES.map((s) => `${s.label} ${fmtNum.format(row[s.key])}`).join(", ")}` : "";

  function onKeyDown(e: React.KeyboardEvent) {
    const last = DATA.length - 1, cur = active ?? -1;
    const next = { ArrowRight: Math.min(last, cur + 1), ArrowLeft: Math.max(0, cur === -1 ? last : cur - 1), Home: 0, End: last }[e.key];
    if (next !== undefined) { e.preventDefault(); setActive(next); }
    if (e.key === "Escape") setActive(null);
  }
  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - PAD.left) / (W - PAD.left - PAD.right)) * (DATA.length - 1));
    setActive(Math.max(0, Math.min(DATA.length - 1, i)));
  }

  return (
    <figure className="w-full max-w-3xl rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <figcaption id={`${id}-title`} className="mb-1 font-semibold tracking-tight text-zinc-900">{TITLE}</figcaption>
      <p id={`${id}-hint`} className="mb-3 text-sm text-zinc-500">Last 30 days. Hover, or focus the chart and use ← → to read each day.</p>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          role="group"
          tabIndex={0}
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-hint`}
          onKeyDown={onKeyDown}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setActive(null)}
          onBlur={() => setActive(null)}
        >
          <defs>
            {paths.map((p) => (
              <linearGradient key={p.key} id={`${id}-${p.key}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={p.fill} stopOpacity={0.35} />
                <stop offset="100%" stopColor={p.fill} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={PAD.left} x2={W - PAD.right} y1={PAD.top + f * (H - PAD.top - PAD.bottom)} y2={PAD.top + f * (H - PAD.top - PAD.bottom)} className="stroke-zinc-200" strokeDasharray="3 4" />
          ))}
          {paths.map((p) => (
            <g key={p.key} aria-hidden="true">
              <path d={p.area} fill={`url(#${id}-${p.key})`} />
              <path d={p.line} fill="none" stroke={p.stroke} strokeWidth={2} />
            </g>
          ))}
          {ticks.map((i) => active !== i && (
            <text key={i} x={x(i)} y={H - 10} textAnchor={i === 0 ? "start" : i === DATA.length - 1 ? "end" : "middle"} className="fill-zinc-500 text-[11px]" aria-hidden="true">
              {fmtTick.format(DATA[i].date)}
            </text>
          ))}
          {row && active !== null && (
            <g aria-hidden="true">
              <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={H - PAD.bottom} className="stroke-zinc-400" />
              {SERIES.map((s) => (
                <g key={s.key}>
                  <circle cx={x(active)} cy={y(row[s.key])} r={9} fill={s.stroke} opacity={0.15} />
                  <circle cx={x(active)} cy={y(row[s.key])} r={4} fill={s.stroke} stroke="white" strokeWidth={1.5} />
                </g>
              ))}
              {/* Date pill on the axis */}
              <rect x={x(active) - 30} y={H - 26} width={60} height={22} rx={11} className="fill-zinc-900" />
              <text x={x(active)} y={H - 11} textAnchor="middle" className="fill-white text-[11px] font-medium">{fmtTick.format(row.date)}</text>
            </g>
          )}
        </svg>

        {row && active !== null && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-2 w-44 rounded-lg border border-zinc-200 bg-white/95 p-2.5 text-sm shadow-md"
            style={{ left: `clamp(0px, calc(${(x(active) / W) * 100}% + 12px), calc(100% - 11rem))` }}
          >
            <div className="mb-1.5 border-b border-zinc-100 pb-1.5 font-medium text-zinc-900">{fmtDay.format(row.date)}</div>
            {SERIES.map((s) => (
              <div key={s.key} className="flex items-center gap-2 text-zinc-600">
                <span className="size-2 rounded-full" style={{ background: s.stroke }} />
                <span className="flex-1">{s.label}</span>
                <span className="font-medium tabular-nums text-zinc-900">{fmtNum.format(row[s.key])}</span>
              </div>
            ))}
          </div>
        )}
        {/* What a screen reader hears as the crosshair moves */}
        <p className="sr-only" aria-live="polite">{announce}</p>
      </div>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-zinc-600 hover:text-zinc-900">Show the data as a table</summary>
        <table className="mt-2 w-full text-left">
          <caption className="sr-only">{TITLE}, daily values</caption>
          <thead><tr className="text-zinc-500"><th scope="col" className="py-1 font-medium">Date</th>{SERIES.map((s) => <th key={s.key} scope="col" className="py-1 text-right font-medium">{s.label}</th>)}</tr></thead>
          <tbody>
            {DATA.map((d) => (
              <tr key={d.date.toISOString()} className="border-t border-zinc-100">
                <th scope="row" className="py-1 font-normal text-zinc-700">{fmtDay.format(d.date)}</th>
                {SERIES.map((s) => <td key={s.key} className="py-1 text-right tabular-nums">{fmtNum.format(d[s.key])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
