// Observable Plot 0.6: concise marks API on top of D3; renders static SVG.
import * as Plot from '@observablehq/plot';
import { COLORS, INK, series, channels, stack, stackKeys, fmtK, slot, size, unsupported } from '../data.js';

document.getElementById('lib').textContent = 'Observable Plot 0.6.17';
const put = (id, chart) => slot(id).append(chart);
const style = { fontFamily: 'system-ui', fontSize: '11px', color: INK.muted, background: 'transparent' };

put('ts', Plot.plot({ ...size('ts'), style, marginLeft: 40, y: { grid: true, label: null }, x: { label: null },
  marks: [Plot.areaY(series, { x: 'date', y: 'value', fill: COLORS[0], fillOpacity: 0.12 }),
          Plot.lineY(series, { x: 'date', y: 'value', stroke: COLORS[0], strokeWidth: 2, tip: true }), Plot.ruleY([0])] }));
put('bar', Plot.plot({ ...size('bar'), style, marginLeft: 100, marginRight: 48, x: { grid: true, label: null, tickFormat: fmtK }, y: { label: null, domain: channels.map((d) => d.name) },
  color: { domain: channels.map((d) => d.name), range: COLORS },
  marks: [Plot.barX(channels, { x: 'value', y: 'name', fill: 'name', rx: 3, tip: true }),
          Plot.text(channels, { x: 'value', y: 'name', text: (d) => fmtK(d.value), textAnchor: 'start', dx: 6, fill: INK.muted })] }));
const long = stack.flatMap((r) => stackKeys.map((k) => ({ month: r.month, channel: k, value: r[k] })));
put('stack', Plot.plot({ ...size('stack'), style, marginLeft: 40, y: { grid: true, label: null }, x: { label: null, domain: stack.map((r) => r.month) },
  color: { domain: stackKeys, range: COLORS, legend: true },
  marks: [Plot.barY(long, { x: 'month', y: 'value', fill: 'channel', stroke: INK.surface, tip: true }), Plot.ruleY([0])] }));
unsupported('donut', 'Plot has no pie or donut mark by design (it steers you to bars). A donut needs D3 shapes or a custom mark.');
unsupported.zoomNote = 'No built-in zoom; Plot renders static SVG.';
