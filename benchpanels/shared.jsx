// Shared content for every library: the same three-pane workspace (Explorer · Editor · Inspector; the docking libraries
// add a Terminal tab next to the Editor) and the same heavy pane content: a canvas chart of 20,000 points that redraws
// synchronously whenever its pane changes size, like a real chart, video or map would.
import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

export const PANES = { explorer: 'Explorer', editor: 'Editor', terminal: 'Terminal', inspector: 'Inspector' };
export const DEFAULT = { explorer: 240, inspector: 300, min: 160, max: 480 }; // px
export const STORE = 'bench-layout';
export const load = () => { try { return JSON.parse(localStorage.getItem(STORE)); } catch { return null; } };
export const save = (v) => localStorage.setItem(STORE, JSON.stringify(v));

const POINTS = (() => { // a deterministic random walk, normalised to 0..1
  let y = 0, s = 7; const p = Array.from({ length: 20000 }, () => (y += ((s = (s * 16807) % 2147483647) / 2147483647 - 0.5)));
  const lo = Math.min(...p), hi = Math.max(...p); return p.map((v) => (v - lo) / (hi - lo));
})();
window.__bench = { notes: {}, redraws: 0, drawMs: 0 };

function draw(canvas) {
  const t = performance.now();
  const { width, height } = canvas.parentElement.getBoundingClientRect();
  if (!width || !height) return;
  canvas.width = Math.round(width); canvas.height = Math.round(height - 28);
  const ctx = canvas.getContext('2d'); const w = canvas.width, h = canvas.height;
  ctx.fillStyle = '#fbfaf8'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#2a78d6'; ctx.lineWidth = 1; ctx.beginPath();
  for (let i = 0; i < POINTS.length; i++) { const x = (i / POINTS.length) * w, yy = h - 12 - POINTS[i] * (h - 24); i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
  ctx.stroke();
  window.__bench.redraws++; window.__bench.drawMs += performance.now() - t;
}

export function Pane({ id }) {
  const ref = useRef(null);
  useEffect(() => { const c = ref.current; const ro = new ResizeObserver(() => draw(c)); ro.observe(c.parentElement); return () => ro.disconnect(); }, []);
  return (
    <div className="pane" data-pane={id}>
      <div className="pane-title">{PANES[id]}</div>
      <canvas ref={ref} aria-hidden="true" />
    </div>
  );
}

export const mount = (el) => createRoot(document.getElementById('app')).render(el);
export const title = (t) => { document.getElementById('lib').textContent = t; };
// Selectors the runner needs, in the library's own markup.
export const expose = (o) => Object.assign(window.__bench, o);
export const note = (k, text) => { window.__bench.notes[k] = text; };
export { React };
