// D3 7: everything hand-built from scales, shapes, axes and d3-zoom.
import * as d3 from 'd3';
import { COLORS, INK, series, channels, stack, stackKeys, months, fmtK, fmtDay, slot, size } from '../data.js';

document.getElementById('lib').textContent = 'D3 7.9';
const svgIn = (id, label) => {
  const { width, height } = size(id);
  const svg = d3.select(slot(id)).append('svg').attr('width', width).attr('height', height).attr('role', 'img').attr('aria-label', label);
  return { svg, width, height };
};
const styleAxis = (g) => g.call((s) => s.select('.domain').attr('stroke', INK.axis)).call((s) => s.selectAll('text').attr('fill', INK.muted)).call((s) => s.selectAll('line').attr('stroke', INK.axis));

{ // 1. Time series with wheel/drag zoom (d3-zoom rescales x).
  const { svg, width, height } = svgIn('ts', 'Daily active users, last 180 days');
  const m = { t: 10, r: 12, b: 24, l: 40 };
  const x = d3.scaleUtc(d3.extent(series, (d) => d.date), [m.l, width - m.r]);
  const y = d3.scaleLinear([0, d3.max(series, (d) => d.value)], [height - m.b, m.t]).nice();
  svg.append('defs').append('clipPath').attr('id', 'clip').append('rect').attr('x', m.l).attr('y', m.t).attr('width', width - m.l - m.r).attr('height', height - m.t - m.b);
  svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5).tickSize(-(width - m.l - m.r))).call(styleAxis).call((g) => g.selectAll('.tick line').attr('stroke', INK.grid));
  const gx = svg.append('g').attr('transform', `translate(0,${height - m.b})`);
  const area = (xs) => d3.area().x((d) => xs(d.date)).y0(y(0)).y1((d) => y(d.value));
  const line = (xs) => d3.line().x((d) => xs(d.date)).y((d) => y(d.value));
  const a = svg.append('path').attr('clip-path', 'url(#clip)').attr('fill', COLORS[0]).attr('fill-opacity', 0.12);
  const l = svg.append('path').attr('clip-path', 'url(#clip)').attr('fill', 'none').attr('stroke', COLORS[0]).attr('stroke-width', 2);
  const draw = (xs) => { gx.call(d3.axisBottom(xs).ticks(6)).call(styleAxis); a.attr('d', area(xs)(series)); l.attr('d', line(xs)(series)); };
  const zoom = d3.zoom().scaleExtent([1, 12]).translateExtent([[m.l, 0], [width - m.r, height]]).on('zoom', (e) => draw(e.transform.rescaleX(x)));
  svg.call(zoom).call(zoom.transform, d3.zoomIdentity.scale(2).translate(-(width - m.l - m.r) / 2 - m.l / 2, 0));
}
{ // 2. Sorted horizontal bars with direct labels.
  const { svg, width, height } = svgIn('bar', 'Revenue by channel');
  const m = { t: 6, r: 48, b: 24, l: 100 };
  const x = d3.scaleLinear([0, d3.max(channels, (d) => d.value)], [m.l, width - m.r]).nice();
  const y = d3.scaleBand(channels.map((d) => d.name), [m.t, height - m.b]).padding(0.45);
  svg.append('g').attr('transform', `translate(0,${height - m.b})`).call(d3.axisBottom(x).ticks(5).tickFormat(fmtK)).call(styleAxis);
  svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).tickSize(0)).call(styleAxis).call((g) => g.select('.domain').remove());
  svg.append('g').selectAll('rect').data(channels).join('rect').attr('x', m.l).attr('y', (d) => y(d.name)).attr('height', y.bandwidth())
    .attr('width', (d) => x(d.value) - m.l).attr('rx', 3).attr('fill', (d, i) => COLORS[i]).append('title').text((d) => `${d.name}: ${d.value}`);
  svg.append('g').selectAll('text').data(channels).join('text').attr('x', (d) => x(d.value) + 6).attr('y', (d) => y(d.name) + y.bandwidth() / 2)
    .attr('dy', '0.35em').attr('fill', INK.muted).attr('font-size', 11).text((d) => fmtK(d.value));
}
{ // 3. Stacked bars via d3.stack + legend.
  const { svg, width, height } = svgIn('stack', 'Support tickets by channel per month');
  const m = { t: 28, r: 8, b: 24, l: 40 };
  const layers = d3.stack().keys(stackKeys)(stack);
  const x = d3.scaleBand(months, [m.l, width - m.r]).padding(0.45);
  const y = d3.scaleLinear([0, d3.max(layers.at(-1), (d) => d[1])], [height - m.b, m.t]).nice();
  svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5).tickSize(-(width - m.l - m.r))).call(styleAxis).call((g) => g.selectAll('.tick line').attr('stroke', INK.grid));
  svg.append('g').attr('transform', `translate(0,${height - m.b})`).call(d3.axisBottom(x)).call(styleAxis);
  svg.append('g').selectAll('g').data(layers).join('g').attr('fill', (d, i) => COLORS[i])
    .selectAll('rect').data((d) => d).join('rect').attr('x', (d) => x(d.data.month)).attr('y', (d) => y(d[1]))
    .attr('height', (d) => y(d[0]) - y(d[1])).attr('width', x.bandwidth()).attr('stroke', INK.surface);
  const lg = svg.append('g').attr('font-size', 11).attr('fill', INK.text);
  stackKeys.forEach((k, i) => { const g = lg.append('g').attr('transform', `translate(${width - 260 + i * 64},8)`); g.append('rect').attr('width', 10).attr('height', 10).attr('rx', 2).attr('fill', COLORS[i]); g.append('text').attr('x', 14).attr('y', 9).text(k); });
}
{ // 4. Donut via d3.pie + d3.arc with outside labels.
  const { svg, width, height } = svgIn('donut', 'Revenue share by channel');
  const r = Math.min(width, height) / 2 - 36;
  const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);
  const arcs = d3.pie().sort(null).value((d) => d.value)(channels);
  const arc = d3.arc().innerRadius(r * 0.6).outerRadius(r);
  const outer = d3.arc().innerRadius(r * 1.12).outerRadius(r * 1.12);
  const total = d3.sum(channels, (d) => d.value);
  g.selectAll('path').data(arcs).join('path').attr('d', arc).attr('fill', (d, i) => COLORS[i]).attr('stroke', INK.surface).attr('stroke-width', 2);
  g.selectAll('text').data(arcs).join('text').attr('transform', (d) => `translate(${outer.centroid(d)})`).attr('text-anchor', (d) => ((d.startAngle + d.endAngle) / 2 > Math.PI ? 'end' : 'start'))
    .attr('font-size', 11).attr('fill', INK.text).text((d) => `${d.data.name} ${Math.round((d.data.value / total) * 100)}%`);
}
