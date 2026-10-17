#!/usr/bin/env node
// AI chat UI benchmark runner: bundle each kit, serve over localhost, drive the same scripted turn (mock.js) in
// headless Chromium with 4× CPU throttling, and record streaming stability, controls, tool steps, approvals,
// citations and accessibility.
//   node run.mjs [lib ...]          (default: all files in libs/ not starting with _)
//   node run.mjs --inspect <lib>    (dump the kit's DOM after the turn, for finding selectors)
// Writes ../sources/<slug>/bench.jpg and results.json (evidence for the ai-chat source profiles).
// Bundles are ESM with code splitting: `initial` is what loads up front, `lazy` is split-off chunks
// (Mermaid, KaTeX, Shiki languages…) that load only when used.
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, basename, extname, relative } from 'node:path';
import { TEXT, PROMPT } from './mock.js';

const HERE = new URL('.', import.meta.url).pathname;
const NM = join(HERE, 'node_modules');
const SOURCES = join(HERE, '../sources');
const argv = process.argv.slice(2);
const inspect = argv[0] === '--inspect' && argv.splice(0, 1);
const libs = readdirSync(join(HERE, 'libs')).filter((f) => /\.jsx?$/.test(f) && !f.startsWith('_'))
  .map((f) => basename(f, extname(f))).filter((l) => !argv.length || argv.includes(l));
const kb = (bytes) => Math.round(bytes / 102.4) / 10;

async function bundle(name, entry) {
  const outdir = join(HERE, 'dist', name);
  rmSync(outdir, { recursive: true, force: true });
  const { metafile } = await build({ entryPoints: { [name]: entry }, bundle: true, minify: true, format: 'esm', splitting: true,
    outdir, metafile: true, jsx: 'automatic', logLevel: 'error', define: { 'process.env.NODE_ENV': '"production"' },
    alias: { react: join(NM, 'react'), 'react-dom': join(NM, 'react-dom') },
    loader: { '.woff': 'file', '.woff2': 'file', '.ttf': 'file', '.svg': 'file', '.png': 'file' } });
  const outs = metafile.outputs;
  const gz = (f) => gzipSync(readFileSync(join(HERE, f))).length;
  const entryOut = Object.keys(outs).find((f) => basename(f) === `${name}.js`);
  const initial = new Set();
  (function walk(f) { if (initial.has(f)) return; initial.add(f); outs[f].imports.filter((i) => i.kind === 'import-statement').forEach((i) => walk(i.path)); })(entryOut);
  const js = Object.keys(outs).filter((f) => f.endsWith('.js'));
  const css = Object.keys(outs).filter((f) => f.endsWith('.css'));
  return { initial: kb([...initial].reduce((s, f) => s + gz(f), 0)), lazy: kb(js.filter((f) => !initial.has(f)).reduce((s, f) => s + gz(f), 0)),
    css: kb(css.reduce((s, f) => s + gz(f), 0)), outdir };
}

// Tailwind v4 compile for kits whose docs require it (libs/<lib>.css). Its size counts as CSS, not JS.
function tailwind(name, outdir) {
  const input = join(HERE, 'libs', `${name}.css`);
  const out = join(outdir, `${name}.tw.css`);
  if (!existsSync(input)) { writeFileSync(out, ''); return 0; }
  execFileSync(join(NM, '.bin/tailwindcss'), ['-i', input, '-o', out, '--minify'], { cwd: HERE, stdio: 'pipe' });
  return kb(gzipSync(readFileSync(out)).length);
}

