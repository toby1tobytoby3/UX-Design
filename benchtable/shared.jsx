// Shared shell: one grid per page (the task comes from ?task=), an external status filter and a focus anchor before
// the grid. Each kit renders <Grid> with the same configuration in every task and wires window.__bench.api to its own
// native APIs, so the runner can drive and read every kit the same way.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { STATUSES } from './data.js';

export const task = new URLSearchParams(location.search).get('task') || 'big';
const TITLES = { big: '10,000 rows · sort, filter, scroll', layout: 'Sticky header, pinned column, resize, hide', select: 'Keyboard selection', edit: 'Inline edit of Amount' };

window.__bench = { api: {}, notes: {}, hasText: null, renderMs: null };
// Default probes read the DOM; canvas kits override them with their own APIs.
const view = () => document.querySelector('.view');
window.__bench.hasText = (s) => view().textContent.includes(s);

export function renderBench(name, Grid) {
  document.getElementById('lib').textContent = name;
  document.querySelector('section h2').innerHTML = `${TITLES[task]} <small>· ${name}</small>`;
  const filter = document.getElementById('status-filter');
  filter.innerHTML = `<option value="">All statuses</option>${STATUSES.map((s) => `<option>${s}</option>`).join('')}`;
  filter.addEventListener('change', () => window.__bench.api.setStatusFilter?.(filter.value));
  const t0 = performance.now();
  createRoot(view()).render(<Grid task={task} />);
  // Time to first rendered row (polled per frame).
  const poll = () => {
    if (window.__bench.hasText('INV-00001')) window.__bench.renderMs = Math.round(performance.now() - t0);
    else requestAnimationFrame(poll);
  };
  requestAnimationFrame(poll);
}
export { React };
