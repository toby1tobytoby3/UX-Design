// Apache ECharts 5.5 — universalTransition: the same data morphs between a bar chart (compare amounts)
// and a pie (see share) instead of cutting. Sample data, not real figures.
const COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4']; // validated categorical order
const data = [
  ['Organic search', 48200], ['Paid search', 31900], ['Email', 22400], ['Referral', 15100], ['Social', 9800],
].map(([name, value], i) => ({ name, value, itemStyle: { color: COLORS[i] } }));

const base = {
  aria: { enabled: true },
  textStyle: { fontFamily: 'system-ui, sans-serif', color: '#52514e' },
  title: { text: 'Revenue by channel', subtext: 'Sample data · last 30 days', left: 24, top: 16,
           textStyle: { fontSize: 16, fontWeight: 600, color: '#1f1f1e' } },
  tooltip: { valueFormatter: (v) => '$' + v.toLocaleString() },
  animationDurationUpdate: 700,
};
const bar = {
  ...base,
  grid: { left: 140, right: 48, top: 88, bottom: 40 },
  xAxis: { type: 'value', splitLine: { lineStyle: { color: '#ecebe7' } }, axisLabel: { formatter: (v) => '$' + v / 1000 + 'k' } },
  yAxis: { type: 'category', inverse: true, data: data.map((d) => d.name), axisLine: { show: false }, axisTick: { show: false } },
  series: [{ id: 'rev', type: 'bar', data, barWidth: 22, itemStyle: { borderRadius: [0, 4, 4, 0] },
             label: { show: true, position: 'right', color: '#52514e', formatter: (p) => '$' + (p.value / 1000).toFixed(1) + 'k' },
             universalTransition: true }],
};
const pie = {
  ...base,
  xAxis: { show: false }, yAxis: { show: false },
  series: [{ id: 'rev', type: 'pie', data, radius: ['38%', '66%'], center: ['50%', '56%'],
             itemStyle: { borderColor: '#fcfcfb', borderWidth: 2 },          // 2px surface gap between slices
             label: { formatter: '{b}\n{d}%', color: '#52514e', lineHeight: 18 },
             universalTransition: true }],
};

const chart = echarts.init(document.getElementById('chart'), null, { renderer: 'svg' });
chart.setOption(bar);
const show = (kind) => {
  chart.setOption(kind === 'pie' ? pie : bar, { replaceMerge: ['xAxis', 'yAxis', 'grid'] });
  for (const id of ['bar', 'pie']) document.getElementById(id).setAttribute('aria-pressed', id === kind);
};
document.getElementById('bar').onclick = () => show('bar');
document.getElementById('pie').onclick = () => show('pie');
addEventListener('resize', () => chart.resize());
