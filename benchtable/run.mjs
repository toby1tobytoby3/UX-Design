#!/usr/bin/env node
// Tables and data grids benchmark: the same 10,000-row dataset and four tasks in each kit.
//   node run.mjs [kit ...]     (default: every file in libs/)
// Each task runs on a fresh page with one grid. Probes read the rendered DOM (or, for the canvas kit, its own API)
// and real input (mouse, wheel, keyboard), never the library's internals. Timings use 4x CPU throttling and are only
// comparable with each other. Writes ../sources/<slug>/bench.jpg and results.json.
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, basename, extname } from 'node:path';
import { MIN_AMOUNT, MAX_AMOUNT, FIRST_REFUNDED, LAST_ID, ROWS, COLUMNS } from './data.js';

const HERE = new URL('.', import.meta.url).pathname;
const SOURCES = join(HERE, '../sources');
const want = process.argv.slice(2);
const kits = readdirSync(join(HERE, 'libs')).filter((f) => /\.jsx?$/.test(f) && !f.startsWith('_')).map((f) => basename(f, extname(f)))
  .filter((k) => !want.length || want.includes(k));
const AXE = readFileSync(join(HERE, 'node_modules/axe-core/axe.min.js'), 'utf8');
const TITLES = Object.fromEntries(COLUMNS.map((c) => [c.id, c.title]));
const median = (xs) => { const v = xs.filter((x) => x != null).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : null; };

async function bundle(name, entry) {
  const out = join(HERE, 'dist', `${name}.js`);
  await build({ entryPoints: [entry], bundle: true, minify: true, format: 'iife', outfile: out, nodePaths: [join(HERE, 'node_modules')],
    define: { 'process.env.NODE_ENV': '"production"' }, jsx: 'automatic', logLevel: 'error', loader: { '.css': 'css' } });
  const css = out.replace(/\.js$/, '.css');
  return { js: Math.round(gzipSync(readFileSync(out)).length / 102.4) / 10, css: existsSync(css) ? Math.round(gzipSync(readFileSync(css)).length / 102.4) / 10 : 0 };
}
mkdirSync(join(HERE, 'dist'), { recursive: true });
// Baseline: React + the shared shell + the dataset, rendering an empty grid. Subtracted from every kit.
writeFileSync(join(HERE, 'dist', '_base.jsx'), `import { renderBench } from '../shared.jsx'; import { data } from '../data.js'; renderBench('base', () => data.length);`);
const base = (await bundle('_base', join(HERE, 'dist', '_base.jsx'))).js;

const server = createServer((req, res) => {
  const file = join(HERE, 'dist', req.url.split('?')[0]);
  if (!existsSync(file)) { res.writeHead(404).end(); return; }
  const type = file.endsWith('.html') ? 'text/html' : file.endsWith('.css') ? 'text/css' : 'text/javascript';
  res.writeHead(200, { 'content-type': type }).end(readFileSync(file));
}).listen(0);
const host = `http://127.0.0.1:${server.address().port}`;

