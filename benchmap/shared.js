// Shared by every stack: the same seeded 5,000 vehicles, the same 1 Hz movement, the same colours and the same
// harness hooks. Each stack registers { view, jumpTo, project, clusters } and sets window.__bench.picked on click.
export const BBOX = [-0.35, 51.35, 0.15, 51.65];
export const CENTER = [-0.1, 51.5];
export const START_ZOOM = 11;
export const CLUSTER_BELOW = 12; // clusters below z12, individual vehicles from z12
export const ATTRIBUTION = '© Synthetic basemap contributors';
export const BASEMAP_URL = '/assets/basemap.json';
export const COLOURS = { land: '#f4f3ef', water: '#b9d3e6', park: '#d5e6c8', road: '#ffffff', major: '#e8d9b0',
  ok: '#2a63c4', alert: '#c4320a', cluster: '#2a63c4', halo: '#ffffff' };

let seed = 42;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const [w, s, e, n] = BBOX;
export const vehicles = Array.from({ length: 5000 }, (_, i) => ({
  id: i, lng: w + rnd() * (e - w), lat: s + rnd() * (n - s), heading: rnd() * Math.PI * 2,
  status: rnd() < 0.01 ? 'alert' : 'ok',
}));

// One tick: every vehicle moves ~10–20 m along a slowly turning heading. Mutates in place.
export function step() {
  for (const v of vehicles) {
    v.heading += (rnd() - 0.5) * 0.6;
    const d = 0.0001 + rnd() * 0.0001;
    v.lng = Math.min(e, Math.max(w, v.lng + Math.cos(v.heading) * d * 1.6));
    v.lat = Math.min(n, Math.max(s, v.lat + Math.sin(v.heading) * d));
  }
}

export const toGeoJSON = () => ({ type: 'FeatureCollection', features: vehicles.map((v) => ({
  type: 'Feature', id: v.id, properties: { id: v.id, status: v.status }, geometry: { type: 'Point', coordinates: [v.lng, v.lat] } })) });

globalThis.__bench = { picked: null, ready_ms: null, vehicles };
export function register(api) { Object.assign(globalThis.__bench, api); }
export function ready() { if (globalThis.__bench.ready_ms == null) globalThis.__bench.ready_ms = Math.round(performance.now()); }
export function pick(id) { globalThis.__bench.picked = id; }

// 1 Hz live updates driven by the stack's own update function.
export function live(update) {
  let timer = null;
  register({
    startLive: () => { timer = setInterval(() => { step(); update(); }, 1000); },
    stopLive: () => clearInterval(timer),
  });
}
