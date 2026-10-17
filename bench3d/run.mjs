#!/usr/bin/env node
// 3D benchmark runner: bundle each library's four tasks, measure gzipped size, serve over localhost,
// render in headless Chromium (software GPU), record time-to-ready per task and accessibility probes.
//   node run.mjs [lib ...]     (default: all files in libs/)
// Writes ../sources/<slug>/bench.jpg and results.json (evidence for the 3D source profiles).
// Timings come from a software GPU (SwiftShader): compare them relative to each other, never as real-device numbers.
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, basename, extname } from 'node:path';

const HERE = new URL('.', import.meta.url).pathname;
const SOURCES = join(HERE, '../sources');
const SLUGS = { three: 'threejs', r3f: 'react-three-fiber', babylon: 'babylonjs', modelviewer: 'model-viewer', ogl: 'ogl' };
const TASKS = ['product', 'instances', 'hotspot', 'fallback'];
const want = process.argv.slice(2);
const libs = readdirSync(join(HERE, 'libs')).filter((f) => /\.jsx?$/.test(f) && !f.startsWith('_'))
  .map((f) => basename(f, extname(f))).filter((l) => !want.length || want.includes(l));

async function bundle(name, entry, nodePaths = []) {
  const out = join(HERE, 'dist', `${name}.js`);
  const alias = nodePaths.length ? { three: join(nodePaths[0], 'three') } : {};
  await build({ entryPoints: [entry], bundle: true, minify: true, format: 'iife', outfile: out, nodePaths, alias,
    define: { 'process.env.NODE_ENV': '"production"' }, jsx: 'automatic', logLevel: 'error' });
  return Math.round(gzipSync(readFileSync(out)).length / 102.4) / 10;
}
const reactBase = await bundle('_react', join(HERE, '../bench/libs/_react-baseline.jsx'), []);

const TYPES = { '.js': 'text/javascript', '.html': 'text/html', '.glb': 'model/gltf-binary' };
const server = createServer((req, res) => {
  const url = req.url.split('?')[0];
  const file = url.startsWith('/assets/') ? join(HERE, url) : join(HERE, 'dist', url);
  if (!existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;

const results = existsSync(join(HERE, 'results.json')) ? JSON.parse(readFileSync(join(HERE, 'results.json'), 'utf8')) : {};
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

for (const lib of libs) {
  const file = readdirSync(join(HERE, 'libs')).find((f) => basename(f, extname(f)) === lib);
  const src = readFileSync(join(HERE, 'libs', file), 'utf8');
  const usesReact = /from 'react'/.test(src);
  const isolated = lib === 'modelviewer' ? [join(HERE, 'model-viewer/node_modules')] : [];
  const gz = await bundle(lib, join(HERE, 'libs', file), isolated);
  writeFileSync(join(HERE, 'dist', `${lib}.html`), readFileSync(join(HERE, 'page.html'), 'utf8').replace('LIB.js', `${lib}.js`));

  const page = await browser.newPage({ viewport: { width: 1280, height: 860 }, locale: 'en-GB' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  await page.goto(`${base}/${lib}.html`);
  await page.waitForFunction((n) => Object.keys(window.__bench?.ready ?? {}).length >= n, TASKS.length, { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const probe = await page.evaluate((tasks) => Object.fromEntries(tasks.map((id) => {
    const el = document.querySelector(`#${id} .view`);
    return [id, {
      supported: !el.dataset.na, note: window.__bench.notes[id] ?? 'did not finish',
      ready_ms: window.__bench.ready[id] ?? null,
      focusable: el.querySelectorAll('[tabindex]:not([tabindex="-1"]), button, a[href], model-viewer').length,
      described: [el, ...el.querySelectorAll('[aria-label], [alt], canvas')].map((n) => n.getAttribute?.('aria-label') || n.getAttribute?.('alt')).filter(Boolean).join(' | ').slice(0, 160),
    }];
  })), TASKS);
  const slug = SLUGS[lib] ?? lib;
  mkdirSync(join(SOURCES, slug), { recursive: true });
  await page.screenshot({ path: join(SOURCES, slug, 'bench.jpg'), type: 'jpeg', quality: 82 });
  await page.close();

  results[slug] = {
    kind: '3d', bundle_gz_kb: gz, react_baseline_kb: usesReact ? reactBase : 0,
    lib_only_gz_kb: usesReact ? Math.round((gz - reactBase) * 10) / 10 : gz,
    tasks_total: TASKS.length, tasks_supported: Object.values(probe).filter((p) => p.supported && p.ready_ms !== null).length,
    native: Object.values(probe).filter((p) => /^native/.test(p.note)).length,
    product_ready_ms: probe.product.ready_ms, probe, errors,
  };
  console.log(slug.padEnd(20), `${gz} KB gz`, usesReact ? `(React ${reactBase})` : '', `${results[slug].tasks_supported}/4 tasks, ${results[slug].native} native`, `product ${probe.product.ready_ms} ms`, errors.length ? errors : '');
}
await browser.close(); server.close();
writeFileSync(join(HERE, 'results.json'), JSON.stringify(results, null, 2) + '\n');
