// ECharts 6, tree-shaken via echarts/core (only what these four charts use).
import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, DataZoomComponent, LegendComponent, AriaComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import { COLORS, INK, series, channels, stack, stackKeys, months, fmtK, fmtDay, slot } from '../data.js';

echarts.use([LineChart, BarChart, PieChart, GridComponent, TooltipComponent, DataZoomComponent, LegendComponent, AriaComponent, SVGRenderer]);
document.getElementById('lib').textContent = 'Apache ECharts 6.1';
const base = { color: COLORS, aria: { enabled: true }, textStyle: { color: INK.muted, fontFamily: 'system-ui' }, animation: false };
const axis = { axisLine: { lineStyle: { color: INK.axis } }, splitLine: { lineStyle: { color: INK.grid } } };
const init = (id, opt) => echarts.init(slot(id), null, { renderer: 'svg' }).setOption({ ...base, ...opt });

init('ts', {
  grid: { left: 44, right: 12, top: 10, bottom: 64 }, tooltip: { trigger: 'axis' },
  xAxis: { type: 'time', ...axis, splitLine: { show: false } }, yAxis: { type: 'value', ...axis },
  dataZoom: [{ type: 'inside', start: 50 }, { type: 'slider', start: 50, bottom: 8, height: 22 }],
  series: [{ type: 'line', showSymbol: false, data: series.map((d) => [d.t, d.value]), lineStyle: { width: 2 }, areaStyle: { opacity: 0.12 } }],
});
init('bar', {
  grid: { left: 104, right: 48, top: 6, bottom: 24 }, tooltip: {},
  xAxis: { type: 'value', ...axis, axisLabel: { formatter: fmtK } },
  yAxis: { type: 'category', inverse: true, data: channels.map((c) => c.name), axisTick: { show: false }, axisLine: { show: false } },
  series: [{ type: 'bar', data: channels.map((c) => c.value), barWidth: 18, itemStyle: { borderRadius: [0, 4, 4, 0] }, colorBy: 'data',
             label: { show: true, position: 'right', formatter: (p) => fmtK(p.value) } }],
});
init('stack', {
  legend: { top: 0, right: 0, icon: 'roundRect' }, grid: { left: 40, right: 8, top: 30, bottom: 24 }, tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  xAxis: { type: 'category', data: months, ...axis }, yAxis: { type: 'value', ...axis },
  series: stackKeys.map((k) => ({ name: k, type: 'bar', stack: 't', barWidth: '50%', data: stack.map((r) => r[k]), itemStyle: { borderColor: INK.surface, borderWidth: 1 } })),
});
init('donut', {
  tooltip: {},
  series: [{ type: 'pie', radius: ['42%', '70%'], data: channels, itemStyle: { borderColor: INK.surface, borderWidth: 2 }, label: { formatter: '{b}\n{d}%' } }],
});
