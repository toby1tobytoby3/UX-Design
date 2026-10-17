// Apache ECharts 5.5 — time series with brush-free zoom: wheel/drag inside the plot + a slider below.
// Sample data (deterministic), not real figures.
const days = [], users = [];
for (let i = 0, v = 1200, d = Date.UTC(2026, 3, 1); i < 180; i++, d += 864e5) {
  v = Math.max(400, v + Math.round(Math.sin(i / 9) * 40 + (i % 7 > 4 ? -90 : 25) + ((i * 37) % 23) - 11));
  days.push(d); users.push([d, v]);
}
const fmtDay = (t) => new Date(t).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const chart = echarts.init(document.getElementById('chart'), null, { renderer: 'svg' });
chart.setOption({ baseOption: {
  aria: { enabled: true },                      // generates a text description for screen readers
  textStyle: { fontFamily: 'system-ui, sans-serif', color: '#52514e' },
  title: { text: 'Daily active users', subtext: 'Sample data · drag or scroll to zoom', left: 24, top: 16,
           textStyle: { fontSize: 16, fontWeight: 600, color: '#1f1f1e' } },
  grid: { left: 64, right: 32, top: 88, bottom: 96 },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'cross', label: { backgroundColor: '#52514e',
      formatter: (p) => (p.axisDimension === 'x' ? fmtDay(p.value) : Math.round(p.value).toLocaleString()) } },
    formatter: ([p]) => `${fmtDay(p.value[0])}<br/>${p.marker} ${p.seriesName} <b>${p.value[1].toLocaleString()}</b>`,
  },
  xAxis: { type: 'time', axisLine: { lineStyle: { color: '#d9d8d3' } }, splitLine: { show: false } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: '#ecebe7' } }, axisLabel: { formatter: (v) => v.toLocaleString() } },
  dataZoom: [
    { type: 'inside', start: 50, end: 100 },    // wheel / pinch / drag inside the plot
    { type: 'slider', start: 50, end: 100, bottom: 28, height: 28,
      borderColor: '#d9d8d3', fillerColor: 'rgba(42,120,214,.12)', dataBackground: { lineStyle: { color: '#86b6ef' }, areaStyle: { color: '#cde2fb' } } },
  ],
  series: [{
    name: 'Active users', type: 'line', data: users, showSymbol: false, smooth: 0.2,
    lineStyle: { width: 2, color: '#2a78d6' }, itemStyle: { color: '#2a78d6' },
    areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: 'rgba(42,120,214,.25)' }, { offset: 1, color: 'rgba(42,120,214,0)' }]) },
    markPoint: { symbolSize: 44, data: [{ type: 'max', name: 'Peak' }], itemStyle: { color: '#2a78d6' },
                 label: { formatter: (p) => (p.value / 1000).toFixed(1) + 'k' } },
  }],
},
// ECharts' own responsive rules: re-layout below 500px instead of squeezing the desktop layout.
media: [{ query: { maxWidth: 500 }, option: {
  grid: { left: 44, right: 16 },
  xAxis: { splitNumber: 3 },
  yAxis: { axisLabel: { formatter: (v) => (v >= 1000 ? v / 1000 + 'k' : v) } },
  series: [{ markPoint: { data: [] } }],
} }] });
addEventListener('resize', () => chart.resize());
