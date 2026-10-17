// Shared 3D benchmark setup. Every library performs the same four tasks with the same asset and look.
export const MODEL_URL = '/assets/product.glb';      // speaker-like product, PBR, node "Hotspot_Button"
export const HOTSPOT = { node: 'Hotspot_Button', label: 'Power button' };
export const INSTANCES = 2000;                        // task 2: many identical objects
export const COLORS = { bg: '#f4f3ef', accent: '#2a78d6', ink: '#1f1f1e', muted: '#52514e', ground: '#e9e7e1' };
export const CAMERA = { fov: 35, position: [2.6, 1.8, 3.4], target: [0, 0.1, 0] };
export const GRID_CAMERA = { fov: 35, position: [0, 17, 27], target: [0, 0, 0] };   // task 2 framing
export const POSTER = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${'#f4f3ef'}"/><ellipse cx="200" cy="250" rx="70" ry="10" fill="#e2e0d9"/><rect x="150" y="70" width="100" height="175" rx="22" fill="#2b2f36"/><rect x="150" y="62" width="100" height="16" rx="8" fill="#c9ccd1"/><circle cx="200" cy="70" r="8" fill="#2a78d6"/><text x="200" y="290" font-family="system-ui" font-size="12" fill="#52514e" text-anchor="middle">Poster image (shown until the 3D view is ready)</text></svg>`)}`;

export const view = (id) => document.querySelector(`#${id} .view`);
export const size = (id) => { const r = view(id).getBoundingClientRect(); return { width: Math.floor(r.width), height: Math.floor(r.height) }; };
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const t0 = performance.now();
window.__bench = { ready: {}, notes: {} };
// Call when a task's first frame (with the model, where relevant) is on screen. `how` records native vs hand-built.
export const ready = (id, how) => { if (!window.__bench.ready[id]) { window.__bench.ready[id] = Math.round(performance.now() - t0); window.__bench.notes[id] = how; } };
export const unsupported = (id, why) => { view(id).innerHTML = `<div class="na"><b>Not supported natively</b><span>${why}</span></div>`; view(id).dataset.na = why; ready(id, 'unsupported: ' + why); };
// Task 3 helper: an HTML label the library positions each frame at the hotspot's projected screen point.
export const label = (id) => { const el = document.createElement('div'); el.className = 'hotspot'; el.innerHTML = `<span></span>${HOTSPOT.label}`; view(id).append(el); return el; };
// Task 4 helper: a poster shown until the model is ready, then faded out.
export const poster = (id) => { const img = Object.assign(document.createElement('img'), { src: POSTER, alt: 'Speaker product preview', className: 'poster' }); view(id).append(img); return () => img.classList.add('gone'); };
