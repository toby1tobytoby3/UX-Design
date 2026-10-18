#!/usr/bin/env node
// Map benchmark runner: bundle each stack, measure gzipped size, serve the page, basemap and MapLibre worker over
// localhost, and run the same tasks in headless Chromium (software GPU):
//   first render · 30 s of 1 Hz updates to 5,000 vehicles at 4× CPU throttle (frame times, long tasks) · click-pick at z13 and z16 ·
//   cluster click expands · flyTo with reduced motion · keyboard pan/zoom, accessible name, axe · attribution visible.
//   node run.mjs [stack ...]     (default: every file in libs/ not starting with _)
// Writes ../sources/<slug>/bench.jpg and results.json. Zooms are MapLibre zooms (OpenLayers and Leaflet use +1 internally).
// Timings come from a software GPU (SwiftShader): compare them relative to each other, never as real-device numbers.
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, basename, extname } from 'node:path';

const HERE = new URL('.', import.meta.url).pathname;
const SOURCES = join(HERE, '../sources');
const SLUGS = { maplibre: 'maplibre', 'maplibre-deckgl': 'deck-gl', openlayers: 'openlayers', leaflet: 'leaflet' };
const LIVE_SECONDS = 30;
// Found while building the stacks (not measurable by the probes below).
const NOTES = {
  maplibre: ['v6 has no default export: `import maplibregl from \'maplibre-gl\'` fails; use named imports or `import * as`',
    'v6 is ES modules only and loads its worker as a module from next to the bundle; an IIFE bundle needs setWorkerUrl()',
    'Cluster count labels need a glyphs URL (self-hosted fonts) for text; the bench draws size-stepped circles only'],
  'deck-gl': ['MapboxOverlay `interleaved: true` crashes on MapLibre 6.15 with deck.gl 9.4.0 (reads map.transform, removed in v6); overlaid mode works',
    'No clustering built in: supercluster (or MapLibre clusters under the deck layer)'],
  openlayers: ['No official React wrapper; used directly in a ref', 'Cluster source is built in; expanding a cluster on click is a few lines (view.fit)',
    'The map viewport is not focusable by default; keyboard pan/zoom needs tabindex="0" on the target element',
    'Moving 5,000 features one by one with setCoordinates() while a Cluster source is attached froze the page for 127 s per update (re-clusters on every change event); replacing features in one batch (clear + addFeatures) fixed it'],
  leaflet: ['No clustering built in (Leaflet.markercluster plugin uses DOM markers); supercluster used', 'Last stable release 1.9.4, May 2023; 2.0 still alpha',
    'react-leaflet is Hippocratic-2.1 licensed (not OSI open source)'],
};
const want = process.argv.slice(2);
const libs = readdirSync(join(HERE, 'libs')).filter((f) => /\.jsx?$/.test(f) && !f.startsWith('_'))
  .map((f) => basename(f, extname(f))).filter((l) => !want.length || want.includes(l));
const gz = (file) => Math.round(gzipSync(readFileSync(file)).length / 102.4) / 10;

async function bundle(name, entry) {
  await build({ entryPoints: [entry], bundle: true, minify: true, format: 'esm', outfile: join(HERE, 'dist', `${name}.js`),
    nodePaths: [join(HERE, 'node_modules')], define: { 'process.env.NODE_ENV': '"production"' }, jsx: 'automatic', logLevel: 'error', loader: { '.png': 'file', '.svg': 'file' } });
  const css = join(HERE, 'dist', `${name}.css`);
  return { js: gz(join(HERE, 'dist', `${name}.js`)), css: existsSync(css) ? gz(css) : 0 };
}
mkdirSync(join(HERE, 'dist'), { recursive: true });
const reactBase = (await bundle('_react', join(HERE, '../bench/libs/_react-baseline.jsx'))).js;
const sharedBase = (await bundle('_shared', join(HERE, 'shared.js'))).js;
const WORKER = join(HERE, 'node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs');
copyFileSync(WORKER, join(HERE, 'dist/maplibre-gl-worker.mjs'));

