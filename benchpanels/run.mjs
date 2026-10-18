#!/usr/bin/env node
// Panels benchmark: the same three-pane workspace (Explorer · Editor · Inspector) in each split, docking and tiles
// library, driven with real mouse and keyboard events in headless Chromium at 1440×900.
//   node run.mjs [lib ...]     (default: all files in libs/)
// Tasks: drag resize and the handle's real hit area; APG window-splitter keyboard; double-click reset; persist and
// reload without a visible jump; rearrange (dock a tab, split to an edge, pop out, or move a tile); frame timing while
// dragging a sash with a 20,000-point canvas redrawing in every pane; axe-core; bundle size.
// Writes ../sources/<slug>/bench.jpg and results.json (evidence for the panels source profiles).
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, basename, extname } from 'node:path';

const HERE = new URL('.', import.meta.url).pathname;
const SOURCES = join(HERE, '../sources');
const DEFAULT = { explorer: 240, min: 160, max: 480 };
const want = process.argv.slice(2);
const libs = readdirSync(join(HERE, 'libs')).filter((f) => /\.jsx?$/.test(f)).map((f) => basename(f, extname(f)))
  .filter((l) => !want.length || want.includes(l));
const AXE = readFileSync(join(HERE, 'node_modules/axe-core/axe.min.js'), 'utf8');
mkdirSync(join(HERE, 'dist'), { recursive: true });
copyFileSync(join(HERE, 'popout.html'), join(HERE, 'dist/popout.html'));

const gz = (f) => (existsSync(f) ? Math.round(gzipSync(readFileSync(f)).length / 102.4) / 10 : 0);
async function bundle(name, entry) {
  const out = join(HERE, 'dist', `${name}.js`);
  await build({ entryPoints: [entry], bundle: true, minify: true, format: 'iife', outfile: out, nodePaths: [join(HERE, 'node_modules')],
    define: { 'process.env.NODE_ENV': '"production"' }, jsx: 'automatic', logLevel: 'error', loader: { '.svg': 'dataurl' } });
  return { js: gz(out), css: gz(join(HERE, 'dist', `${name}.css`)) };
}
// React + the shared panes laid out with flexbox: subtracted so only the library (JS + its CSS) is left.
const baseline = (await bundle('_baseline', join(HERE, 'baseline.jsx'))).js;

