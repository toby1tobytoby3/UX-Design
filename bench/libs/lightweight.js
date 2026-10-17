// TradingView Lightweight Charts 5: finance-grade time series; pan/zoom built in.
import { createChart, AreaSeries, HistogramSeries } from 'lightweight-charts';
import { COLORS, INK, series, slot, size, unsupported } from '../data.js';

document.getElementById('lib').textContent = 'Lightweight Charts 5.2';
const { width, height } = size('ts');
const chart = createChart(slot('ts'), { width, height,
  layout: { background: { color: 'transparent' }, textColor: INK.muted, fontFamily: 'system-ui' },
  grid: { vertLines: { visible: false }, horzLines: { color: INK.grid } }, rightPriceScale: { borderColor: INK.axis }, timeScale: { borderColor: INK.axis } });
const area = chart.addSeries(AreaSeries, { lineColor: COLORS[0], lineWidth: 2, topColor: COLORS[0] + '33', bottomColor: COLORS[0] + '00' });
area.setData(series.map((d) => ({ time: d.date.toISOString().slice(0, 10), value: d.value })));
chart.timeScale().setVisibleLogicalRange({ from: 90, to: 179 });
unsupported('bar', 'No categorical bar chart; every series is plotted against time.');
unsupported('stack', 'No stacked bars; histograms are per time point, one series each.');
unsupported('donut', 'No pie or donut; it is a financial time-series library.');
