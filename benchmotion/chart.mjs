#!/usr/bin/env node
// Draw the drawer trajectories from results.json as two small multiples (uninterrupted open; reversed halfway)
// and save ../guides/img/motion-curves.png. Run after run.mjs.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const HERE = new URL('.', import.meta.url).pathname;
const R = JSON.parse(readFileSync(join(HERE, 'results.json'), 'utf8'));
// Validated categorical palette (guides/charts.md), fixed order.
const LIBS = [['motion', 'Motion', '#2a78d6'], ['react-spring', 'React Spring', '#eb6834'], ['gsap', 'GSAP', '#1baf7a'],
  ['animejs', 'anime.js', '#eda100'], ['native-css', 'CSS transition', '#e87ba4']].filter(([k]) => R[k]?.probe.interrupt.curve_open);
const W = 520, H = 260, M = { l: 44, r: 96, t: 30, b: 34 }, TMAX = 1400, YMIN = -40, YMAX = 360;
const x = (t) => M.l + (Math.min(t, TMAX) / TMAX) * (W - M.l - M.r);
const y = (v) => M.t + ((YMAX - v) / (YMAX - YMIN)) * (H - M.t - M.b);

function panel(key, title, note, endLabels = true) {
  const grid = [0, 100, 200, 300].map((v) => `<line x1="${M.l}" x2="${W - M.r}" y1="${y(v)}" y2="${y(v)}" stroke="#ecebe7"/><text x="${M.l - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`).join('');
  const ticks = [0, 200, 400, 600, 800, 1000, 1200, 1400].map((t) => `<text x="${x(t)}" y="${H - M.b + 16}" text-anchor="middle">${t}</text>`).join('');
  const target = key === 'curve_open' ? `<line x1="${M.l}" x2="${W - M.r}" y1="${y(300)}" y2="${y(300)}" stroke="#8a8984" stroke-dasharray="3 3"/>` : `<line x1="${M.l}" x2="${W - M.r}" y1="${y(0)}" y2="${y(0)}" stroke="#8a8984" stroke-dasharray="3 3"/>`;
  // Direct labels at each line's end, nudged apart so they don't collide.
  const ends = LIBS.map(([k, name, c]) => { const pts = R[k].probe.interrupt[key]; return { name, c, v: pts.at(-1)[1] }; })
    .sort((a, b) => b.v - a.v);
  ends.forEach((e, i) => { e.ly = y(e.v); if (i && e.ly - ends[i - 1].ly < 13) e.ly = ends[i - 1].ly + 13; });
  const lines = LIBS.map(([k, , c]) => `<polyline fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round" points="${R[k].probe.interrupt[key].filter(([t]) => t <= TMAX).map(([t, v]) => `${x(t).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}"/>`).join('');
  const labels = !endLabels ? '' : ends.map((e) => `<text x="${W - M.r + 6}" y="${e.ly + 4}" fill="#1f1f1e">${e.name}</text><rect x="${W - M.r - 2}" y="${e.ly - 1}" width="6" height="2" fill="${e.c}"/>`).join('');
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><text x="${M.l}" y="16" class="t">${title}</text><text x="${M.l}" y="28" class="s">${note}</text>${grid}${target}${ticks}<text x="${W - M.r}" y="${H - 4}" text-anchor="end" class="s">ms</text>${lines}${labels}</svg>`;
}

const html = `<!doctype html><html><head><style>body{margin:0;background:#fcfcfb;font:11px system-ui,sans-serif;color:#52514e} svg text{fill:#52514e} .t{font-size:13px;font-weight:600;fill:#1f1f1e} .s{fill:#8a8984}
.wrap{display:flex;gap:8px;padding:12px 12px 4px} .legend{padding:0 12px 10px 56px;display:flex;gap:16px} .legend i{display:inline-block;width:12px;height:3px;vertical-align:middle;margin-right:5px;border-radius:2px}</style></head><body>
<div class="wrap">${panel('curve_open', 'Open the drawer (0 → 300 px), library defaults', 'Overshoot past the dashed target = spring bounce')}${panel('curve_interrupt', 'Reversed halfway through', 'How each one turns around and settles back at 0 (legend below)', false)}</div>
<div class="legend">${LIBS.map(([, n, c]) => `<span><i style="background:${c}"></i>${n}</span>`).join('')}<span>· position in px over time, headless Chromium, benchmotion/run.mjs</span></div></body></html>`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1072, height: 320 }, deviceScaleFactor: 2 });
await page.setContent(html);
await page.screenshot({ path: join(HERE, '../guides/img/motion-curves.png'), fullPage: true });
await browser.close();
console.log('wrote guides/img/motion-curves.png');
