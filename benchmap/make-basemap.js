// Writes assets/basemap.json: a small synthetic city basemap (land, river, parks, road grid) so every stack
// renders the same offline background with no tile server.   node make-basemap.js
import { writeFileSync } from 'node:fs';
import { BBOX } from './shared.js';

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const [w, s, e, n] = BBOX;
const pad = 0.15;
const f = (kind, geometry) => ({ type: 'Feature', properties: { kind }, geometry });
const features = [f('land', { type: 'Polygon', coordinates: [[[w - pad, s - pad], [e + pad, s - pad], [e + pad, n + pad], [w - pad, n + pad], [w - pad, s - pad]]] })];

// River: a meandering band across the middle.
const river = [];
for (let x = w - pad; x <= e + pad; x += 0.005) river.push([+x.toFixed(4), +(51.5 + 0.03 * Math.sin((x - w) * 9) + 0.012 * Math.sin((x - w) * 31)).toFixed(4)]);
const bank = (dy) => river.map(([x, y]) => [x, +(y + dy).toFixed(4)]);
features.push(f('water', { type: 'Polygon', coordinates: [[...bank(0.004), ...bank(-0.004).reverse(), bank(0.004)[0]]] }));

// Parks.
for (let i = 0; i < 24; i++) {
  const cx = w + rnd() * (e - w), cy = s + rnd() * (n - s), r = 0.004 + rnd() * 0.01;
  const ring = Array.from({ length: 13 }, (_, k) => { const a = (k % 12) / 12 * Math.PI * 2; return [+(cx + r * 1.6 * Math.cos(a)).toFixed(5), +(cy + r * Math.sin(a)).toFixed(5)]; });
  features.push(f('park', { type: 'Polygon', coordinates: [ring] }));
}

// Roads: a slightly jittered grid, major every fifth line.
for (let i = 0, x = w; x <= e; x += 0.01, i++) features.push(f(i % 5 ? 'road' : 'major', { type: 'LineString', coordinates: [[+x.toFixed(4), s], [+(x + rnd() * 0.004).toFixed(4), (s + n) / 2], [+x.toFixed(4), n]] }));
for (let i = 0, y = s; y <= n; y += 0.007, i++) features.push(f(i % 5 ? 'road' : 'major', { type: 'LineString', coordinates: [[w, +y.toFixed(4)], [(w + e) / 2, +(y + rnd() * 0.003).toFixed(4)], [e, +y.toFixed(4)]] }));

writeFileSync(new URL('./assets/basemap.json', import.meta.url), JSON.stringify({ type: 'FeatureCollection', features }));
console.log(features.length, 'features');
