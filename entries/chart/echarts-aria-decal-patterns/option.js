// Apache ECharts 5.5 — aria + decal: every series gets a distinct texture as well as a colour,
// so identity never relies on colour alone (colour-blind, greyscale print, forced colours).
// Sample data, not real figures.
const COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100']; // validated categorical order
const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const series = [
  ['Email', [420, 398, 451, 470, 433, 402]],
  ['Chat', [310, 344, 362, 401, 428, 455]],
  ['Phone', [190, 176, 168, 150, 141, 133]],
  ['In-app', [80, 102, 131, 160, 198, 236]],
].map(([name, data], i) => ({
  name, data, type: 'bar', stack: 'total', barWidth: '46%',
  itemStyle: { color: COLORS[i], borderColor: '#fcfcfb', borderWidth: 1 }, // hairline surface gap between stacked segments
  emphasis: { focus: 'series' },
}));

const chart = echarts.init(document.getElementById('chart'), null, { renderer: 'svg' });
chart.setOption({
  aria: { enabled: true, decal: { show: true } },  // the one line that adds textures + screen-reader description
  textStyle: { fontFamily: 'system-ui, sans-serif', color: '#52514e' },
  title: { text: 'Support tickets by channel', subtext: 'Sample data · monthly', left: 24, top: 16,
           textStyle: { fontSize: 16, fontWeight: 600, color: '#1f1f1e' } },
  legend: { top: 22, right: 24, itemWidth: 18, itemHeight: 12, textStyle: { color: '#1f1f1e' } },
  grid: { left: 56, right: 32, top: 88, bottom: 40 },
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  xAxis: { type: 'category', data: months, axisTick: { show: false }, axisLine: { lineStyle: { color: '#d9d8d3' } } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: '#ecebe7' } } },
  series,
});
addEventListener('resize', () => chart.resize());