const server = createServer((req, res) => {
  const file = join(HERE, 'dist', req.url.split('?')[0]);
  if (!existsSync(file)) { res.writeHead(404).end(); return; }
  const type = file.endsWith('.html') ? 'text/html' : file.endsWith('.css') ? 'text/css' : 'text/javascript';
  res.writeHead(200, { 'content-type': type }).end(readFileSync(file));
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;

// ---- helpers: every check reads the live DOM (pane sizes, roles, focus), never the library's own state.
const wait = (page, ms = 250) => page.waitForTimeout(ms);
const frame = (page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
const paneW = (page, id = 'explorer') => page.evaluate((i) => {
  const p = document.querySelector(`[data-pane=${i}]`); const r = p?.getBoundingClientRect();
  return r && p.getClientRects().length ? Math.round(r.width) : 0;
}, id);
// The handle between Explorer and Editor: of the library's handles, the one nearest the Explorer pane's right edge.
async function handle(page) {
  return page.evaluate(() => {
    const b = window.__bench; const edge = document.querySelector('[data-pane=explorer]').getBoundingClientRect().right;
    const hs = [...document.querySelectorAll(b.handle)].filter((h) => h.getClientRects().length);
    hs.forEach((h) => h.removeAttribute('data-bench-handle'));
    const h = hs.sort((a, c) => Math.abs(a.getBoundingClientRect().left + a.getBoundingClientRect().width / 2 - edge)
      - Math.abs(c.getBoundingClientRect().left + c.getBoundingClientRect().width / 2 - edge))[0];
    if (!h) return null;
    h.setAttribute('data-bench-handle', '1'); const r = h.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width };
  });
}
async function drag(page, from, to, steps = 12) {
  await page.mouse.move(from.x, from.y); await page.mouse.down();
  for (let i = 1; i <= steps; i++) await page.mouse.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
  await page.mouse.up(); await wait(page, 300);
}
async function fresh(page, lib) {
  await page.evaluate(() => localStorage.clear()).catch(() => {});
  await page.goto(`${base}/${lib}.html`); await page.evaluate(() => localStorage.clear()); await page.reload(); await wait(page, 700);
}
async function axName(page, sel) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.getDocument');
  const { result } = await cdp.send('Runtime.evaluate', { expression: `document.querySelector(${JSON.stringify(sel)})` });
  if (!result.objectId) { await cdp.detach(); return ''; }
  const { node } = await cdp.send('DOM.describeNode', { objectId: result.objectId });
  const { nodes } = await cdp.send('Accessibility.queryAXTree', { backendNodeId: node.backendNodeId });
  await cdp.detach(); return nodes[0]?.name?.value ?? '';
}
const groups = (page) => page.evaluate(() => {
  const b = window.__bench;
  return [...document.querySelectorAll(b.group)].filter((g) => g.getClientRects().length)
    .map((g) => [...g.querySelectorAll(b.tab)].map((t) => t.textContent.trim()).filter(Boolean));
});
const center = (page, sel) => page.evaluate((s) => { const r = document.querySelector(s)?.getBoundingClientRect(); return r && { x: r.left + r.width / 2, y: r.top + r.height / 2, r: { l: r.left, t: r.top, w: r.width, h: r.height } }; }, sel);
const tabCenter = (page, text) => page.evaluate((t) => {
  const el = [...document.querySelectorAll(window.__bench.tab)].find((x) => x.textContent.trim() === t);
  const r = el?.getBoundingClientRect(); return r && { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}, text);

const PROBES = {
  // 1. Drag the Explorer/Editor handle +120 px, then scan ±16 px around it to find the real grab area.
  async resize(page, lib) {
    const c = {}; const h = await handle(page); if (!h) return { checks: { drag_resizes: false }, note: 'no handle found' };
    const before = await paneW(page);
    await drag(page, h, { x: h.x + 120, y: h.y });
    const delta = (await paneW(page)) - before;
    c.drag_resizes = Math.abs(delta - 120) <= 12;
    let hit = 0; const hits = [];
    for (let dx = -16; dx <= 16; dx++) {
      await fresh(page, lib); const hh = await handle(page); const w0 = await paneW(page);
      await drag(page, { x: hh.x + dx, y: hh.y }, { x: hh.x + dx + 80, y: hh.y }, 6); // 80 px: past react-grid-layout's half-column snap
      if (Math.abs((await paneW(page)) - w0) >= 10) { hit++; hits.push(dx); }
    }
    c.hit_area_at_least_10px = hit >= 10;
    return { checks: c, metrics: { drag_delta_px: delta, hit_area_px: hit, hit_range: hits.length ? [hits[0], hits.at(-1)] : null, handle_element_px: Math.round(h.w * 10) / 10 } };
  },
  // 2. APG window splitter: reach the handle with Tab, then arrows, Home/End, Enter to collapse and restore.
  async keyboard(page) {
    const c = {}; await handle(page);
    await page.evaluate(() => document.activeElement?.blur()); await page.mouse.click(700, 20);
    let reached = false;
    for (let i = 0; i < 60 && !reached; i++) {
      await page.keyboard.press('Tab');
      reached = await page.evaluate(() => document.activeElement?.hasAttribute('data-bench-handle') || !!document.activeElement?.closest('[data-bench-handle]'));
    }
    c.reachable_by_tab = reached;
    if (!reached) await page.evaluate(() => document.querySelector('[data-bench-handle]')?.focus());
    const focused = await page.evaluate(() => document.activeElement?.hasAttribute('data-bench-handle'));
    const attrs = await page.evaluate(() => { const e = document.querySelector('[data-bench-handle]'); return { role: e.getAttribute('role'), now: e.getAttribute('aria-valuenow'), controls: e.getAttribute('aria-controls') }; });
    c.separator_role = attrs.role === 'separator';
    c.value_attrs = attrs.now !== null;
    c.accessible_name = !!(await axName(page, '[data-bench-handle]'));
    if (!focused) return { checks: { ...c, arrow_resizes: false, home_end: false, enter_collapses_and_restores: false }, metrics: {}, note: 'handle cannot take focus' };
    const w0 = await paneW(page);
    await page.keyboard.press('ArrowRight'); await wait(page, 150);
    const w1 = await paneW(page);
    c.arrow_resizes = focused && w1 > w0;
    await page.keyboard.press('Home'); await wait(page, 150); const home = await paneW(page);
    await page.keyboard.press('End'); await wait(page, 150); const end = await paneW(page);
    c.home_end = focused && home < w0 && end > w1;
    // From an open state (End): Enter collapses, Enter again restores.
    await page.keyboard.press('End'); await wait(page, 150);
    const preCollapse = await paneW(page);
    await page.keyboard.press('Enter'); await wait(page, 250); const collapsed = await paneW(page);
    await page.keyboard.press('Enter'); await wait(page, 250); const restored = await paneW(page);
    c.enter_collapses_and_restores = focused && collapsed < 10 && Math.abs(restored - preCollapse) <= 10;
    return { checks: c, metrics: { arrow_step_px: w1 - w0, home_px: home, end_px: end, collapsed_px: collapsed, restored_px: restored, aria_controls: attrs.controls } };
  },
  // 3. Drag +120, then double-click the handle: back to the default width?
  async reset(page) {
    const h = await handle(page); await drag(page, h, { x: h.x + 120, y: h.y });
    const h2 = await handle(page); await page.mouse.dblclick(h2.x, h2.y); await wait(page, 400);
    const w = await paneW(page);
    return { checks: { double_click_resets: Math.abs(w - DEFAULT.explorer) <= 8 }, metrics: { after_dblclick_px: w } };
  },
  // 4. Drag +120, reload, and sample the Explorer width every frame from the first paint: restored, and without a jump?
  async persist(page) {
    const h = await handle(page); await drag(page, h, { x: h.x + 120, y: h.y }); await wait(page, 700);
    const want = await paneW(page);
    await page.addInitScript(() => {
      window.__samples = []; window.__cls = 0;
      new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
      const t0 = performance.now();
      const tick = () => { const p = document.querySelector('[data-pane=explorer]'); if (p) window.__samples.push(Math.round(p.getBoundingClientRect().width)); if (performance.now() - t0 < 1500) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    await page.reload(); await wait(page, 1800);
    const { samples, cls } = await page.evaluate(() => ({ samples: window.__samples, cls: window.__cls }));
    const got = await paneW(page); const painted = samples.filter((s) => s > 0);
    return { checks: { restores_after_reload: Math.abs(got - want) <= 6, no_jump_on_restore: painted.length > 0 && painted.every((s) => Math.abs(s - got) <= 4) },
      metrics: { saved_px: want, restored_px: got, first_painted_px: painted[0] ?? null, cls: Math.round(cls * 1000) / 1000 } };
  },
  // 5. Rearrange: docking libraries dock a tab, split to an edge and pop out; tiles move; split panes have no such model.
  async rearrange(page, lib, ctx) {
    const model = await page.evaluate(() => window.__bench.model);
    if (model === 'split') return { supported: false, note: 'Split panes only: no tabs, docking or tiles', checks: {} };
    const c = {};
    if (model === 'tiles') {
      const t = await page.evaluate(() => { const el = document.querySelector('[data-pane=inspector] .pane-title').getBoundingClientRect(); return { x: el.left + 40, y: el.top + 10 }; });
      await drag(page, t, { x: 40, y: t.y }, 20);
      const r = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-pane]')].map((p) => [p.dataset.pane, Math.round(p.getBoundingClientRect().left)])));
      c.drag_moves_tile = r.inspector === 0;
      c.keyboard_move_tile = await page.evaluate(() => { const t = document.querySelector('.react-grid-item'); return t.tabIndex >= 0 || !!t.querySelector('[tabindex="0"],button'); });
      return { checks: c, metrics: { lefts_after_move: r }, note: 'tile items have no tabindex or key handlers: keyboard move not provided' };
    }
    c.tabs_have_roles = await page.evaluate(() => document.querySelectorAll('[role=tablist]').length >= 3 && document.querySelectorAll('[role=tab]').length >= 4);
    // a) Terminal tab dropped on the centre of the Inspector pane joins the Inspector group.
    const from = await tabCenter(page, 'Terminal'); const ins = await center(page, '[data-pane=inspector]');
    await page.mouse.move(from.x, from.y); await page.mouse.down();
    for (let i = 1; i <= 20; i++) await page.mouse.move(from.x + ((ins.x - from.x) * i) / 20, from.y + ((ins.y - from.y) * i) / 20);
    await wait(page, 200);
    const shotPath = join(HERE, 'dist', `${lib}-dock.jpg`);
    await page.screenshot({ path: shotPath, type: 'jpeg', quality: 82 });
    await page.mouse.up(); await wait(page, 400);
    const g1 = await groups(page);
    c.dock_to_centre = g1.some((g) => g.includes('Terminal') && g.includes('Inspector'));
    // b) Terminal tab dropped on the bottom edge of the Editor pane makes a new group below it.
    await fresh(page, lib);
    const f2 = await tabCenter(page, 'Terminal'); const ed = await center(page, '[data-pane=editor]');
    const before = (await groups(page)).length;
    await drag(page, f2, { x: ed.x, y: ed.r.t + ed.r.h - 25 }, 20);
    const g2 = await groups(page);
    c.dock_to_edge_splits = g2.length === before + 1 && g2.some((g) => g.length === 1 && g[0] === 'Terminal');
    // c) Pop the Editor group out into a new browser window.
    await fresh(page, lib);
    const pop = await page.evaluate(() => {
      const b = window.__bench; const ed = document.querySelector('[data-pane=editor]');
      const els = [...document.querySelectorAll(b.popout)].filter((e) => e.getClientRects().length);
      const r0 = ed.getBoundingClientRect();
      const near = els.sort((a, c) => { const ra = a.getBoundingClientRect(), rc = c.getBoundingClientRect(); return Math.hypot(ra.left - r0.right, ra.top - r0.top) - Math.hypot(rc.left - r0.right, rc.top - r0.top); })[0];
      if (!near) return null; near.setAttribute('data-bench-popout', '1'); return true;
    });
    if (pop) {
      const [win] = await Promise.all([ctx.waitForEvent('page', { timeout: 4000 }).catch(() => null), page.click('[data-bench-popout]')]);
      if (win) await win.waitForLoadState().catch(() => {}); await wait(page, 800);
      c.pop_out_window = !!win && (await win.evaluate(() => !!document.querySelector('[data-pane]')).catch(() => false));
      if (win) await win.close().catch(() => {});
    } else c.pop_out_window = false;
    // d) A non-drag way to move a tab (WCAG 2.5.7): a context menu on the focused tab, built in?
    await fresh(page, lib);
    await page.evaluate(() => [...document.querySelectorAll('[role=tab]')].find((t) => t.textContent.trim() === 'Terminal')?.focus());
    await page.keyboard.press('Shift+F10'); await wait(page, 300);
    const menu = await page.evaluate(() => [...document.querySelectorAll('[role=menu]')].filter((m) => m.getClientRects().length).map((m) => m.textContent.trim().slice(0, 80)));
    c.non_drag_move_built_in = menu.some((m) => /move|split|float|dock|pop/i.test(m));
    return { checks: c, metrics: { groups_after_centre: g1, groups_after_edge: g2, menu }, shot: shotPath };
  },
  // 6. Drag the handle 240 px over 60 frames while every pane redraws its 20k-point canvas. Median of 3 runs.
  async perf(page, lib) {
    const runs = [];
    for (let k = 0; k < 3; k++) {
      if (k) await fresh(page, lib);
      const h = await handle(page);
      await page.evaluate(() => { window.__bench.redraws = 0; window.__bench.drawMs = 0; window.__frames = []; let last = performance.now(); window.__rec = true;
        const tick = (t) => { window.__frames.push(t - last); last = t; if (window.__rec) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
      await page.mouse.move(h.x, h.y); await page.mouse.down();
      for (let i = 1; i <= 60; i++) { await page.mouse.move(h.x + i * 4, h.y); await frame(page); }
      await page.mouse.up(); await wait(page, 300);
      runs.push(await page.evaluate(() => { window.__rec = false; const f = window.__frames.slice(1).sort((a, b) => a - b);
        return { p95: f[Math.floor(f.length * 0.95)] ?? 0, max: f.at(-1) ?? 0, long: f.filter((x) => x > 50).length, redraws: window.__bench.redraws }; }));
    }
    const med = (k) => runs.map((r) => r[k]).sort((a, b) => a - b)[1];
    return { checks: {}, metrics: { frame_p95_ms: Math.round(med('p95') * 10) / 10, frame_max_ms: Math.round(med('max')), long_frames: med('long'), canvas_redraws: med('redraws') } };
  },
};
const TASKS = Object.keys(PROBES);

const results = existsSync(join(HERE, 'results.json')) ? JSON.parse(readFileSync(join(HERE, 'results.json'), 'utf8')) : {};
const browser = await chromium.launch();
for (const lib of libs) {
  const size = await bundle(lib, join(HERE, 'libs', `${lib}.jsx`));
  writeFileSync(join(HERE, 'dist', `${lib}.html`), readFileSync(join(HERE, 'page.html'), 'utf8').replace('LIB.js', `${lib}.js`).replace('LIB.css', `${lib}.css`));
  const errors = []; const probe = {}; let dockShot = null;
  for (const task of TASKS) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-GB' });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(`${task}: ${e.message.slice(0, 200)}`));
    page.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push(`${task}: ${m.text().slice(0, 200)}`));
    await fresh(page, lib);
    const r = await PROBES[task](page, lib, ctx).catch((e) => ({ checks: {}, note: `probe error: ${e.message.split('\n')[0]}` }));
    if (r.shot) dockShot = r.shot;
    probe[task] = { supported: r.supported ?? true, checks: r.checks, metrics: r.metrics ?? {}, ...(r.note ? { note: r.note } : {}) };
    await ctx.close();
  }
  // axe on the resting layout, and a screenshot: the dock drop overlay mid-drag, or the focused splitter.
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-GB' }); const page = await ctx.newPage();
  await fresh(page, lib);
  await page.evaluate(AXE);
  const axe = await page.evaluate(async () => (await window.axe.run('#app', { rules: { region: { enabled: false } } })).violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(' ')}`));
  mkdirSync(join(SOURCES, lib), { recursive: true });
  if (dockShot) copyFileSync(dockShot, join(SOURCES, lib, 'bench.jpg'));
  else {
    await handle(page); await page.evaluate(() => document.querySelector('[data-bench-handle]')?.focus());
    await page.keyboard.press('ArrowRight').catch(() => {}); await wait(page, 200);
    const h = await handle(page); if (h) await page.mouse.move(h.x, h.y); await wait(page, 300);
    await page.screenshot({ path: join(SOURCES, lib, 'bench.jpg'), type: 'jpeg', quality: 82 });
  }
  await ctx.close();

  const checks = Object.values(probe).flatMap((p) => Object.values(p.checks));
  results[lib] = {
    kind: 'panels', model: await (async () => { const s = readFileSync(join(HERE, 'libs', `${lib}.jsx`), 'utf8'); return s.match(/model: '(\w+)'/)[1]; })(),
    bundle_gz_kb: size.js, css_gz_kb: size.css, baseline_kb: baseline,
    lib_only_gz_kb: Math.round((size.js - baseline + size.css) * 10) / 10,
    tasks_total: TASKS.length, tasks_supported: Object.values(probe).filter((p) => p.supported).length,
    checks_passed: checks.filter(Boolean).length, checks_total: checks.length,
    hit_area_px: probe.resize.metrics.hit_area_px ?? 0, frame_p95_ms: probe.perf.metrics.frame_p95_ms ?? null,
    axe_violations: axe.length, axe, probe, errors,
  };
  const r = results[lib];
  console.log(lib.padEnd(24), `${r.lib_only_gz_kb} KB gz (js ${size.js}, css ${size.css})`, `checks ${r.checks_passed}/${r.checks_total}`, `hit ${r.hit_area_px}px`, `p95 ${r.frame_p95_ms}ms`, `axe ${r.axe_violations}`);
  for (const [t, p] of Object.entries(probe)) {
    const failed = Object.entries(p.checks).filter(([, v]) => !v).map(([k]) => k);
    console.log('   ', t.padEnd(10), p.supported ? `${Object.values(p.checks).filter(Boolean).length}/${Object.keys(p.checks).length}` : 'n/a', failed.length ? `FAIL ${failed.join(', ')}` : '', JSON.stringify(p.metrics), p.note ?? '');
  }
  if (axe.length) console.log('    axe', axe);
  if (errors.length) console.log('    errors', errors.slice(0, 4));
}
await browser.close(); server.close();
writeFileSync(join(HERE, 'results.json'), JSON.stringify(results, null, 2) + '\n');