// In-page helpers. A canvas kit sets window.__bench.cellRect / focusRect; everything else is read from the DOM.
const HELPERS = (titles) => {
  const rect = (e) => { const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height, right: r.right, bottom: r.bottom }; };
  const norm = (s) => s.replace(/[▲▼↑↓]/g, '').replace(/\s+/g, ' ').trim();
  const view = () => document.querySelector('.view');
  const CELLS = '[role=gridcell],[role=cell],[role=rowheader],td';
  window.__probe = {
    header(id) {
      if (window.__bench.cellRect) { const r = window.__bench.cellRect('header', id); return r && r.width > 1 ? { ...r, right: r.left + r.width, bottom: r.top + r.height } : null; }
      const t = titles[id];
      const h = [...view().querySelectorAll('[role=columnheader],th')].find((e) => { const s = norm(e.textContent); return s === t || (s.startsWith(t) && s.length <= t.length + 2); });
      if (!h) return null; const r = rect(h); return r.width > 1 ? r : null;
    },
    cell(id, rowId) {
      if (window.__bench.cellRect) { const r = window.__bench.cellRect('cell', id, rowId); return r && { ...r, right: r.left + r.width, bottom: r.top + r.height }; }
      const h = this.header(id); if (!h) return null;
      const all = [...view().querySelectorAll(CELLS)];
      const key = all.find((c) => norm(c.textContent) === rowId); if (!key) return null;
      const k = rect(key); const mid = (k.top + k.bottom) / 2;
      const cell = all.find((c) => { const r = rect(c); const cx = (r.left + r.right) / 2; return r.top <= mid && r.bottom >= mid && cx >= h.left && cx <= h.right; });
      return cell ? rect(cell) : null;
    },
    focus() {
      if (window.__bench.focusRect) return { inside: true, ...window.__bench.focusRect() };
      const a = document.activeElement;
      const inside = !!a && view().contains(a) && a !== view();
      const cell = a?.closest?.('[role=gridcell],[role=columnheader],[role=rowheader],[role=cell],td,th');
      const row = a?.closest?.('[role=row],tr');
      return { inside, tag: a?.tagName, role: a?.getAttribute?.('role'), label: a?.getAttribute?.('aria-label'), cellRole: cell?.getAttribute('role') ?? cell?.tagName,
        rowSelected: row?.getAttribute('aria-selected'), editor: ['INPUT', 'TEXTAREA'].includes(a?.tagName) && a.type !== 'checkbox', ...(cell ? rect(cell) : {}) };
    },
    rows() { return view().querySelectorAll('[role=row],tr').length; },
    semantics() {
      const root = view().querySelector('[role=grid],[role=treegrid],[role=table],table');
      return { role: root?.getAttribute('role') ?? (root?.tagName === 'TABLE' ? 'table' : null), rowcount: view().querySelector('[aria-rowcount]')?.getAttribute('aria-rowcount') ?? null,
        multiselectable: root?.getAttribute('aria-multiselectable') ?? null };
    },
    scroller() { return [...view().querySelectorAll('*')].filter((e) => e.scrollHeight - e.clientHeight > 200 && /auto|scroll/.test(getComputedStyle(e).overflowY)).sort((a, b) => b.scrollHeight - a.scrollHeight)[0]; },
    toBottom() { if (window.__bench.scrollToBottom) return window.__bench.scrollToBottom(); const s = this.scroller(); if (s) s.scrollTop = s.scrollHeight; },
    headerCheckbox() {
      if (window.__bench.cellRect) return window.__probe.header('select');
      const box = [...view().querySelectorAll('[role=columnheader] input[type=checkbox],[role=columnheader] [role=checkbox],th input[type=checkbox],[role=columnheader] .ag-checkbox-input,[role=columnheader] label')][0];
      return box ? rect(box) : null;
    },
    // Resolve once `cond` is true; time is measured from the next pointerdown, change or keydown.
    watch(cond) {
      return new Promise((resolve) => {
        let t0 = null;
        const start = () => { if (t0 === null) { t0 = performance.now(); requestAnimationFrame(tick); } };
        for (const ev of ['pointerdown', 'change', 'keydown']) addEventListener(ev, start, { capture: true, once: true });
        const tick = () => { if (cond()) resolve(Math.round(performance.now() - t0)); else if (performance.now() - t0 > 20000) resolve(null); else requestAnimationFrame(tick); };
      });
    },
    frames(ms) {
      return new Promise((resolve) => { const ts = []; const t0 = performance.now(); const f = (t) => { ts.push(t); if (t - t0 < ms) requestAnimationFrame(f); else resolve(ts); }; requestAnimationFrame(f); });
    },
  };
};

