// uPlot 1.6: tiny, canvas, time-series first. Drag-to-zoom is built in.
import uPlot from 'uplot';
import css from 'uplot/dist/uPlot.min.css';
import { COLORS, INK, series, stack, stackKeys, months, slot, size, unsupported } from '../data.js';

document.getElementById('lib').textContent = 'uPlot 1.6.32';
document.head.append(Object.assign(document.createElement('style'), { textContent: css }));
const axis = { stroke: INK.muted, grid: { stroke: INK.grid }, ticks: { stroke: INK.axis } };

{ const { width, height } = size('ts');
  new uPlot({ width, height: height - 34, legend: { show: true }, cursor: { drag: { x: true } }, scales: { x: { time: true } }, axes: [axis, axis],
    series: [{}, { label: 'Active users', stroke: COLORS[0], width: 2, fill: COLORS[0] + '1f' }] },
    [series.map((d) => d.t / 1000), series.map((d) => d.value)], slot('ts')); }
{ // Stacked bars: no stacking option, so plot cumulative totals as bars, largest first so smaller ones paint on top.
  const { width, height } = size('stack');
  const x = months.map((_, i) => i);
  const cum = stackKeys.map((_, k) => stack.map((r) => stackKeys.slice(0, k + 1).reduce((s, key) => s + r[key], 0)));
  const bars = uPlot.paths.bars({ size: [0.55] });
  const order = [3, 2, 1, 0];
  new uPlot({ width, height: height - 34, scales: { x: { time: false, range: [-0.6, 5.6] }, y: { range: (u, min, max) => [0, Math.ceil(max / 200) * 200] } },
    axes: [{ ...axis, splits: () => x, values: (u, v) => v.map((i) => months[i] ?? '') }, axis],
    series: [{}, ...order.map((k) => ({ label: stackKeys[k], fill: COLORS[k], stroke: INK.surface, paths: bars, points: { show: false } }))] },
    [x, ...order.map((k) => cum[k])], slot('stack'));
}
unsupported('bar', 'No categorical/horizontal bar chart; uPlot is built for x/y numeric series.');
unsupported('donut', 'No pie or donut. uPlot only draws x/y series.');
