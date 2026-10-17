#!/usr/bin/env node
// Motion benchmark runner: bundle each library's four tasks, measure gzipped size, then drive the same
// state changes in headless Chromium and sample the animated elements every frame.
//   node run.mjs [lib ...]     (default: all files in libs/)
// Writes ../sources/<slug>/bench.jpg and results.json (evidence for the motion source profiles).
// What it measures, per task: did it animate (intermediate frames), how long, which engine ran it (WAAPI/CSS on the
// compositor vs per-frame JavaScript), interruption continuity, reduced-motion behaviour, and main-thread cost of
// 60 simultaneous animations at 4x CPU throttling. Headless timings are relative, not real-device numbers.
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, basename, extname } from 'node:path';

const HERE = new URL('.', import.meta.url).pathname;
const SOURCES = join(HERE, '../sources');
const SLUGS = { native: 'native-css', anime: 'animejs' };
const want = process.argv.slice(2);
const libs = readdirSync(join(HERE, 'libs')).filter((f) => /\.jsx?$/.test(f) && !f.startsWith('_'))
  .map((f) => basename(f, extname(f))).filter((l) => !want.length || want.includes(l));

async function bundle(name, entry) {
  const out = join(HERE, 'dist', `${name}.js`);
  await build({ entryPoints: [entry], bundle: true, minify: true, format: 'iife', outfile: out,
    define: { 'process.env.NODE_ENV': '"production"' }, jsx: 'automatic', logLevel: 'error' });
  return Math.round(gzipSync(readFileSync(out)).length / 102.4) / 10;
}
mkdirSync(join(HERE, 'dist'), { recursive: true });
const reactBase = await bundle('_react', join(HERE, '../bench/libs/_react-baseline.jsx'));
// The shared shell (React + flushSync + markup) is part of every library's bundle: measure it alone too.
writeFileSync(join(HERE, 'dist', '_shell-only.jsx'), `import { renderBench } from '../libs/_shell.jsx'; renderBench('x', {});`);
const shellBase = await bundle('_shell', join(HERE, 'dist', '_shell-only.jsx'));

const server = createServer((req, res) => {
  const file = join(HERE, 'dist', req.url.split('?')[0]);
  if (!existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': file.endsWith('.js') ? 'text/javascript' : 'text/html' }).end(readFileSync(file));
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;

// In-page sampler: every animation frame, record each probed element's box and opacity plus the running
// animations (WAAPI/CSS, including View Transition pseudo-elements).
const SAMPLER = () => {
  window.__sample = (probes, ms) => new Promise((resolve) => {
    const out = []; const t0 = performance.now();
    const tick = () => {
      const t = performance.now() - t0; const row = { t };
      for (const p of probes) {
        const el = document.querySelector(`[data-probe="${p}"]`);
        if (!el) { row[p] = null; continue; }
        const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        row[p] = { x: r.left, y: r.top, w: r.width, h: r.height, o: Math.round(+cs.opacity * 100) }; // opacity in %
      }
      row.anims = document.getAnimations().filter((a) => a.playState === 'running').map((a) => ({
        type: a.constructor.name, pseudo: a.effect?.pseudoElement ?? null, probe: a.effect?.target?.dataset?.probe ?? null,
        timeline: a.timeline?.constructor?.name ?? null,
        props: Object.keys(a.effect?.getKeyframes?.()[0] ?? {}).filter((k) => !['offset', 'easing', 'composite', 'computedOffset'].includes(k)),
      }));
      out.push(row);
      if (t < ms) requestAnimationFrame(tick); else resolve(out);
    };
    tick(); // the first row is taken synchronously, before any state change, so it is the true start
  });
  window.__drive = async (task, steps, probes, ms) => {
    const sampling = window.__sample(probes, ms);
    for (const [delay, value] of steps) { await new Promise((r) => setTimeout(r, delay)); window.__bench.set(task, value); }
    return sampling;
  };
};

// Helpers over a sample series.
const series = (rows, probe, key) => rows.map((r) => r[probe]?.[key]).filter((v) => v !== undefined && v !== null);
function motionOf(rows, probe, key) {
  const v = series(rows, probe, key);
  if (v.length < 2) return { frames: 0, ms: 0 };
  const a = v[0], b = v[v.length - 1];
  const moving = rows.filter((r, i) => i > 0 && r[probe] && rows[i - 1][probe] && Math.abs(r[probe][key] - rows[i - 1][probe][key]) > 0.3);
  const between = v.filter((x) => Math.abs(x - a) > 0.5 && Math.abs(x - b) > 0.5).length;
  return { frames: between, ms: moving.length ? Math.round(moving.at(-1).t - moving[0].t) : 0 };
}
const vtRows = (rows, name) => rows.filter((r) => r.anims.some((a) => a.pseudo?.includes(`(${name})`)));
const vtFrames = (rows, name) => vtRows(rows, name).length;
const vtMs = (rows, name) => { const v = vtRows(rows, name); return v.length > 1 ? Math.round(v.at(-1).t - v[0].t) : 0; };
function engines(rows, probes) {
  const seen = new Set();
  for (const r of rows) for (const a of r.anims) {
    if (a.pseudo?.startsWith('::view-transition')) seen.add('view-transition');
    else if (probes.includes(a.probe)) seen.add(a.type === 'Animation' ? 'waapi' : a.type === 'CSSTransition' ? 'css-transition' : 'css-animation');
  }
  return seen.size ? [...seen].join('+') : 'js-per-frame';
}

const results = existsSync(join(HERE, 'results.json')) ? JSON.parse(readFileSync(join(HERE, 'results.json'), 'utf8')) : {};
const browser = await chromium.launch();

async function open(lib, opts = {}) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 760 }, locale: 'en-GB', ...opts });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  await page.goto(`${base}/${lib}.html`);
  await page.waitForFunction(() => window.__bench?.ready, null, { timeout: 15000 });
  await page.evaluate(SAMPLER);
  await page.waitForTimeout(300);
  return { page, errors };
}

