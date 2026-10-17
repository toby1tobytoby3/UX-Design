#!/usr/bin/env node
// Benchmark runner: bundle each library's four charts, measure gzipped size, render, probe accessibility.
//   node run.mjs [lib ...]     (default: all files in libs/)
// Writes ../sources/<slug>/bench.jpg and results.json (evidence for the source profiles).
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, basename, extname } from 'node:path';

const HERE = new URL('.', import.meta.url).pathname;
const SOURCES = join(HERE, '../sources');
const want = process.argv.slice(2);
const libs = readdirSync(join(HERE, 'libs')).filter((f) => /\.jsx?$/.test(f))
  .map((f) => basename(f, extname(f))).filter((l) => !want.length || want.includes(l));

async function bundle(name, entry, nodePaths = []) {
  // Pin React to the copy beside the extra node path (Tremor needs React 18; everything else uses 19).
  const alias = nodePaths.length ? { react: join(nodePaths[0], 'react'), 'react-dom': join(nodePaths[0], 'react-dom') } : {};
  const out = join(HERE, 'dist', `${name}.js`);
  await build({ entryPoints: [entry], bundle: true, minify: true, format: 'iife', outfile: out, nodePaths, alias,
    define: { 'process.env.NODE_ENV': '"production"' }, jsx: 'automatic', logLevel: 'error', loader: { '.css': 'text' } });
  return Math.round(gzipSync(readFileSync(out)).length / 102.4) / 10; // KB gz
}

// React's own cost, subtracted so React libraries are compared on their own weight.
const reactBase = await bundle('_react', join(HERE, 'libs/_react-baseline.jsx'));
// Tremor resolves React 18 from its own folder.
const react18Base = await bundle('_react18', join(HERE, 'libs/_react-baseline.jsx'), [join(HERE, 'tremor/node_modules')]);
const results = existsSync(join(HERE, 'results.json')) ? JSON.parse(readFileSync(join(HERE, 'results.json'), 'utf8')) : {};
const browser = await chromium.launch();

for (const lib of libs) {
  if (lib.startsWith('_')) continue;
  const isTremor = lib === 'tremor';
  const file = readdirSync(join(HERE, 'libs')).find((f) => basename(f, extname(f)) === lib);
  const src = readFileSync(join(HERE, 'libs', file), 'utf8');
  const usesReact = /from 'react'/.test(src);
  const gz = await bundle(lib, join(HERE, 'libs', file), isTremor ? [join(HERE, 'tremor/node_modules')] : []);

  const page = await browser.newPage({ viewport: { width: 1280, height: 860 }, locale: 'en-GB' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const html = readFileSync(join(HERE, 'page.html'), 'utf8').replace('dist/LIB.js', `${lib}.js`)
    .replace('</head>', isTremor ? `<style>${readFileSync(join(HERE, 'dist/tremor.css'), 'utf8')}</style></head>` : '</head>');
  writeFileSync(join(HERE, 'dist', `${lib}.html`), html);
  await page.goto(`file://${join(HERE, 'dist', `${lib}.html`)}`);
  await page.waitForTimeout(1500);

  const probe = await page.evaluate(() => Object.fromEntries(['ts', 'bar', 'stack', 'donut'].map((id) => {
    const el = document.querySelector(`#${id} .plot`);
    return [id, {
      supported: !el.dataset.na, note: el.dataset.na || '',
      renderer: el.querySelector('canvas') ? 'canvas' : el.querySelector('svg') ? 'svg' : 'none',
      focusable: el.querySelectorAll('[tabindex]:not([tabindex="-1"]), button, a[href]').length,
      aria: el.querySelectorAll('[role], [aria-label], [aria-labelledby], [aria-describedby], title, desc').length
        + (el.hasAttribute('aria-label') ? 1 : 0),
      described: [el, ...el.querySelectorAll('[aria-label]')].map((n) => n.getAttribute('aria-label')).filter(Boolean).join(' ').slice(0, 160),
    }];
  })));
  const slug = lib === 'lightweight' ? 'lightweight-charts' : lib === 'plot' ? 'observable-plot' : lib === 'ag' ? 'ag-charts' : lib;
  mkdirSync(join(SOURCES, slug), { recursive: true });
  await page.screenshot({ path: join(SOURCES, slug, 'bench.jpg'), type: 'jpeg', quality: 82 });
  await page.close();

  results[slug] = {
    bundle_gz_kb: gz, react_baseline_kb: usesReact ? (isTremor ? react18Base : reactBase) : 0,
    lib_only_gz_kb: usesReact ? Math.round((gz - (isTremor ? react18Base : reactBase)) * 10) / 10 : gz,
    charts_supported: Object.values(probe).filter((p) => p.supported).length, probe, errors,
  };
  console.log(slug.padEnd(20), `${gz} KB gz`, usesReact ? `(React ${reactBase})` : '', `${results[slug].charts_supported}/4`, errors.length ? errors : '');
}
await browser.close();
writeFileSync(join(HERE, 'results.json'), JSON.stringify(results, null, 2) + '\n');