const TYPES = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = createServer((req, res) => {
  const url = req.url.split('?')[0];
  const file = url.startsWith('/assets/') ? join(HERE, url) : url === '/axe.js' ? join(HERE, 'node_modules/axe-core/axe.min.js') : join(HERE, 'dist', url);
  if (!existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;

const results = existsSync(join(HERE, 'results.json')) ? JSON.parse(readFileSync(join(HERE, 'results.json'), 'utf8')) : {};
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const wait = (page, ms) => page.waitForTimeout(ms);
const MAP = '#map';

// Click the vehicle with the most room around it near the middle of the view, and check the stack reports that id.
async function clickPick(page, zoom) {
  await page.evaluate((z) => void window.__bench.jumpTo([-0.1, 51.5], z), zoom);
  await wait(page, 1500);
  const target = await page.evaluate(async () => {
    const { vehicles } = window.__bench;
    const box = document.querySelector('#map').getBoundingClientRect();
    const pts = vehicles.map((v) => ({ id: v.id, p: window.__bench.project([v.lng, v.lat]) }))
      .filter(({ p: [x, y] }) => x > 120 && y > 120 && x < box.width - 120 && y < box.height - 120);
    let best = null, bestD = -1;
    for (const a of pts.slice(0, 400)) {
      let d = Infinity;
      for (const b of pts) if (b !== a) d = Math.min(d, Math.hypot(a.p[0] - b.p[0], a.p[1] - b.p[1]));
      if (d > bestD) { bestD = d; best = a; }
    }
    return best && { id: best.id, x: best.p[0] + box.left, y: best.p[1] + box.top, clearance_px: Math.round(bestD) };
  });
  if (!target) return { zoom, correct: false, note: 'no vehicle in view' };
  await page.evaluate(() => { window.__bench.picked = null; });
  await page.mouse.click(target.x, target.y);
  await wait(page, 700);
  const picked = await page.evaluate(() => window.__bench.picked);
  return { zoom, target: target.id, picked, correct: picked === target.id, clearance_px: target.clearance_px };
}

// Measure camera frames until the view reaches the target (or 6 s pass).
async function flyMeasure(page, reduced) {
  await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
  await page.evaluate(() => void window.__bench.jumpTo([-0.1, 51.5], 12));
  await wait(page, 800);
  return page.evaluate(() => new Promise((resolve) => {
    const to = [0.05, 51.6], z = 14, t0 = performance.now();
    let frames = 0, moving = 0, last = JSON.stringify(window.__bench.view());
    window.__bench.flyTo(to, z);
    const loop = () => {
      const v = window.__bench.view(), now = performance.now(), key = JSON.stringify(v);
      frames++; if (key !== last) moving++; last = key;
      const arrived = Math.abs(v.lng - to[0]) < 1e-4 && Math.abs(v.lat - to[1]) < 1e-4 && Math.abs(v.zoom - z) < 0.01;
      if (arrived || now - t0 > 6000) resolve({ arrived, ms: Math.round(now - t0), frames, camera_frames: moving, jumped: arrived && moving <= 2 });
      else requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }));
}

for (const lib of libs) {
  const file = readdirSync(join(HERE, 'libs')).find((f) => basename(f, extname(f)) === lib);
  const src = readFileSync(join(HERE, 'libs', file), 'utf8');
  const usesReact = /from 'react'/.test(src);
  const usesWorker = /maplibre/.test(src);
  const size = await bundle(lib, join(HERE, 'libs', file));
  const workerKb = usesWorker ? gz(WORKER) : 0;
  writeFileSync(join(HERE, 'dist', `${lib}.html`), readFileSync(join(HERE, 'page.html'), 'utf8').replaceAll('LIB.', `${lib}.`));

  const page = await browser.newPage({ viewport: { width: 1280, height: 860 }, locale: 'en-GB' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  await page.addInitScript(() => {
    window.__longtasks = [];
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__longtasks.push(e.duration))).observe({ type: 'longtask', buffered: true });
  });
  await page.goto(`${base}/${lib}.html`);
  const loaded = await page.waitForFunction(() => window.__bench?.ready_ms != null && window.__bench.view, null, { timeout: 90000 }).then(() => true, () => false);
  if (!loaded) { results[SLUGS[lib] ?? lib] = { kind: 'map', stack: lib, failed: true, errors }; console.log(lib, 'did not render', errors.slice(0, 2)); await page.close(); continue; }
  const first_render_ms = await page.evaluate(() => window.__bench.ready_ms);
  await wait(page, 1000);

  // Attribution: the basemap source's credit, visible without a click.
  const attribution = await page.evaluate(() => {
    const walk = document.createTreeWalker(document.querySelector('#map'), NodeFilter.SHOW_TEXT);
    let el = null;
    while (!el && walk.nextNode()) if (/Synthetic basemap/.test(walk.currentNode.textContent)) el = walk.currentNode.parentElement;
    if (!el) return { visible: false, note: 'not rendered' };
    const r = el.getBoundingClientRect();
    const visible = el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && r.width > 0 && r.height > 0;
    return { visible, note: visible ? 'shown by default' : 'collapsed behind a button' };
  });

  // Keyboard: Tab from the page start, then arrows and +.
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  let focus = null;
  for (let i = 0; i < 6 && !focus; i++) {
    await page.keyboard.press('Tab');
    focus = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a || !document.querySelector('#map').contains(a)) return null;
      const name = a.getAttribute('aria-label') || (a.getAttribute('aria-labelledby') && document.getElementById(a.getAttribute('aria-labelledby'))?.textContent) || a.getAttribute('title') || '';
      const control = a.closest('button, a, input, [role=button]') !== null;
      return { tag: a.tagName.toLowerCase(), role: a.getAttribute('role'), name, control, tabs: 0 };
    });
    if (focus) focus.tabs = i + 1;
  }
  // If Tab first lands on a zoom button, keep tabbing to find the map surface itself.
  let surface = focus && !focus.control ? focus : null;
  for (let i = 0; i < 8 && focus && !surface; i++) {
    await page.keyboard.press('Tab');
    surface = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a || !document.querySelector('#map').contains(a) || a.closest('button, a, input, [role=button]')) return null;
      return { tag: a.tagName.toLowerCase(), role: a.getAttribute('role'), name: a.getAttribute('aria-label') || a.getAttribute('title') || '' };
    });
  }
  const before = await page.evaluate(() => window.__bench.view());
  for (let i = 0; i < 3; i++) { await page.keyboard.press('ArrowRight'); await wait(page, 150); }
  await wait(page, 800);
  const panned = await page.evaluate(() => window.__bench.view());
  await page.keyboard.press('+');
  await wait(page, 1000);
  const zoomed = await page.evaluate(() => window.__bench.view());
  const keyboard = {
    first_focus: focus, map_surface_focusable: !!surface, surface,
    pan: !!surface && panned.lng > before.lng + 1e-5, zoom: !!surface && zoomed.zoom > panned.zoom + 0.5,
  };

  await page.addScriptTag({ url: '/axe.js' });
  const axe = await page.evaluate(async () => {
    const r = await window.axe.run({ include: [['#map']] }, { rules: { region: { enabled: false } } });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
  });

  // Clusters: at z10 click the biggest cluster near the middle; it should zoom in.
  await page.evaluate(() => void window.__bench.jumpTo([-0.1, 51.5], 10));
  await wait(page, 2000);
  const cl = await page.evaluate(() => {
    const box = document.querySelector('#map').getBoundingClientRect();
    const cs = window.__bench.clusters().filter((c) => c.x > 100 && c.y > 100 && c.x < box.width - 100 && c.y < box.height - 100);
    cs.sort((a, b) => b.count - a.count);
    return { n: cs.length, top: cs[0] && { x: cs[0].x + box.left, y: cs[0].y + box.top, count: cs[0].count }, z: window.__bench.view().zoom };
  });
  let cluster = { clusters_in_view: cl.n, expanded: false };
  if (cl.top) {
    await page.mouse.click(cl.top.x, cl.top.y);
    await wait(page, 2000);
    const z2 = await page.evaluate(() => window.__bench.view().zoom);
    cluster = { ...cluster, clicked_count: cl.top.count, zoom_before: +cl.z.toFixed(2), zoom_after: +z2.toFixed(2), expanded: z2 > cl.z + 0.5 };
  }

  const pick = [await clickPick(page, 13), await clickPick(page, 16)];
  const fly_default = await flyMeasure(page, false);
  const fly_reduced = await flyMeasure(page, true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  // Live: 30 s of 1 Hz updates at z12 (individual vehicles) with the CPU throttled 4×, frame deltas from requestAnimationFrame.
  await page.evaluate(() => void window.__bench.jumpTo([-0.1, 51.5], 12));
  await wait(page, 1500);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const liveStats = await page.evaluate((secs) => new Promise((resolve) => {
    const lt0 = window.__longtasks.length, deltas = [];
    let last = performance.now(); const t0 = last;
    window.__bench.startLive();
    const loop = (t) => {
      deltas.push(t - last); last = t;
      if (t - t0 < secs * 1000) requestAnimationFrame(loop);
      else {
        window.__bench.stopLive();
        const sorted = [...deltas].sort((a, b) => a - b), q = (p) => +sorted[Math.floor(p * (sorted.length - 1))].toFixed(1);
        const long = window.__longtasks.slice(lt0);
        resolve({ frames: deltas.length, frame_p50_ms: q(0.5), frame_p95_ms: q(0.95), frame_max_ms: +sorted.at(-1).toFixed(0),
          dropped_frames: deltas.reduce((n, d) => n + Math.max(0, Math.round(d / 16.67) - 1), 0),
          long_tasks: long.length, long_task_ms: Math.round(long.reduce((a, b) => a + b, 0)) });
      }
    };
    requestAnimationFrame(loop);
  }), LIVE_SECONDS);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });

  await page.evaluate(() => void window.__bench.jumpTo([-0.115, 51.505], 12.6));
  await wait(page, 1500);
  const slug = SLUGS[lib] ?? lib;
  mkdirSync(join(SOURCES, slug), { recursive: true });
  await page.screenshot({ path: join(SOURCES, slug, 'bench.jpg'), type: 'jpeg', quality: 82 });
  await page.close();

  const libOnly = Math.round((size.js - (usesReact ? reactBase : 0) - sharedBase) * 10) / 10;
  results[slug] = {
    kind: 'map', stack: lib, bundle_gz_kb: size.js, css_gz_kb: size.css, worker_gz_kb: workerKb, react_baseline_kb: usesReact ? reactBase : 0,
    lib_only_gz_kb: Math.round((libOnly + workerKb) * 10) / 10, main_thread_gz_kb: libOnly,
    first_render_ms, live: liveStats, pick, pick_correct: pick.filter((p) => p.correct).length, cluster,
    fly_default, fly_reduced, reduced_motion_jumps: fly_reduced.jumped, keyboard, attribution, axe, notes: NOTES[slug] ?? [], errors,
  };
  const r = results[slug];
  writeFileSync(join(HERE, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  console.log(slug.padEnd(10), `${r.lib_only_gz_kb} KB`, `first ${first_render_ms} ms`, `live p50/p95 ${liveStats.frame_p50_ms}/${liveStats.frame_p95_ms} drop ${liveStats.dropped_frames} lt ${liveStats.long_task_ms}ms`,
    `pick ${r.pick_correct}/2`, `cluster ${cluster.expanded}`, `fly ${fly_default.ms}ms→reduced ${fly_reduced.ms}ms jumped=${fly_reduced.jumped}`,
    `kbd focus=${keyboard.map_surface_focusable} pan=${keyboard.pan} zoom=${keyboard.zoom}`, `attr ${attribution.visible}`, `axe ${axe.length}`, errors.length ? errors : '');
}
results._note = 'SwiftShader software GPU: timings are relative only. Zooms are MapLibre zooms. lib_only_gz_kb includes the MapLibre worker where used; React and the shared harness are subtracted.';
writeFileSync(join(HERE, 'results.json'), JSON.stringify(results, null, 2) + '\n');
await browser.close();
server.close();