const log = process.env.V ? (...a) => console.log(new Date().toISOString().slice(11, 19), ...a) : () => {};
const browser = await chromium.launch();
async function open(kit, task, { throttle = 1 } = {}) {
  const page = await browser.newPage({ viewport: { width: 860, height: 640 }, locale: 'en-GB' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  let cdp = null;
  if (throttle > 1) { cdp = await page.context().newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle }); }
  log('open', kit, task);
  await page.goto(`${host}/${kit}.html?task=${task}`);
  await page.waitForFunction(() => window.__bench?.renderMs != null, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(HELPERS, TITLES);
  await page.waitForTimeout(400);
  return { page, errors, cdp };
}
const center = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
async function axe(page) {
  await page.evaluate(AXE);
  return page.evaluate(async () => {
    const r = await window.axe.run({ include: [['.view']] }, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } });
    return r.violations.map((v) => `${v.id} [${v.impact}] (${v.nodes.length})`);
  });
}
const gridBox = (page) => page.evaluate(() => { const r = document.querySelector('.view').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });

const TASKS = {
  async big(kit) {
    const out = { renders: [], sorts: [], filters: [] };
    for (let i = 0; i < 3; i++) {
      const { page, errors } = await open(kit, 'big', { throttle: 4 });
      out.renders.push(await page.evaluate(() => window.__bench.renderMs)); out.errors = errors;
      await page.close();
    }
    for (let i = 0; i < 3; i++) {
      const { page } = await open(kit, 'big', { throttle: 4 });
      const h = await page.evaluate(() => window.__probe.header('amount'));
      if (!h) { out.sort_note = 'Amount header not found'; await page.close(); break; }
      const done = page.evaluate((a) => window.__probe.watch(() => window.__bench.hasText(a[0]) || window.__bench.hasText(a[1])), [MIN_AMOUNT, MAX_AMOUNT]);
      const c = center(h); await page.mouse.click(c.x - 10, c.y);
      out.sorts.push(await done); await page.close();
    }
    for (let i = 0; i < 3; i++) {
      const { page } = await open(kit, 'big', { throttle: 4 });
      const done = page.evaluate((id) => window.__probe.watch(() => window.__bench.hasText(id) && !window.__bench.hasText('INV-00001')), FIRST_REFUNDED);
      await page.selectOption('#status-filter', 'Refunded');
      out.filters.push(await done); await page.close();
    }
    const { page, errors } = await open(kit, 'big', { throttle: 4 });
    const g = await gridBox(page); await page.mouse.move(g.x, g.y);
    const frames = page.evaluate(() => window.__probe.frames(1800));
    for (let i = 0; i < 50; i++) { await page.mouse.wheel(0, 900); await page.waitForTimeout(16); }
    const ts = await frames;
    const gaps = ts.slice(1).map((t, i) => t - ts[i]).sort((a, b) => a - b);
    const semantics = await page.evaluate(() => window.__probe.semantics());
    const domRows = await page.evaluate(() => window.__probe.rows());
    await page.evaluate(() => window.__probe.toBottom());
    await page.waitForTimeout(1500);
    const reachesLast = await page.evaluate((id) => window.__bench.hasText(id), LAST_ID);
    const ax = await axe(page);
    await page.close();
    return { supported: true, render_ms: median(out.renders), sort_ms: median(out.sorts), filter_ms: median(out.filters),
      sort_note: out.sort_note, scroll_p95_ms: Math.round(gaps[Math.floor(gaps.length * 0.95)] ?? 0), long_frames: gaps.filter((x) => x > 50).length,
      dom_rows: domRows, virtualised: domRows < 200, reaches_last_row: reachesLast, aria_rowcount: semantics.rowcount,
      aria_rowcount_ok: [String(ROWS), String(ROWS + 1)].includes(String(semantics.rowcount)), role: semantics.role, axe: ax, errors: [...(out.errors ?? []), ...errors] };
  },

  async layout(kit) {
    const r = {};
    let { page } = await open(kit, 'layout');
    const g = await gridBox(page);
    const h0 = await page.evaluate(() => window.__probe.header('amount'));
    await page.mouse.move(g.x, g.y); await page.mouse.wheel(0, 2400); await page.waitForTimeout(600);
    const h1 = await page.evaluate(() => window.__probe.header('amount'));
    const scrolled = !(await page.evaluate(() => window.__bench.hasText('INV-00001')));
    r.sticky_header = !!(h0 && h1 && scrolled && Math.abs(h0.top - h1.top) <= 2);
    await page.close();

    ({ page } = await open(kit, 'layout'));
    const id0 = await page.evaluate(() => window.__probe.header('id'));
    const st0 = await page.evaluate(() => window.__probe.header('status'));
    await page.mouse.move(g.x, g.y); await page.mouse.wheel(300, 0); await page.waitForTimeout(600);
    const id1 = await page.evaluate(() => window.__probe.header('id'));
    const st1 = await page.evaluate(() => window.__probe.header('status'));
    const movedSideways = !st1 || (st0 && st1.left < st0.left - 50);
    r.pinned_first_column = !!(id0 && id1 && movedSideways && Math.abs(id0.left - id1.left) <= 2);
    r.scrolled_sideways = !!movedSideways;
    await page.close();

    ({ page } = await open(kit, 'layout'));
    const c0 = await page.evaluate(() => window.__probe.header('customer'));
    if (c0) {
      await page.mouse.move(c0.right - 3, c0.top + c0.height / 2); await page.mouse.down();
      for (let i = 1; i <= 8; i++) { await page.mouse.move(c0.right - 3 + i * 10, c0.top + c0.height / 2); await page.waitForTimeout(16); }
      await page.mouse.up(); await page.waitForTimeout(400);
      const c1 = await page.evaluate(() => window.__probe.header('customer'));
      r.resize_drag_px = c1 ? Math.round(c1.width - c0.width) : null;
      r.resize_drag = (r.resize_drag_px ?? 0) >= 50;
      // Keyboard resize: a focusable resizer in the Customer header.
      const kb = await page.evaluate(() => {
        const h = [...document.querySelectorAll('.view [role=columnheader],.view th')].find((e) => e.textContent.trim().startsWith('Customer'));
        const el = h && [...h.querySelectorAll('[role=separator],[aria-label*="esize" i],input[type=range]')].find((x) => x.tabIndex >= 0 || x.tagName === 'INPUT');
        if (!el) return false; el.focus(); return document.activeElement === el || h.contains(document.activeElement);
      });
      if (kb) {
        const w0 = (await page.evaluate(() => window.__probe.header('customer'))).width;
        for (let i = 0; i < 4; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(60); }
        const w1 = (await page.evaluate(() => window.__probe.header('customer'))).width;
        r.resize_keyboard = w1 - w0 >= 10;
      } else r.resize_keyboard = false;
    }
    await page.close();

    ({ page } = await open(kit, 'layout'));
    r.hide_method = await page.evaluate(() => window.__bench.api.hideMethod);
    await page.evaluate(() => window.__bench.api.hideColumn('owner')); await page.waitForTimeout(500);
    r.hide_column = !(await page.evaluate(() => window.__probe.header('owner'))) && !!(await page.evaluate(() => window.__probe.header('id')));
    // Screenshot the layout state: scrolled sideways under a pinned column.
    r.axe = await axe(page);
    await page.close();
    r.supported = true;
    return r;
  },

  async select(kit) {
    const r = {};
    const { page } = await open(kit, 'select');
    await page.focus('#before'); await page.keyboard.press('Tab'); await page.waitForTimeout(150);
    const f0 = await page.evaluate(() => window.__probe.focus());
    r.tab_into_grid = f0.inside; r.first_focus = [f0.tag, f0.role ?? f0.cellRole, f0.label].filter(Boolean).join(' ');
    const press = async (k) => { await page.keyboard.press(k); await page.waitForTimeout(120); return page.evaluate(() => window.__probe.focus()); };
    const p1 = await press('ArrowDown');
    const p2 = await press('ArrowDown');
    r.arrow_down_moves = p2.top != null && p1.top != null && p2.top > p1.top + 10;
    const p3 = await press('ArrowRight');
    r.arrow_right_moves = p3.left != null && p2.left != null && p3.left > p2.left + 10;
    r.focus_role = p3.cellRole ?? p3.role ?? p3.tag;
    await press('ArrowLeft');
    const before = await page.evaluate(() => window.__bench.api.getSelectedCount());
    const sp = await press('Space');
    const after = await page.evaluate(() => window.__bench.api.getSelectedCount());
    r.space_selects = after === before + 1;
    r.aria_selected = sp.rowSelected === 'true';
    await press('Shift+ArrowDown'); await press('Shift+ArrowDown');
    const ext = await page.evaluate(() => window.__bench.api.getSelectedCount());
    r.shift_extends = ext === after + 2;
    r.selected_after_shift = ext;
    const cb = await page.evaluate(() => window.__probe.headerCheckbox());
    if (cb) { const c = center(cb); await page.mouse.click(c.x, c.y); await page.waitForTimeout(500); }
    r.select_all_count = await page.evaluate(() => window.__bench.api.getSelectedCount());
    r.select_all = r.select_all_count >= 100; // MIT DataGrid pages rows; a full-page select-all counts
    const sem = await page.evaluate(() => window.__probe.semantics());
    r.role = sem.role; r.multiselectable = sem.multiselectable;
    r.count_visible = await page.evaluate(() => /\d[\d,]* rows? selected|selected/i.test(document.querySelector('.view').textContent));
    // Screenshot with three rows selected, before select-all.
    r.axe = await axe(page);
    await page.close();
    const keyboard = ['tab_into_grid', 'arrow_down_moves', 'arrow_right_moves', 'space_selects', 'shift_extends'];
    r.keyboard_passed = keyboard.filter((k) => r[k]).length; r.keyboard_total = keyboard.length;
    r.supported = true;
    return r;
  },

  async edit(kit) {
    const r = {};
    const { page } = await open(kit, 'edit');
    const cell = async () => page.evaluate(() => window.__probe.cell('amount', 'INV-00001'));
    const c0 = await cell();
    if (!c0) { await page.close(); return { supported: false, note: 'amount cell not found' }; }
    const isEditing = () => page.evaluate(() => { const a = document.activeElement; return (['INPUT', 'TEXTAREA'].includes(a?.tagName) && a.type !== 'checkbox') || !!window.__bench.isEditing?.(); });
    // How does editing start? Click the cell, then Enter, then F2, then double-click.
    let how = null;
    const startEdit = async () => {
      const c = center(await cell()); await page.mouse.click(c.x, c.y); await page.waitForTimeout(150);
      for (const [key, act] of [['Enter', () => page.keyboard.press('Enter')], ['F2', () => page.keyboard.press('F2')], ['double-click', () => page.mouse.dblclick(c.x, c.y)]]) {
        if (how && how !== key) continue;
        await act(); await page.waitForTimeout(250);
        if (await isEditing()) { how = key; return true; }
        if (key !== 'double-click') { await page.keyboard.press('Escape'); await page.mouse.click(c.x, c.y); await page.waitForTimeout(100); }
      }
      return false;
    };
    const type = async (s) => { await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.type(s, { delay: 20 }); };
    const amount = () => page.evaluate(() => window.__bench.api.getAmount('INV-00001'));
    if (!(await startEdit())) { r.supported = false; r.note = 'no editor opened by Enter, F2 or double-click'; r.axe = await axe(page); await page.close(); return r; }
    r.starts_with = how;
    await type('123.45'); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
    r.enter_commits = Number(await amount()) === 123.45 && await page.evaluate(() => window.__bench.hasText('123.45'));
    await startEdit(); await type('999'); await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    r.esc_cancels = Number(await amount()) === 123.45;
    const before = await page.evaluate(() => document.querySelector('.view').textContent.length);
    await startEdit(); await type('abc'); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
    const v = await amount();
    r.invalid_rejected = Number(v) === 123.45;
    r.invalid_value_stored = String(v);
    r.invalid_message = await page.evaluate(() => !!document.querySelector('.view [role=alert]') || /invalid|enter a number|must be/i.test(document.querySelector('.view').textContent));
    if (await isEditing()) { await page.keyboard.press('Escape'); await page.waitForTimeout(200); }
    await startEdit(); await type('200'); await page.keyboard.press('Tab'); await page.waitForTimeout(400);
    r.tab_commits = Number(await amount()) === 200;
    const f = await page.evaluate(() => window.__probe.focus());
    const c1 = await cell();
    r.tab_moves_right = !!(f.left != null && c1 && f.left > c1.left + 20);
    r.axe = await axe(page);
    await page.close();
    r.supported = true;
    return r;
  },
};

