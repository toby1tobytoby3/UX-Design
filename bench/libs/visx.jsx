// visx 4: React components wrapping D3 scales and shapes. Composable, unstyled.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { scaleLinear, scaleBand, scaleTime, scaleOrdinal } from '@visx/scale';
import { AreaClosed, LinePath, Bar, BarStack, Pie } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { Brush } from '@visx/brush';
import { LegendOrdinal } from '@visx/legend';
import { COLORS, INK, series, channels, stack, stackKeys, months, fmtK, slot, size } from '../data.js';

document.getElementById('lib').textContent = 'visx 4.0';
const ax = { stroke: INK.axis, tickStroke: INK.axis, tickLabelProps: { fill: INK.muted, fontSize: 11, fontFamily: 'system-ui' } };
const mount = (id, C) => { const s = size(id); createRoot(slot(id)).render(<C {...s} />); };

const vis0 = (dom) => series.filter((d) => d.date >= dom[0] && d.date <= dom[1]);
function TimeSeries({ width, height }) {
  const m = { t: 10, r: 12, b: 70, l: 40 }, bh = 36;
  const full = scaleTime({ domain: [series[0].date, series.at(-1).date], range: [m.l, width - m.r] });
  const [domain, setDomain] = React.useState([series[90].date, series.at(-1).date]);
  const x = scaleTime({ domain, range: [m.l, width - m.r] });
  const max = Math.max(...series.map((d) => d.value));
  const y = scaleLinear({ domain: [0, Math.max(...vis0(domain).map((d) => d.value))], range: [height - m.b, m.t], nice: true });
  const yb = scaleLinear({ domain: [0, max], range: [bh, 0] });
  const vis = series.filter((d) => d.date >= domain[0] && d.date <= domain[1]);
  return (<svg width={width} height={height} role="img" aria-label="Daily active users">
    <GridRows scale={y} left={m.l} width={width - m.l - m.r} stroke={INK.grid} numTicks={5} />
    <AreaClosed data={vis} x={(d) => x(d.date)} y={(d) => y(d.value)} yScale={y} fill={COLORS[0]} fillOpacity={0.12} />
    <LinePath data={vis} x={(d) => x(d.date)} y={(d) => y(d.value)} stroke={COLORS[0]} strokeWidth={2} />
    <AxisLeft scale={y} left={m.l} numTicks={5} {...ax} /><AxisBottom scale={x} top={height - m.b} numTicks={6} {...ax} />
    <Group top={height - bh - 8}>
      <AreaClosed data={series} x={(d) => full(d.date)} y={(d) => yb(d.value)} yScale={yb} fill={COLORS[0]} fillOpacity={0.2} />
      <Brush xScale={full} yScale={yb} width={width} height={bh} margin={{ left: 0, right: 0 }} handleSize={8} resizeTriggerAreas={['left', 'right']}
        brushDirection="horizontal" initialBrushPosition={{ start: { x: full(domain[0]) }, end: { x: full(domain[1]) } }}
        onChange={(b) => b && setDomain([new Date(b.x0), new Date(b.x1)])} selectedBoxStyle={{ fill: COLORS[0], fillOpacity: 0.12, stroke: COLORS[0] }} useWindowMoveEvents />
    </Group>
  </svg>);
}
function Bars({ width, height }) {
  const m = { t: 6, r: 48, b: 24, l: 100 };
  const x = scaleLinear({ domain: [0, 50000], range: [m.l, width - m.r], nice: true });
  const y = scaleBand({ domain: channels.map((d) => d.name), range: [m.t, height - m.b], padding: 0.45 });
  return (<svg width={width} height={height} role="img" aria-label="Revenue by channel">
    {channels.map((d, i) => <g key={d.name}><Bar x={m.l} y={y(d.name)} height={y.bandwidth()} width={x(d.value) - m.l} rx={3} fill={COLORS[i]} />
      <text x={x(d.value) + 6} y={y(d.name) + y.bandwidth() / 2} dy="0.35em" fontSize={11} fill={INK.muted}>{fmtK(d.value)}</text></g>)}
    <AxisLeft scale={y} left={m.l} hideTicks hideAxisLine {...ax} /><AxisBottom scale={x} top={height - m.b} numTicks={5} tickFormat={fmtK} {...ax} />
  </svg>);
}
function Stacked({ width, height }) {
  const m = { t: 30, r: 8, b: 24, l: 40 };
  const x = scaleBand({ domain: months, range: [m.l, width - m.r], padding: 0.45 });
  const y = scaleLinear({ domain: [0, 1300], range: [height - m.b, m.t], nice: true });
  const color = scaleOrdinal({ domain: stackKeys, range: COLORS });
  return (<div style={{ position: 'relative' }}>
    <div style={{ position: 'absolute', right: 8, top: 0, fontSize: 11 }}><LegendOrdinal scale={color} direction="row" itemMargin="0 8px 0 0" shapeWidth={10} shapeHeight={10} /></div>
    <svg width={width} height={height} role="img" aria-label="Support tickets by channel">
      <GridRows scale={y} left={m.l} width={width - m.l - m.r} stroke={INK.grid} numTicks={5} />
      <BarStack data={stack} keys={stackKeys} x={(d) => d.month} xScale={x} yScale={y} color={color}>
        {(bs) => bs.map((s) => s.bars.map((b) => <rect key={`${s.index}-${b.index}`} x={b.x} y={b.y} width={b.width} height={b.height} fill={b.color} stroke={INK.surface} />))}
      </BarStack>
      <AxisLeft scale={y} left={m.l} numTicks={5} {...ax} /><AxisBottom scale={x} top={height - m.b} {...ax} />
    </svg></div>);
}
function Donut({ width, height }) {
  const r = Math.min(width, height) / 2 - 36, total = channels.reduce((s, d) => s + d.value, 0);
  return (<svg width={width} height={height} role="img" aria-label="Revenue share">
    <Group top={height / 2} left={width / 2}>
      <Pie data={channels} pieValue={(d) => d.value} outerRadius={r} innerRadius={r * 0.6} pieSort={null}>
        {(pie) => pie.arcs.map((a, i) => { const [cx, cy] = pie.path.centroid(a); const k = 1.32;
          return <g key={a.data.name}><path d={pie.path(a)} fill={COLORS[i]} stroke={INK.surface} strokeWidth={2} />
            <text x={cx * k} y={cy * k} fontSize={11} fill={INK.text} textAnchor={cx > 0 ? 'start' : 'end'}>{a.data.name} {Math.round((a.data.value / total) * 100)}%</text></g>; })}
      </Pie>
    </Group></svg>);
}
mount('ts', TimeSeries); mount('bar', Bars); mount('stack', Stacked); mount('donut', Donut);
