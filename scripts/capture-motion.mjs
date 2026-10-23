#!/usr/bin/env node
// Capture a 3D / WebGL / motion-heavy page with evidence, for entries where a single screenshot isn't enough.
//
//   node scripts/capture-motion.mjs <url> <outDir> [--wait 15] [--scroll 3] [--selector "<css>"]
//
// Writes desktop.jpg, mobile.jpg, crop-scroll-N.jpg (with --scroll) and evidence.json:
// transfer size, JS size, WebGL contexts, three.js version, canvas accessibility, and whether
// animation stops under prefers-reduced-motion. Uses a software GPU, so treat timings as relative.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args.splice(i, 2)[1] : d; };
const wait = Number(flag('--wait', 12)) * 1000;
const scrollFrames = Number(flag('--scroll', 0));
const selector = flag('--selector');
const [url, outDir] = args;
if (!url || !outDir) { console.error('usage: capture-motion.mjs <url> <outDir> [--wait s] [--scroll n] [--selector css]'); process.exit(1); }
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const glHook = () => {
  const orig = HTMLCanvasElement.prototype.getContext; window.__gl = [];
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) { if (/webgl|webgpu/.test(type)) window.__gl.push(type); return orig.call(this, type, ...rest); };
};

async function open(viewport, reducedMotion = 'no-preference') {
  const ctx = await browser.newContext({ viewport, locale: 'en-GB', reducedMotion, isMobile: viewport.width < 500, deviceScaleFactor: viewport.width < 500 ? 2 : 1 });
  await ctx.addInitScript(glHook);
  const page = await ctx.newPage();
  const net = { bytes: 0, js: 0, requests: 0 };
  page.on('requestfinished', async (req) => {
    try { const s = await req.sizes(); net.requests++; net.bytes += s.responseBodySize + s.responseHeadersSize;
      if (req.resourceType() === 'script') net.js += s.responseBodySize; } catch {}
  });
  const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (res && !res.ok()) throw new Error(`Could not load ${url}: HTTP ${res.status()}`);
  await page.waitForTimeout(wait);
  return { ctx, page, net };
}
const shot = (page, file) => (selector ? page.locator(selector).first().screenshot({ path: file, type: 'jpeg', quality: 80 })
  : page.screenshot({ path: file, type: 'jpeg', quality: 80 }));

// Desktop: screenshot, evidence, optional scroll frames.
const d = await open({ width: 1440, height: 900 });
await shot(d.page, `${outDir}/desktop.jpg`);
const page = await d.page.evaluate(() => ({
  title: document.title,
  webgl: [...new Set(window.__gl)],
  three_version: window.__THREE__ ?? null,
  canvases: [...document.querySelectorAll('canvas')].map((c) => ({ w: c.width, h: c.height, label: c.getAttribute('aria-label') || c.getAttribute('aria-hidden') && 'aria-hidden' || null, focusable: c.tabIndex >= 0 })),
  videos: document.querySelectorAll('video').length,
  model_viewer: document.querySelectorAll('model-viewer').length,
  h1: document.querySelector('h1')?.textContent.trim().slice(0, 120) ?? null,
}));
for (let i = 1; i <= scrollFrames; i++) {
  await d.page.mouse.wheel(0, 900); await d.page.waitForTimeout(2500);
  await d.page.screenshot({ path: `${outDir}/crop-scroll-${i}.jpg`, type: 'jpeg', quality: 78 });
}
await d.ctx.close();

// Mobile.
const m = await open({ width: 390, height: 844 });
await shot(m.page, `${outDir}/mobile.jpg`);
await m.ctx.close();

// Reduced motion: does the page still animate? Compare two frames 1.5 s apart.
const r = await open({ width: 1440, height: 900 }, 'reduce');
const a = await r.page.screenshot(); await r.page.waitForTimeout(1500); const b = await r.page.screenshot();
let diff = 0; for (let i = 0; i < Math.min(a.length, b.length); i += 97) if (a[i] !== b[i]) diff++;
await r.ctx.close();
await browser.close();

const evidence = {
  url, captured_at: new Date().toISOString().slice(0, 10), gpu: 'software (SwiftShader); timings relative only',
  transfer_kb: Math.round(d.net.bytes / 1024), js_kb: Math.round(d.net.js / 1024), requests: d.net.requests,
  ...page,
  still_animating_with_reduced_motion: diff > 20,
};
writeFileSync(`${outDir}/evidence.json`, JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify({ transfer_kb: evidence.transfer_kb, js_kb: evidence.js_kb, webgl: evidence.webgl, three: evidence.three_version, canvases: evidence.canvases.length, reduced_motion_animating: evidence.still_animating_with_reduced_motion }));
