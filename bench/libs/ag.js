// AG Charts 14 Community (MIT). Navigator/zoom are Enterprise-only, so the time series is static here.
import { AgCharts, ModuleRegistry, AreaSeriesModule, BarSeriesModule, DonutSeriesModule, CategoryAxisModule, NumberAxisModule, TimeAxisModule, LegendModule } from 'ag-charts-community';

// v14+ requires registering modules; registering only these keeps the bundle fair.
ModuleRegistry.registerModules([AreaSeriesModule, BarSeriesModule, DonutSeriesModule, CategoryAxisModule, NumberAxisModule, TimeAxisModule, LegendModule]);
import { COLORS, INK, series, channels, stack, stackKeys, fmtK, slot } from '../data.js';

document.getElementById('lib').textContent = 'AG Charts 14.2 Community';
const theme = { baseTheme: 'ag-default', palette: { fills: COLORS, strokes: COLORS },
  overrides: { common: { background: { fill: 'transparent' }, axes: { number: { label: { color: INK.muted } }, category: { label: { color: INK.muted } }, time: { label: { color: INK.muted } } } } } };
const make = (id, o) => AgCharts.create({ container: slot(id), theme, animation: { enabled: false }, ...o });

make('ts', { data: series, legend: { enabled: false },
  series: [{ type: 'area', xKey: 'date', yKey: 'value', yName: 'Active users', fillOpacity: 0.12, strokeWidth: 2, marker: { enabled: false } }],
  axes: [{ type: 'time', position: 'bottom' }, { type: 'number', position: 'left' }] });
make('bar', { data: channels, legend: { enabled: false }, padding: { right: 36 },
  series: [{ type: 'bar', direction: 'horizontal', xKey: 'name', yKey: 'value', cornerRadius: 3,
             itemStyler: ({ datum }) => ({ fill: COLORS[channels.findIndex((c) => c.name === datum.name)] }), label: { placement: 'outside-end', formatter: ({ value }) => fmtK(value), color: INK.muted } }],
  axes: [{ type: 'category', position: 'left' }, { type: 'number', position: 'bottom', label: { formatter: ({ value }) => fmtK(value) } }] });
make('stack', { data: stack, legend: { position: 'top' },
  series: stackKeys.map((k) => ({ type: 'bar', xKey: 'month', yKey: k, yName: k, stacked: true, stroke: INK.surface, strokeWidth: 1 })) });
make('donut', { data: channels, legend: { enabled: false },
  series: [{ type: 'donut', angleKey: 'value', calloutLabelKey: 'name', sectorLabelKey: 'value', innerRadiusRatio: 0.6, strokeWidth: 2, stroke: INK.surface,
             sectorLabel: { formatter: ({ value }) => fmtK(value), color: '#fff' } }] });