for (const lib of libs) {
  const file = readdirSync(join(HERE, 'libs')).find((f) => basename(f, extname(f)) === lib);
  const gz = await bundle(lib, join(HERE, 'libs', file));
  writeFileSync(join(HERE, 'dist', `${lib}.html`), readFileSync(join(HERE, 'page.html'), 'utf8').replace('LIB.js', `${lib}.js`));
  const { page, errors } = await open(lib);
  const notes = await page.evaluate(() => window.__bench.notes);
  const na = await page.evaluate(() => [...document.querySelectorAll('[data-na]')].map((n) => n.closest('section').id));
  const probe = {};

  // 1. Shared element: open card 0, then close it.
  if (!na.includes('layout')) {
    const openRows = await page.evaluate(() => window.__drive('layout', [[0, 0]], ['card-0'], 900));
    const closeRows = await page.evaluate(() => window.__drive('layout', [[0, null]], ['card-0'], 900));
    const o = motionOf(openRows, 'card-0', 'w'), c = motionOf(closeRows, 'card-0', 'w');
    const vt = vtFrames(openRows, 'card-0');
    probe.layout = { supported: true, note: notes.layout, animated_open: o.frames >= 3 || vt >= 3, animated_close: c.frames >= 3 || vtFrames(closeRows, 'card-0') >= 3,
      ms: o.ms || vtMs(openRows, 'card-0'), engine: engines(openRows, ['card-0']) };
  } else probe.layout = { supported: false, note: notes.layout };

  // 2. Enter and exit: add item 3, then remove item 1 (items 2 and 3 should glide up).
  if (!na.includes('presence')) {
    const enter = await page.evaluate(() => window.__drive('presence', [[0, [0, 1, 2, 3]]], ['item-3'], 700));
    const exit = await page.evaluate(() => window.__drive('presence', [[0, [0, 2, 3]]], ['item-1', 'item-2'], 1100));
    const enterAnim = motionOf(enter, 'item-3', 'o').frames + motionOf(enter, 'item-3', 'y').frames >= 3 || vtFrames(enter, 'item-3') >= 3;
    const exitKept = exit.filter((r) => r['item-1']).length;
    const exitAnim = (exitKept >= 4 && motionOf(exit, 'item-1', 'o').frames + motionOf(exit, 'item-1', 'x').frames >= 3) || vtFrames(exit, 'item-1') >= 3;
    const glide = motionOf(exit, 'item-2', 'y').frames >= 3 || vtFrames(exit, 'item-2') >= 3;
    probe.presence = { supported: true, note: notes.presence, enter_animated: enterAnim, exit_animated: exitAnim, siblings_glide: glide, engine: engines([...enter, ...exit], ['item-1', 'item-2', 'item-3']) };
  } else probe.presence = { supported: false, note: notes.presence };

  // 3. Interruption: time an uninterrupted open first, then reverse when it is halfway there and check for
  // position jumps, settle time and overshoot.
  if (!na.includes('interrupt')) {
    const full = await page.evaluate(() => window.__drive('interrupt', [[0, true]], ['drawer'], 1800));
    const fx = full.map((r) => r.drawer.x);
    const fm = motionOf(full, 'drawer', 'x');
    await page.evaluate(() => window.__bench.set('interrupt', false)); await page.waitForTimeout(1800);
    const end = fx.at(-1);
    const half = full.find((r) => r.drawer.x - fx[0] >= (end - fx[0]) / 2);
    const at = Math.max(32, Math.round(half?.t ?? fm.ms * 0.4));
    const rows = await page.evaluate((at) => window.__drive('interrupt', [[0, true], [at, false]], ['drawer'], 1800), at);
    const xs = rows.map((r) => ({ t: r.t, x: r.drawer.x }));
    const start = xs[0].x;
    const peak = xs.reduce((m, p) => (p.x > m.x ? p : m), xs[0]);
    const i = xs.indexOf(peak);
    const deltas = xs.slice(1).map((p, k) => p.x - xs[k].x);
    // Frames around the reverse command. Whether velocity carries over (springs) is not measured: headless frame
    // timing is too irregular to tell it from one frame of latency, so profiles cite the library docs for it.
    const c = xs.findIndex((p) => p.t >= at + 4);
    const post = deltas.slice(c - 1, c + 3);
    const moving = xs.filter((p, k) => k && Math.abs(p.x - xs[k - 1].x) > 0.3);
    probe.interrupt = { supported: true, note: notes.interrupt, reverse_at_ms: at, reversed_at_px: Math.round(peak.x - start),
      position_jump: Math.max(...post.map(Math.abs)) > 120, // a teleport: 40 % of the travel in one frame
      settle_ms: moving.length ? Math.round(moving.at(-1).t) : 0,
      overshoot_px: Math.max(0, Math.round((start - Math.min(...xs.slice(i).map((p) => p.x))) * 10) / 10),
      engine: engines([...full, ...rows], ['drawer']), open_ms: fm.ms,
      // Trajectories (ms, px from start) for chart.mjs: uninterrupted open and the interrupted run.
      curve_open: full.map((r) => [Math.round(r.t), Math.round(r.drawer.x - fx[0])]),
      curve_interrupt: xs.map((p) => [Math.round(p.t), Math.round(p.x - start)]), open_overshoot_px: Math.round((Math.max(...fx) - fx.at(-1)) * 10) / 10 };
  } else probe.interrupt = { supported: false, note: notes.interrupt };

  // 4. Scroll-linked: scroll the container to 50 % and read the bar's scale and the reveal's opacity.
  if (!na.includes('scroll')) {
    const r = await page.evaluate(async () => {
      const sc = document.querySelector('#scroll .scroller');
      const reveal = document.querySelector('[data-probe="reveal"]');
      const before = +getComputedStyle(reveal).opacity;
      sc.scrollTop = (sc.scrollHeight - sc.clientHeight) / 2;
      await new Promise((r) => setTimeout(r, 900));
      const bar = document.querySelector('[data-probe="bar"]');
      const timelines = document.getAnimations().map((a) => a.timeline?.constructor?.name).filter((n) => /Scroll|View/.test(n ?? ''));
      return { bar: bar.getBoundingClientRect().width / bar.parentElement.getBoundingClientRect().width, before, after: +getComputedStyle(reveal).opacity, timelines };
    });
    probe.scroll = { supported: true, note: notes.scroll, bar_at_half: Math.round(r.bar * 100) / 100, linked: Math.abs(r.bar - 0.5) < 0.1,
      reveal: r.before < 0.2 && r.after > 0.9, engine: r.timelines.length ? 'scroll-timeline (compositor)' : 'js-scroll-listener' };
  } else probe.scroll = { supported: false, note: notes.scroll };

  mkdirSync(join(SOURCES, SLUGS[lib] ?? lib), { recursive: true });
  // Screenshot with every task mid-state: card open, four items, drawer open, scrolled halfway.
  await page.evaluate(() => { window.__bench.set('presence', [0, 1, 2, 3]); });
  await page.waitForTimeout(500);
  await page.evaluate(() => { window.__bench.set('layout', 0); window.__bench.set('interrupt', true); });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(SOURCES, SLUGS[lib] ?? lib, 'bench.jpg'), type: 'jpeg', quality: 82 });

  // Main-thread cost: 60 boxes animating together at 4x CPU throttling. Five runs (alternating direction),
  // median reported: single runs vary with machine load.
  let perf = null;
  if (await page.evaluate(() => !!document.querySelector('#stress .box'))) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Performance.enable');
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const metric = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
    const runs = [];
    for (let k = 0; k < 5; k++) {
      const m0 = await metric();
      const frames = await page.evaluate((to) => new Promise((resolve) => {
        const ts = []; const t0 = performance.now(); let peak = 0;
        window.__bench.set('stress', to);
        const tick = (t) => { ts.push(t); peak = Math.max(peak, document.getAnimations().filter((a) => a.effect?.target?.classList?.contains('box')).length);
          if (t - t0 < 1100) requestAnimationFrame(tick); else resolve({ ts, peak }); };
        requestAnimationFrame(tick);
      }), k % 2 === 0);
      const m1 = await metric();
      const gaps = frames.ts.slice(1).map((t, i) => t - frames.ts[i]).sort((x, y) => x - y);
      runs.push({ script: (m1.ScriptDuration - m0.ScriptDuration) * 1000, task: (m1.TaskDuration - m0.TaskDuration) * 1000,
        long: gaps.filter((g) => g > 50).length, p95: gaps[Math.floor(gaps.length * 0.95)] ?? 0, peak: frames.peak });
      await page.waitForTimeout(200);
    }
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const med = (key) => Math.round(runs.map((r) => r[key]).sort((x, y) => x - y)[2]);
    perf = { runs: 5, script_ms: med('script'), task_ms: med('task'), long_frames: med('long'), p95_frame_ms: med('p95'),
      engine: med('peak') ? `${med('peak')} WAAPI/CSS animations` : 'js-per-frame' };
  }
  await page.close();

  // Reduced motion: reload with prefers-reduced-motion: reduce and open the drawer.
  let reduced = null;
  if (probe.interrupt.supported) {
    const rm = await open(lib, { reducedMotion: 'reduce' });
    const rows = await rm.page.evaluate(() => window.__drive('interrupt', [[0, true]], ['drawer'], 900));
    const m = motionOf(rows, 'drawer', 'x');
    reduced = { honoured: m.frames < 2, open_ms: m.ms, method: notes.reduced };
    await rm.page.close();
  } else if (probe.presence.supported) {
    const rm = await open(lib, { reducedMotion: 'reduce' });
    const rows = await rm.page.evaluate(() => window.__drive('presence', [[0, [0, 2]]], ['item-1', 'item-2'], 900));
    reduced = { honoured: motionOf(rows, 'item-2', 'y').frames < 2 && rows.filter((r) => r['item-1']).length < 3, method: notes.reduced };
    await rm.page.close();
  }

  const slug = SLUGS[lib] ?? lib;
  const passed = { layout: probe.layout.animated_open && probe.layout.animated_close, presence: probe.presence.enter_animated && probe.presence.exit_animated && probe.presence.siblings_glide,
    interrupt: probe.interrupt.supported && !probe.interrupt.position_jump, scroll: probe.scroll.linked && probe.scroll.reveal };
  for (const [k, ok] of Object.entries(passed)) probe[k].passed = !!ok;
  const supported = Object.values(passed).filter(Boolean).length;
  results[slug] = { kind: 'motion', bundle_gz_kb: gz, react_baseline_kb: shellBase, lib_only_gz_kb: Math.max(0, Math.round((gz - shellBase) * 10) / 10),
    tasks_total: 4, tasks_supported: supported, probe, perf, reduced, errors };
  console.log(slug.padEnd(14), `${results[slug].lib_only_gz_kb} KB`, `${supported}/4`, JSON.stringify({ layout: probe.layout.engine, interrupt: probe.interrupt.position_jump, scroll: probe.scroll.engine, perf: perf?.script_ms, reduced: reduced?.honoured }), errors.length ? errors : '');
}
await browser.close(); server.close();
writeFileSync(join(HERE, 'results.json'), JSON.stringify(results, null, 2) + '\n');