async function screenshot(kit, slug) {
  const { page } = await open(kit, 'select');
  await page.focus('#before'); await page.keyboard.press('Tab');
  for (const k of ['ArrowDown', 'ArrowDown', 'Space', 'Shift+ArrowDown', 'Shift+ArrowDown']) { await page.keyboard.press(k); await page.waitForTimeout(100); }
  const g = await gridBox(page); await page.mouse.move(g.x, g.y); await page.mouse.wheel(220, 0); await page.waitForTimeout(500);
  mkdirSync(join(SOURCES, slug), { recursive: true });
  await page.locator('section').screenshot({ path: join(SOURCES, slug, 'bench.jpg'), type: 'jpeg', quality: 82 });
  await page.close();
}

const results = existsSync(join(HERE, 'results.json')) ? JSON.parse(readFileSync(join(HERE, 'results.json'), 'utf8')) : {};
for (const kit of kits) {
  const size = await bundle(kit, join(HERE, 'libs', `${kit}.jsx`));
  let html = readFileSync(join(HERE, 'page.html'), 'utf8').replace('LIB.js', `${kit}.js`);
  if (existsSync(join(HERE, 'dist', `${kit}.css`))) html = html.replace('</head>', `<link rel="stylesheet" href="${kit}.css"></head>`);
  writeFileSync(join(HERE, 'dist', `${kit}.html`), html);
  const probe = {};
  for (const [t, fn] of Object.entries(TASKS)) {
    try { probe[t] = await fn(kit); } catch (e) { probe[t] = { supported: false, note: `harness error: ${e.message.split('\n')[0]}` }; }
    console.log(kit, t, JSON.stringify(probe[t]).slice(0, 400));
  }
  await screenshot(kit, kit).catch((e) => console.log('screenshot failed', e.message));
  const { page } = await open(kit, 'big'); const notes = await page.evaluate(() => window.__bench.notes); await page.close();
  results[kit] = {
    kind: 'data-table', bundle_gz_kb: size.js, css_gz_kb: size.css, baseline_kb: base, lib_only_gz_kb: Math.round((size.js - base + size.css) * 10) / 10,
    tasks_total: 4, tasks_supported: Object.values(probe).filter((p) => p.supported).length, notes, probe,
    keyboard_passed: probe.select?.keyboard_passed ?? 0, keyboard_total: probe.select?.keyboard_total ?? 5,
    axe_violations: [probe.big, probe.layout, probe.select, probe.edit].reduce((n, p) => n + (p?.axe?.length ?? 0), 0),
  };
  console.log(kit, `${results[kit].lib_only_gz_kb} KB`);
}
await browser.close(); server.close();
writeFileSync(join(HERE, 'results.json'), JSON.stringify(results, null, 2) + '\n');