const reactBase = (await bundle('_react', join(HERE, '../bench/libs/_react-baseline.jsx'))).initial;
const server = createServer((req, res) => {
  const file = join(HERE, 'dist', decodeURIComponent(req.url.split('?')[0]));
  if (!existsSync(file) || file.endsWith('/')) { res.writeHead(404).end(); return; }
  const type = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.woff2': 'font/woff2' }[extname(file)] ?? 'application/octet-stream';
  res.writeHead(200, { 'content-type': type }).end(readFileSync(file));
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
const axeSource = readFileSync(join(NM, 'axe-core/axe.min.js'), 'utf8');

// Fresh page, no throttling: send, stop mid-stream (does text stop, is Stop a focusable button?), then retry and
// check whether the stopped answer survives as a branch (a "2/2" picker) instead of being replaced.
async function controlsTest(lib, sel) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, locale: 'en-GB' });
  const out = { stop: false, stop_focusable: null, retry: false, branch: false };
  try {
    await page.goto(`${base}/${lib}/index.html`);
    await page.waitForFunction(() => window.__bench?.ready, null, { timeout: 30000 });
    await page.waitForTimeout(1000);
    const text = () => page.evaluate((s) => document.querySelector(s)?.innerText.length ?? 0, sel.transcript ?? '#app');
    await page.locator(sel.composer ?? 'textarea, [contenteditable=true]').first().click();
    await page.keyboard.type(PROMPT); await page.keyboard.press('Enter');
    if (sel.send) await page.waitForTimeout(800).then(() => page.evaluate(() => window.__bench.marks.run_start)).then((ok) => ok || page.locator(sel.send).first().click());
    await page.waitForFunction(() => window.__bench.marks.stream_start, null, { timeout: 15000 });
    await page.waitForTimeout(700);
    if (sel.stop && await page.locator(sel.stop).count()) {
      out.stop_focusable = await page.locator(sel.stop).first().evaluate((b) => (b.tagName === 'BUTTON' || b.tabIndex >= 0) && !b.disabled);
      const l0 = await text();
      await page.locator(sel.stop).first().click();
      await page.waitForTimeout(1000);
      const l1 = await text(); await page.waitForTimeout(1000); const l2 = await text();
      // Some kits drain a smoothing buffer after Stop; count it, but judge Stop on whether text is still growing a second later.
      out.chars_after_stop = l1 - l0;
      out.stop = l2 - l1 < 20 && !(await page.evaluate(() => window.__bench.marks.stream_end));
    }
    // No working Stop: let the turn finish so a retry control has a chance to appear.
    if (!out.stop) await page.waitForFunction(() => window.__bench.marks.approval_requested || window.__bench.marks.stream_end, null, { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(800);
    if (sel.retry && await page.locator(sel.retry).count()) {
      out.retry = true;
      await page.evaluate(() => { window.__bench.marks = {}; });
      await page.locator(sel.retry).last().click({ force: true });
      out.retry_restarted = await page.waitForFunction(() => window.__bench.marks.stream_start, null, { timeout: 15000 }).then(() => true, () => false);
      await page.waitForTimeout(500);
      out.branch = sel.branch ? await page.evaluate((s) => [...document.querySelectorAll(s)].some((b) => /2\s*\/\s*2/.test(b.textContent) && b.offsetParent), sel.branch) : false;
    }
  } catch (err) { out.error = err.message.split('\n')[0]; }
  await page.close();
  return out;
}

const results = existsSync(join(HERE, 'results.json')) ? JSON.parse(readFileSync(join(HERE, 'results.json'), 'utf8')) : {};
const browser = await chromium.launch();

// Raw markdown that a renderer failed to format, as it would be seen mid-stream.
const RAW = { fence: /```/, bold: /\*\*/, heading: /^#{2,3} /m, table: /\|\s*-{3}/, link: /\]\(https?:/ };

for (const lib of libs) {
  const size = await bundle(lib, join(HERE, 'libs', readdirSync(join(HERE, 'libs')).find((f) => /\.jsx?$/.test(f) && basename(f, extname(f)) === lib)));
  const twCss = tailwind(lib, size.outdir);
  if (!existsSync(join(size.outdir, `${lib}.css`))) writeFileSync(join(size.outdir, `${lib}.css`), '');
  writeFileSync(join(size.outdir, 'index.html'), readFileSync(join(HERE, 'page.html'), 'utf8').replaceAll('LIB', lib));

  const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, locale: 'en-GB' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
  await page.goto(`${base}/${lib}/index.html`);
  await page.waitForFunction(() => window.__bench?.ready, null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  const sel = await page.evaluate(() => window.__bench.sel);
  const composer = page.locator(sel.composer ?? 'textarea, [contenteditable=true]').first();
  const transcriptText = () => page.evaluate((s) => document.querySelector(s)?.innerText ?? '', sel.transcript ?? '#app');

  // 1. Send with Enter, then stream under 4× CPU throttling.
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await composer.click();
  await page.keyboard.type(PROMPT, { delay: 0 });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  const enterSends = (await transcriptText()).includes(PROMPT.slice(0, 30));
  if (!enterSends && sel.send) await page.locator(sel.send).first().click();
  await page.waitForFunction(() => window.__bench.marks.stream_start, null, { timeout: 30000 }).catch(() => {});
  const m0 = await metrics();
  const perf0 = await page.evaluate(() => ({ s: __perf.shifts.length, l: __perf.longtasks.length }));
  const samples = [];
  let scrolledUp = false;
  while (!(await page.evaluate(() => window.__bench.marks.stream_end)) && samples.length < 2000) {
    const s = await page.evaluate((sc) => {
      const el = document.querySelector(sc) ?? document.querySelector('#app');
      return { dist: el ? el.scrollHeight - el.scrollTop - el.clientHeight : null, overflow: el ? el.scrollHeight > el.clientHeight + 4 : false };
    }, sel.scroller);
    s.text = await transcriptText();
    samples.push(s);
    const progress = s.text.length / TEXT.length;
    if (!scrolledUp && progress > 0.55) {
      const box = await page.locator(sel.scroller ?? '#app').first().boundingBox();
      if (box) { await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.wheel(0, -200); }
      scrolledUp = samples.length;
    }
    await page.waitForTimeout(100);
  }
  const m1 = await metrics();
  const perf = await page.evaluate((p) => ({ shifts: __perf.shifts.slice(p.s), longtasks: __perf.longtasks.slice(p.l) }), perf0);
  const before = samples.slice(0, scrolledUp || samples.length).filter((s) => s.overflow);
  const after = scrolledUp ? samples.slice(scrolledUp + 10) : [];
  const rawSeen = Object.fromEntries(Object.entries(RAW).map(([k, re]) => [k, samples.filter((s) => re.test(s.text)).length]));
  const stream = {
    samples: samples.length, enter_sends: enterSends,
    cls: Math.round(perf.shifts.reduce((a, s) => a + s.v, 0) * 1000) / 1000,
    long_tasks: perf.longtasks.length, long_task_ms: Math.round(perf.longtasks.reduce((a, t) => a + t.d, 0)),
    script_ms: Math.round((m1.ScriptDuration - m0.ScriptDuration) * 1000), layout_ms: Math.round((m1.LayoutDuration - m0.LayoutDuration) * 1000),
    style_ms: Math.round((m1.RecalcStyleDuration - m0.RecalcStyleDuration) * 1000),
    raw_markdown_seen: Object.values(rawSeen).some((n) => n > 0), raw_markdown_samples: rawSeen,
    sticks: before.length ? before.filter((s) => s.dist < 40).length / before.length >= 0.8 : false,
    unsticks: after.length && before.length && before.filter((s) => s.dist < 40).length / before.length >= 0.8 ? after.every((s) => s.dist > 100) : null,
    stream_wall_ms: Math.round(await page.evaluate(() => window.__bench.marks.stream_end - window.__bench.marks.stream_start)),
  };
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await page.waitForFunction(() => window.__bench.marks.approval_requested, null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(800);

  // 2–4. Tool step, citations, approval (by what the kit put in the DOM).
  const dom = await page.evaluate((s) => {
    const root = document.querySelector(s.transcript ?? '#app') ?? document.body;
    const text = root.textContent;
    const step = [...root.querySelectorAll('*')].filter((n) => /search_docs/.test(n.textContent)).pop();
    const stepBox = step?.closest('[data-tool], [data-tool-name], details, [class*=tool], [class*=event], [class*=Tool]') ?? step?.parentElement;
    stepBox?.setAttribute('data-bench-step', '');
    // The expand control may sit just outside the matched box (e.g. a "Show data" button beside the header).
    for (let n = stepBox, i = 0; n && i < 4; n = n.parentElement, i++) {
      const t = n.matches?.('[aria-expanded=false]') ? n : n.querySelector?.('[aria-expanded=false], summary');
      if (t) { t.setAttribute('data-bench-toggle', ''); break; }
    }
    const hrefs = [...root.querySelectorAll('a[href]')].map((a) => a.href);
    return {
      step: { name: !!step, args_shown: /branching policy/.test(stepBox?.innerText ?? ''), result_in_dom: /Release process/.test(text),
        collapsible: !!stepBox?.querySelector?.('details, summary, [aria-expanded]') || !!stepBox?.closest?.('details, [aria-expanded]') },
      citations: ['https://docs.example.com/eng/branching', 'https://docs.example.com/eng/retention'].map((u) => hrefs.includes(u)),
      // Kits that render sources as cards rather than links: a "Sources" block naming both documents.
      source_cards: (() => {
        const head = [...root.querySelectorAll('*')].find((n) => /^Sources:?$/.test(n.textContent.trim()));
        const block = head?.parentElement; if (!block) return null;
        return { both: /branching/i.test(block.textContent) && /retention/i.test(block.textContent),
          focusable: block.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])').length };
      })(),
      approval_visible: !!(s.approve && document.querySelector(s.approve)), deny_visible: !!(s.deny && document.querySelector(s.deny)),
    };
  }, sel);
  // Collapsed steps: expand once (as a user would) and look again for the arguments and the result.
  if (dom.step.name && (!dom.step.result_in_dom || !dom.step.args_shown)) {
    const toggle = page.locator('[data-bench-toggle]').first();
    if (await toggle.count()) {
      await toggle.click().catch(() => {}); await page.waitForTimeout(400);
      const again = await page.evaluate((s) => ({ args: /branching policy/.test(document.querySelector('[data-bench-toggle]')?.closest('[data-bench-step]')?.innerText ?? document.querySelector('[data-bench-step]')?.innerText ?? ''),
        result: /Release process/.test((document.querySelector(s.transcript ?? '#app') ?? document.body).innerText) }), sel);
      dom.step.expanded_to_check = true; dom.step.args_shown ||= again.args; dom.step.result_in_dom ||= again.result;
    }
  }
  let resumed = false;
  if (dom.approval_visible) {
    await page.locator(sel.approve).first().click({ timeout: 5000 }).catch((e) => errors.push('approve click: ' + e.message.split('\n')[0]));
    resumed = await page.waitForFunction((s) => /was deleted/.test(document.querySelector(s ?? '#app')?.textContent ?? ''), sel.transcript, { timeout: 10000 }).then(() => true, () => false);
  }
  await page.waitForTimeout(800);

  // Controls: edit exists here; stop, retry and branch are exercised on a fresh page (below) so this page keeps the full turn.
  const has = (s) => s ? page.locator(s).count() : 0;
  const controls = { edit: (await has(sel.edit)) > 0, ...(await controlsTest(lib, sel)) };

  // Accessibility: live regions, composer name, Shift+Enter, axe.
  const a11y = await page.evaluate(() => {
    const live = [...document.querySelectorAll('#app [aria-live], #app [role=log], #app [role=status], #app [role=alert]')]
      .map((n) => ({ role: n.getAttribute('role'), live: n.getAttribute('aria-live'), chars: n.textContent.length }));
    return { live_regions: live, announces_whole_stream: live.some((l) => l.live !== 'off' && l.chars > 2000) };
  });
  a11y.composer = (await composer.ariaSnapshot().catch(() => '')).split('\n')[0];
  a11y.composer_name_from_placeholder_only = await composer.evaluate((n) => !n.getAttribute('aria-label') && !n.getAttribute('aria-labelledby') && !(n.id && document.querySelector(`label[for="${n.id}"]`)) && !n.closest('label'));
  const msgCount = (await transcriptText()).length;
  await composer.click(); await page.keyboard.type('line one'); await page.keyboard.press('Shift+Enter'); await page.keyboard.type('line two');
  a11y.shift_enter_newline = await composer.evaluate((n) => /line one\s*\n\s*line two/.test(n.value ?? n.innerText));
  a11y.shift_enter_did_not_send = Math.abs((await transcriptText()).length - msgCount) < 5;
  await page.keyboard.press('ControlOrMeta+a'); await page.keyboard.press('Backspace');
  await page.addScriptTag({ content: axeSource });
  const axe = await page.evaluate(async () => (await window.axe.run('#app', { resultTypes: ['violations'] })).violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })));
  a11y.axe_violations = axe;
  a11y.stop_focusable = controls.stop_focusable;

  if (inspect) {
    const html = await page.evaluate(() => document.querySelector('#app').outerHTML);
    writeFileSync(join(HERE, 'dist', `${lib}.inspect.html`), html);
    console.log(`wrote dist/${lib}.inspect.html (${html.length} chars)`);
  }

  const levels = await page.evaluate(() => window.__bench.levels);
  const probe = {
    stream: { supported: samples.length > 5 && !errors.some((e) => /Error/.test(e) && !/favicon/.test(e)), note: `markdown: ${levels.markdown}`, ...stream,
      controls: { stop: controls.stop ? levels.stop : false, retry: controls.retry ? levels.retry : false, edit: controls.edit ? levels.edit : false,
        branch: controls.branch ? levels.branch : false, follows_stream: stream.sticks ? levels.stick || 'ui' : false },
      stop_test: controls },
    steps: { supported: dom.step.name && dom.step.result_in_dom, level: levels.steps, ...dom.step,
      note: dom.step.name ? `${levels.steps}: name ${dom.step.name ? 'shown' : 'missing'}, args ${dom.step.args_shown ? 'shown' : 'hidden'}, result ${dom.step.result_in_dom ? 'in DOM' : 'missing'}${dom.step.collapsible ? ', collapsible' : ''}` : 'tool call not rendered' },
    approval: { supported: dom.approval_visible && resumed, level: levels.approval, approve: dom.approval_visible, deny: dom.deny_visible, resumed,
      note: dom.approval_visible ? (resumed ? `${levels.approval}: approve resumed the run` : 'approve shown but the run did not resume') : 'no approval UI or mechanism' },
    citations: { supported: dom.citations.every(Boolean) || !!dom.source_cards?.both, level: levels.citations, found: dom.citations.filter(Boolean).length, cards: dom.source_cards,
      note: dom.citations.every(Boolean) ? `${levels.citations}: both sources rendered as links`
        : dom.source_cards?.both ? `${levels.citations}: both sources shown as cards, not links (${dom.source_cards.focusable} focusable elements)` : `${dom.citations.filter(Boolean).length}/2 source links rendered` },
  };

  // Results panel, then the screenshot that becomes sources/<slug>/bench.jpg.
  await page.evaluate(({ probe, a11y, size, twCss, reactBase }) => {
    const yes = (v, good = 'yes', bad = 'no') => v ? `<span class="ok">${v === true ? good : v}</span>` : `<span class="bad">${bad}</span>`;
    const dl = (rows) => `<dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
    const s = probe.stream;
    document.querySelector('#metrics .view').innerHTML = dl([
      ['JS (initial)', `${Math.round((size.initial - reactBase) * 10) / 10} KB gz + React`], ['Lazy chunks', `${size.lazy} KB gz`], ['CSS', `${Math.round((size.css + twCss) * 10) / 10} KB gz`],
      ['Layout shift', s.cls], ['Script time', `${s.script_ms} ms`], ['Long tasks', `${s.long_tasks} (${s.long_task_ms} ms)`],
      ['Raw markdown', s.raw_markdown_seen ? `<span class="bad">seen (${Object.entries(s.raw_markdown_samples).filter(([, n]) => n).map(([k]) => k).join(', ')})</span>` : '<span class="ok">never</span>'],
      ['Stream time', `${(s.stream_wall_ms / 1000).toFixed(1)} s (script paced at 10 s)`],
      ['Follows the stream', s.sticks ? 'yes' : 'no'], ['Stays put if you scroll up', s.unsticks === null ? '–' : s.unsticks ? 'yes' : '<span class="bad">no</span>'],
      ['Stop / retry', `${yes(s.controls.stop)} / ${yes(s.controls.retry)}`], ['Edit / branch', `${yes(s.controls.edit)} / ${yes(s.controls.branch)}`]]);
    document.querySelector('#steps .view').innerHTML = `${yes(probe.steps.supported, 'supported', 'not supported')} · ${probe.steps.note}`;
    document.querySelector('#approval .view').innerHTML = `${yes(probe.approval.supported, 'supported', 'not supported')} · ${probe.approval.note}`;
    document.querySelector('#citations .view').innerHTML = `${yes(probe.citations.supported, 'supported', 'not supported')} · ${probe.citations.note}`;
    document.querySelector('#a11y .view').innerHTML = dl([
      ['Live region', a11y.live_regions.length ? a11y.live_regions.map((l) => `${l.role ?? ''}${l.live ? ` aria-live=${l.live}` : ''}`).join(', ') : '<span class="bad">none</span>'],
      ['Composer', `${a11y.composer || '?'}${a11y.composer_name_from_placeholder_only ? ' (placeholder only)' : ''}`],
      ['Shift+Enter', yes(a11y.shift_enter_newline && a11y.shift_enter_did_not_send, 'new line')], ['axe', a11y.axe_violations.length ? `<span class="mid">${a11y.axe_violations.map((v) => v.id).join(', ')}</span>` : '<span class="ok">0 violations</span>']]);
  }, { probe, a11y, size, twCss, reactBase });
  const slug = lib;
  mkdirSync(join(SOURCES, slug), { recursive: true });
  await page.screenshot({ path: join(SOURCES, slug, 'bench.jpg'), type: 'jpeg', quality: 82 });
  await page.close();

  const lib_only = Math.round((size.initial - reactBase) * 10) / 10;
  results[slug] = {
    kind: 'ai-chat', bundle_gz_kb: size.initial, react_baseline_kb: reactBase, lib_only_gz_kb: lib_only, lazy_gz_kb: size.lazy,
    css_gz_kb: Math.round((size.css + twCss) * 10) / 10, tasks_total: 4,
    tasks_supported: Object.values(probe).filter((p) => p.supported).length, probe, a11y,
    errors: [...new Set(errors)].slice(0, 8),
  };
  console.log(slug.padEnd(20), `${lib_only} KB gz (+${size.lazy} lazy, ${results[slug].css_gz_kb} css)`, `${results[slug].tasks_supported}/4`,
    `cls ${stream.cls} script ${stream.script_ms}ms raw ${stream.raw_markdown_seen} stick ${stream.sticks}/${stream.unsticks}`,
    JSON.stringify(probe.stream.controls), errors.length ? `errors: ${errors.length}` : '');
}
await browser.close(); server.close();
writeFileSync(join(HERE, "results.json"), JSON.stringify(results, null, 2) + '\n');
