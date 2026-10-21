// Bklit UI: shadcn-style copy-in chart components on visx 4 + Motion (MIT core; components copied into libs/bklit,
// see libs/bklit/SOURCE.txt). Styled through CSS variables (--chart-*), animated on enter.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AreaChart } from './bklit/charts/area-chart';
import { Area } from './bklit/charts/area';
import { BarChart } from './bklit/charts/bar-chart';
import { Bar } from './bklit/charts/bar';
import { BarXAxis } from './bklit/charts/bar-x-axis';
import { BarYAxis } from './bklit/charts/bar-y-axis';
import { ChartBrush } from './bklit/charts/chart-brush';
import { ChartBrushLayout } from './bklit/charts/chart-brush-layout';
import { ChartTooltip } from './bklit/charts/tooltip';
import { Grid } from './bklit/charts/grid';
import { XAxis } from './bklit/charts/x-axis';
import { YAxis } from './bklit/charts/y-axis';
import { PieChart } from './bklit/charts/pie-chart';
import { PieSlice } from './bklit/charts/pie-slice';
import { PieCenter } from './bklit/charts/pie-center';
import { Legend, LegendItem as LegendItemComponent, LegendLabel, LegendMarker } from './bklit/charts/legend';
import twCss from './bklit/bklit.css';
import { COLORS, INK, series, channels, stack, stackKeys, slot, size } from '../data.js';

document.getElementById('lib').textContent = 'Bklit UI (17de6a9, Oct 2026)';
// Bklit reads its palette from CSS variables; point them at the shared benchmark palette.
const style = document.createElement('style');
style.textContent = twCss + `\n:root{--chart-1:${COLORS[0]};--chart-2:${COLORS[1]};--chart-3:${COLORS[2]};--chart-4:${COLORS[3]};--chart-5:${COLORS[4]};
  --chart-line-primary:${COLORS[0]};--chart-line-secondary:${COLORS[1]};--chart-grid:${INK.grid};--chart-label:${INK.muted};
  --chart-foreground:${INK.text};--chart-foreground-muted:${INK.muted};--chart-background:${INK.surface};--foreground:${INK.text};
  --border:${INK.axis};--muted:${INK.grid};--chart-tooltip-background:#fff}
  section{overflow:hidden} /* stacked columns overflow their plot (Bklit stacked-domain bug); keep it inside its panel */`;
document.head.append(style);
const mount = (id, el) => createRoot(slot(id)).render(el);
const fill = (id) => ({ width: '100%', height: size(id).height });
// Bklit sizes charts by aspect ratio (as its own benchmark adapter does); match the slot, minus any legend row.
const ratio = (id, minus = 0) => `${size(id).width} / ${size(id).height - minus}`;

const daily = series.map((d) => ({ date: d.date, value: d.value }));
function TimeSeries() {
  return (<div style={fill('ts')}>
    <ChartBrushLayout data={daily} enabled height={56}
      brushStrip={(b) => (<AreaChart data={daily} animationDuration={0} style={{ aspectRatio: 'unset', height: '100%' }} margin={{ top: 4, right: 12, bottom: 4, left: 40 }}>
        <Area dataKey="value" animate={false} fill="var(--chart-line-primary)" fillOpacity={0.15} showHighlight={false} strokeWidth={1.5} />
        <ChartBrush initialSelection={b.brushSelection ?? undefined} onSelectionChange={b.onBrushSelectionChange} />
      </AreaChart>)}>
      {(b) => (<AreaChart data={daily} xDomain={b.xDomain} xDomainSlotCount={b.xDomainSlotCount} style={{ aspectRatio: 'unset', height: '100%' }} margin={{ top: 10, right: 12, bottom: 28, left: 40 }}>
        <Grid horizontal />
        <Area dataKey="value" fill="var(--chart-line-primary)" fillOpacity={0.15} strokeWidth={2} />
        <YAxis /><XAxis /><ChartTooltip />
      </AreaChart>)}
    </ChartBrushLayout></div>);
}
function Bars() {
  return (<div style={fill('bar')}>
    <BarChart data={channels} xDataKey="name" orientation="horizontal" margin={{ left: 110, right: 24, top: 8, bottom: 24 }} aspectRatio={ratio('bar')}>
      <Grid horizontal={false} vertical />
      <Bar dataKey="value" fill={COLORS[0]} lineCap={3} />
      <BarYAxis /><ChartTooltip showCrosshair={false} />
    </BarChart></div>);
}
const legendItems = stackKeys.map((k, i) => ({ label: k, value: 0, color: COLORS[i] }));
function Stacked() {
  return (<div style={{ ...fill('stack'), display: 'flex', flexDirection: 'column' }}>
    <Legend items={legendItems} className="flex flex-row justify-end gap-3 text-xs"><LegendItemComponent className="flex items-center gap-1.5"><LegendMarker /><LegendLabel /></LegendItemComponent></Legend>
    <div>
      <BarChart data={stack} xDataKey="month" stacked margin={{ left: 40, right: 8, top: 8, bottom: 28 }} aspectRatio={ratio('stack', 28)}>
        <Grid horizontal />
        {stackKeys.map((k, i) => <Bar key={k} dataKey={k} fill={COLORS[i]} />)}
        <BarXAxis /><ChartTooltip />
      </BarChart></div></div>);
}
function Donut() {
  const data = channels.map((d, i) => ({ label: d.name, value: d.value, color: COLORS[i] }));
  const r = Math.min(size('donut').width, size('donut').height) - 40;
  return (<div style={{ ...fill('donut'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <PieChart data={data} size={r} innerRadius={r * 0.3}>
      {data.map((d, i) => <PieSlice key={d.label} index={i} />)}
      <PieCenter defaultLabel="Revenue" />
    </PieChart></div>);
}
mount('ts', <TimeSeries />); mount('bar', <Bars />); mount('stack', <Stacked />); mount('donut', <Donut />);
