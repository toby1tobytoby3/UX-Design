#!/usr/bin/env node
// Inline AI benchmark runner: bundle each kit (build.mjs), serve over localhost, and drive the same four tasks with real
// keyboard and mouse input in headless Chromium. Every kit talks to the same deterministic mock (mock.js), no API key.
//   node run.mjs [lib ...]        (default: every libs/*.jsx not starting with _)
// Writes ../sources/<slug>/bench.jpg and results.json (evidence for the ai-assist source profiles).
//   ghost    latency from last keystroke to suggestion, requests vs keystrokes (debounce, cancellation), screen-reader
//            exposure of the ghost, Tab accepts only while a suggestion shows, Esc dismisses, Ctrl+→ word accept, and no
//            suggestion while an IME composition is open (driven through Chrome's own IME API).
//   rewrite  select a 272-word paragraph → Improve writing → is a diff shown before applying, Accept / Discard / Try again,
//            does one Ctrl+Z after Accept restore the original.
//   fill     four fields from a description: AI marks, a user-typed field left alone, per-field revert, no auto-submit.
//   command  AI menu by shortcut or slash: opens with focus, presets, arrow keys, free text, Esc closes, focus returns.
// Plus axe-core (WCAG 2.2 AA tags) with the menu closed and open, main-thread script time for the rewrite stream at 4×
// CPU throttle (median of 3) and gzipped bundle sizes.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { bundle } from './build.mjs';
import { GHOST_PREFIX, GHOST_TEXT, REWRITE_ORIGINAL, REWRITE_IMPROVED, REWRITE_WORDS, FILL_OBJECT } from './mock.js';

const HERE = new URL('.', import.meta.url).pathname;
const NM = join(HERE, 'node_modules');
const SOURCES = join(HERE, '../sources');
const want = process.argv.slice(2);
const libs = readdirSync(join(HERE, 'libs')).filter((f) => /\.jsx$/.test(f) && !f.startsWith('_')).map((f) => basename(f, '.jsx'))
  .filter((l) => !want.length || want.includes(l));
const PRESETS = /^(improve writing|make shorter|make longer|fix spelling.*|summari[sz]e|simplify.*|translate.*|continue writing|add a summary|explain|emojify)$/i;

mkdirSync(join(HERE, 'dist'), { recursive: true });
const reactBase = (await bundle('_react', join(HERE, '../bench/libs/_react-baseline.jsx'))).initial;
const server = createServer((req, res) => {
  const file = join(HERE, 'dist', decodeURIComponent(req.url.split('?')[0]));
  if (!existsSync(file) || file.endsWith('/')) { res.writeHead(404).end(); return; }
  const type = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff' }[extname(file)] ?? 'application/octet-stream';
  res.writeHead(200, { 'content-type': type }).end(readFileSync(file));
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
const axeSource = readFileSync(join(NM, 'axe-core/axe.min.js'), 'utf8');
const browser = await chromium.launch();
const norm = (s) => (s ?? '').replace(/\s+/g, ' ').trim();

async function open(lib) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, locale: 'en-GB' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  await page.goto(`${base}/${lib}/index.html`);
  await page.waitForFunction(() => window.__bench?.ready, null, { timeout: 30000 });
  await page.waitForTimeout(800);
  // Instrumentation: last keystroke time, and the first frame the ghost suggestion is on screen.
  await page.evaluate((needle) => {
    const b = window.__bench;
    document.addEventListener('keydown', () => { b.marks.lastKey = performance.now(); }, true);
    const sec = document.getElementById('ghost');
    const tick = () => {
      const shown = sec && sec.innerText.includes(needle) && !b._ghostSeen;
      if (shown) { b._ghostSeen = true; b.marks.ghostAt = performance.now(); }
      if (sec && !sec.innerText.includes(needle)) b._ghostSeen = false;
      requestAnimationFrame(tick);
    };
    tick();
  }, GHOST_TEXT.slice(0, 18));
  return { page, errors };
}

// Text of a field, whether it's a <textarea> or a contenteditable editor.
// Committed text: a textarea's value, or an editor's text without non-editable decorations (ghost text, widgets).
const fieldText = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  if (!el) return null;
  if (el.value != null) return el.value;
  const c = el.cloneNode(true);
  c.querySelectorAll('[contenteditable="false"]').forEach((x) => x.remove());
  return c.innerText ?? c.textContent;
}, sel);
const focusInside = (page, sel) => page.evaluate((s) => { const el = document.querySelector(s); return !!el && (el === document.activeElement || el.contains(document.activeElement)); }, sel);
const calls = (page) => page.evaluate(() => ({ calls: Object.values(window.__bench.calls ?? {}).reduce((a, b) => a + b, 0), aborted: Object.values(window.__bench.aborted ?? {}).reduce((a, b) => a + b, 0) }));
// The committed text of the ghost field (a textarea's value, or an editor's text without non-editable decorations such as
// the ghost itself). A ghost is showing when the suggestion appears on screen more often than in the committed text.
const count = (s, n) => s.split(n).length - 1;
const ghostVisible = (page, needle = GHOST_TEXT.slice(0, 18)) => page.evaluate(([n, sel]) => {
  const sec = document.getElementById('ghost');
  const el = sec?.querySelector(sel);
  if (!el) return false;
  let committed = el.value;
  if (committed == null) { const c = el.cloneNode(true); c.querySelectorAll('[contenteditable="false"]').forEach((x) => x.remove()); committed = c.textContent; }
  return sec.innerText.split(n).length > committed.split(n).length;
}, [needle, ghostSel]);
let ghostSel = '';
async function endOfField(page, sel) {
  await page.locator(sel).click();
  await page.keyboard.press('Control+End');
}
// Wait for the suggestion to appear, then for it to finish streaming (its last characters on screen), as a user would.
async function waitGhost(page, ms = 4000) {
  const until = async (needle, limit) => { const t = Date.now(); while (Date.now() - t < limit) { if (await ghostVisible(page, needle)) return true; await page.waitForTimeout(50); } return false; };
  if (!(await until(GHOST_TEXT.slice(0, 18), ms))) return false;
  await until(GHOST_TEXT.slice(-12), 2000);
  await page.waitForTimeout(150);
  return true;
}
// Visible control with this accessible text (button, menu item or option).
async function control(page, re) {
  for (const role of ['button', 'option', 'menuitem']) {
    const l = page.getByRole(role, { name: re });
    if (await l.count()) for (let i = 0; i < await l.count(); i++) if (await l.nth(i).isVisible()) return l.nth(i);
  }
  return null;
}

async function ghostTask(page, cfg) {
  const r = { supported: true };
  const f = cfg.field;
  ghostSel = f.replace(/^#ghost /, '');
  await endOfField(page, f);
  const before = await calls(page);
  await page.keyboard.type(GHOST_PREFIX, { delay: 45 });
  r.keystrokes = GHOST_PREFIX.length;
  r.appeared = await waitGhost(page, 5000);
  const m = await page.evaluate(() => window.__bench.marks);
  r.latency_ms = r.appeared ? Math.round(m.ghostAt - m.lastKey) : null;
  const after = await calls(page);
  r.requests = after.calls - before.calls; r.aborted = after.aborted - before.aborted;
  // Screen-reader exposure: is the suggestion in Chrome's accessibility tree (what a screen reader reads), and is it aria-hidden?
  if (r.appeared) {
    const cdp = await page.context().newCDPSession(page);
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    r.ghost_in_accessibility_tree = nodes.some((n) => !n.ignored && String(n.name?.value ?? '').includes(GHOST_TEXT.slice(0, 18)));
  }
  r.ghost_aria_hidden = await page.evaluate((n) => {
    const walker = document.createTreeWalker(document.getElementById('ghost'), NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) if (walker.currentNode.textContent.includes(n)) return !!walker.currentNode.parentElement.closest('[aria-hidden="true"]');
    return null;
  }, GHOST_TEXT.slice(0, 18));
  r.announced = await page.evaluate(() => [...document.querySelectorAll('#ghost [role=status], #ghost [aria-live]')].map((n) => n.textContent).join(' ').trim() || null);
  // Tab accepts while a suggestion shows (and focus stays).
  if (r.appeared) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    r.tab_accepts = norm(await fieldText(page, f)).endsWith(norm(GHOST_PREFIX + GHOST_TEXT));
    r.tab_keeps_focus = await focusInside(page, f);
  }
  // With no suggestion, Tab should move focus on (not be swallowed).
  await endOfField(page, f);
  await page.waitForTimeout(700);
  const textBefore = await fieldText(page, f);
  await page.keyboard.press('Tab');
  await page.waitForTimeout(200);
  r.tab_moves_focus_without_suggestion = !(await focusInside(page, f)) && (await fieldText(page, f)) === textBefore;
  // Esc dismisses without changing the text.
  await endOfField(page, f);
  await page.keyboard.type(' Then ', { delay: 30 });
  if (await waitGhost(page)) {
    const t = await fieldText(page, f);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    r.esc_dismisses = !(await ghostVisible(page)) && (await fieldText(page, f)) === t;
  } else r.esc_dismisses = null;
  // Ctrl+→ accepts one word.
  await endOfField(page, f);
  await page.keyboard.type(' And ', { delay: 30 });
  if (await waitGhost(page)) {
    await page.keyboard.press('Control+ArrowRight');
    await page.waitForTimeout(300);
    const t = norm(await fieldText(page, f));
    r.word_accept = t.endsWith('And of') && !t.endsWith(norm(GHOST_TEXT));
  } else r.word_accept = null;
  await page.keyboard.press('Escape');
  // IME: while a composition is open (and the text ends with a space), no request and no suggestion.
  await endOfField(page, f);
  await page.keyboard.type(' x', { delay: 20 });
  await page.waitForTimeout(600);
  const c0 = await calls(page);
  const cdp = await page.context().newCDPSession(page);
  for (const t of ['に', 'にほ', 'にほん', 'にほん ']) { await cdp.send('Input.imeSetComposition', { text: t, selectionStart: t.length, selectionEnd: t.length }); await page.waitForTimeout(80); }
  await page.waitForTimeout(1500);
  r.ime_composition_reached_field = (await fieldText(page, f))?.includes('にほん') ?? false; // proves the test is not vacuous
  const c1 = await calls(page);
  r.ime_requests_while_composing = c1.calls - c0.calls;
  r.ime_ghost_shown_while_composing = await ghostVisible(page);
  r.ime_safe = r.ime_requests_while_composing === 0 && !r.ime_ghost_shown_while_composing;
  await cdp.send('Input.insertText', { text: '日本 ' });
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');
  return r;
}

async function rewriteTask(page, cfg, { accept = true } = {}) {
  const r = { supported: true };
  await page.locator(cfg.field).click();
  await page.keyboard.press('Control+a');
  await page.waitForTimeout(400);
  if (cfg.toolbarButton) { await page.locator(cfg.toolbarButton).first().click(); await page.waitForTimeout(500); }
  else await page.keyboard.press(cfg.open);
  await page.locator(cfg.preset).first().click({ timeout: 5000 });
  r.started = true;
  // Wait for the review controls (stream finished).
  const t0 = Date.now();
  let acceptCtl = null;
  while (Date.now() - t0 < 20000 && !(acceptCtl = await control(page, /^accept$/i))) await page.waitForTimeout(150);
  r.review_ms = Date.now() - t0;
  // Let the review UI settle (no DOM changes for 500 ms) before acting, as a person reading the diff would.
  await page.evaluate(() => new Promise((resolve) => { let t = setTimeout(done, 500); const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(done, 500); }); mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true }); function done() { mo.disconnect(); resolve(); } setTimeout(done, 5000); }));
  acceptCtl = await control(page, /^accept$/i);
  r.focus_in_editor_or_menu = await page.evaluate((s) => { const a = document.activeElement; return !!a && (a.closest(s.replace(/ .*$/, '')) !== null || !!a.closest('[role=dialog],[cmdk-root],.bn-ai-menu, [data-radix-popper-content-wrapper]')); }, cfg.field);
  const doc = norm(await fieldText(page, cfg.field));
  r.diff_markup = await page.evaluate(() => document.querySelectorAll('ins, del, [class*="suggestion" i], [data-suggestion], [class*="insertion" i], [class*="deletion" i]').length);
  r.preview_before_apply = r.diff_markup > 0 || (doc.includes(norm(REWRITE_ORIGINAL).slice(0, 60)) && (await page.locator('body').innerText()).includes(norm(REWRITE_IMPROVED).slice(0, 60)));
  r.controls = { accept: !!acceptCtl, discard: !!(await control(page, /^(discard|reject|revert)$/i)), try_again: !!(await control(page, /^(try again|retry)$/i)) };
  if (!accept) return r;
  if (acceptCtl) {
    await acceptCtl.click();
    const t1 = Date.now();
    while (Date.now() - t1 < 5000 && norm(await fieldText(page, cfg.field)) !== norm(REWRITE_IMPROVED)) await page.waitForTimeout(150);
    const got = norm(await fieldText(page, cfg.field));
    r.applied = got === norm(REWRITE_IMPROVED);
    if (!r.applied) { const want = norm(REWRITE_IMPROVED); let i = 0; while (i < got.length && got[i] === want[i]) i++; r.applied_mismatch = { at: i, got: got.slice(i, i + 40), want: want.slice(i, i + 40) }; }
    await page.locator(cfg.field).click();
    // Count undo presses until the original is back (up to 40), and whether the first press already restores it.
    let presses = 0;
    for (; presses < 40; presses++) {
      if (norm(await fieldText(page, cfg.field)) === norm(REWRITE_ORIGINAL)) break;
      await page.keyboard.press('Control+z'); await page.waitForTimeout(120);
      if (presses === 0) r.after_first_undo_head = norm(await fieldText(page, cfg.field)).slice(0, 50);
    }
    const back = norm(await fieldText(page, cfg.field));
    r.undo_presses_to_original = back === norm(REWRITE_ORIGINAL) ? presses : null;
    if (r.undo_presses_to_original === null) { const want = norm(REWRITE_ORIGINAL); let i = 0; while (i < back.length && back[i] === want[i]) i++; r.undo_mismatch = { at: i, got: back.slice(i, i + 50), want: want.slice(i, i + 50) }; }
  }
  return r;
}

async function fillTask(page, cfg) {
  const r = { supported: true };
  const val = (k) => page.locator(`#f-${k}`).inputValue();
  const prefilled = await val(cfg.prefilled);
  const c0 = await calls(page);
  await page.locator(cfg.button).click();
  await page.waitForFunction((s) => document.querySelector('#f-summary')?.value === s, FILL_OBJECT.summary, { timeout: 10000 }).catch(() => {});
  r.requests = (await calls(page)).calls - c0.calls;
  r.filled = (await val('title')) === FILL_OBJECT.title && (await val('summary')) === FILL_OBJECT.summary && (await val('tags')) === FILL_OBJECT.tags.join(', ');
  r.user_value_kept = (await val(cfg.prefilled)) === prefilled;
  r.ai_marked = await page.locator('[data-ai-filled]').count();
  await page.locator('#f-title').click(); await page.keyboard.press('End'); await page.keyboard.type(' (EU)');
  r.edit_clears_mark = !(await page.locator('[data-field="title"][data-ai-filled]').count());
  const revert = page.getByRole('button', { name: /revert summary/i });
  if (await revert.count()) { await revert.click(); r.revert_restores = (await val('summary')) === ''; }
  r.auto_submitted = await page.evaluate(() => window.__bench.submits > 0);
  return r;
}

async function commandTask(page, cfg) {
  const r = { supported: true };
  await page.locator(cfg.field).click();
  await page.keyboard.press('Control+End');
  if (cfg.slash) { await page.keyboard.press('Enter'); await page.keyboard.type(cfg.slash, { delay: 40 }); await page.waitForTimeout(500); await page.keyboard.press('Enter'); }
  else await page.keyboard.press(cfg.open);
  await page.waitForTimeout(700);
  r.opens_with_focus = await page.evaluate((s) => !!document.activeElement?.matches(s), cfg.menuInput);
  const options = await page.evaluate(() => [...document.querySelectorAll('[role=option],[role=menuitem],[cmdk-item]')].filter((n) => n.offsetParent).map((n) => n.innerText.trim()));
  r.presets = options.filter((o) => PRESETS.test(o)).length;
  const sel = () => page.evaluate(() => {
    const a = document.activeElement;
    const id = a?.getAttribute('aria-activedescendant');
    const s = document.querySelector('[cmdk-item][data-selected=true], [role=option][aria-selected=true], [role=menuitem][data-selected=true], .bn-suggestion-menu-item[aria-selected=true]');
    return (id && document.getElementById(id)?.innerText) || s?.innerText || null;
  });
  const s0 = await sel();
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(150);
  r.arrow_keys_move = (await sel()) !== s0 && (await sel()) !== null;
  await page.keyboard.type('make it friendlier', { delay: 20 });
  r.free_text = await page.evaluate(() => document.activeElement?.value ?? null) === 'make it friendlier';
  r.axe_menu_open = await axe(page);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  if (await page.evaluate((s) => !!document.activeElement?.matches(s), cfg.menuInput)) { await page.keyboard.press('Escape'); await page.waitForTimeout(300); r.esc_presses = 2; } else r.esc_presses = 1;
  r.esc_closes = !(await page.evaluate((s) => [...document.querySelectorAll(s)].some((n) => n.offsetParent), cfg.menuInput));
  r.focus_returns = await focusInside(page, cfg.field);
  return r;
}

async function axe(page) {
  await page.evaluate(axeSource);
  const res = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } })).violations
    .map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })));
  return res;
}

// Main-thread cost of the rewrite stream at 4× CPU throttle, median of three fresh pages.
async function rewriteCost(lib, cfg) {
  const runs = [];
  for (let i = 0; i < 3; i++) {
    const { page } = await open(lib);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Performance.enable');
    await page.locator(cfg.field).click(); await page.keyboard.press('Control+a'); await page.waitForTimeout(300);
    if (cfg.toolbarButton) { await page.locator(cfg.toolbarButton).first().click(); await page.waitForTimeout(400); } else await page.keyboard.press(cfg.open);
    const preset = page.locator(cfg.preset).first();
    await preset.waitFor({ timeout: 5000 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const m0 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
    const t0 = Date.now();
    await preset.click();
    while (Date.now() - t0 < 60000 && !(await control(page, /^accept$/i))) await page.waitForTimeout(150);
    const m1 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
    runs.push({ script: (m1.ScriptDuration - m0.ScriptDuration) * 1000, wall: Date.now() - t0 });
    await page.close();
  }
  const med = (k) => Math.round(runs.map((r) => r[k]).sort((a, b) => a - b)[1]);
  return { script_ms: med('script'), wall_ms: med('wall') };
}

const results = existsSync(join(HERE, 'results.json')) ? JSON.parse(readFileSync(join(HERE, 'results.json'), 'utf8')) : {};
for (const lib of libs) {
  const size = await bundle(lib, join(HERE, 'libs', `${lib}.jsx`));
  // Each task runs on a fresh page so one task's focus or editor state can't leak into the next.
  const first = await open(lib);
  const { cfg, notes } = await first.page.evaluate(() => ({ cfg: window.__bench.config, notes: window.__bench.notes }));
  const errors = first.errors;
  await first.page.close();
  const probe = {};
  let axeClosed = null;
  for (const [task, fn] of [['ghost', ghostTask], ['rewrite', rewriteTask], ['fill', fillTask], ['command', commandTask]]) {
    if (!cfg[task]) { probe[task] = { supported: false, note: notes[task] }; continue; }
    if (task === 'rewrite') {
      // Three fresh trials: Accept and undo must work every time, not once.
      const trials = [];
      for (let i = 0; i < 3; i++) { const t = await open(lib); try { trials.push(await rewriteTask(t.page, cfg.rewrite)); } catch (err) { trials.push({ error: err.message.slice(0, 120) }); } errors.push(...t.errors); await t.page.close(); }
      probe.rewrite = { ...trials[0], applied_trials: trials.map((t) => !!t.applied), undo_trials: trials.map((t) => t.undo_presses_to_original ?? null),
        failed_trials: trials.filter((t) => !t.applied || t.error).map((t) => ({ error: t.error, mismatch: t.applied_mismatch })) };
      continue;
    }
    const { page, errors: e } = await open(lib);
    try { probe[task] = await fn(page, cfg[task]); } catch (err) { probe[task] = { supported: true, error: err.message.split('\n')[0].slice(0, 200) }; }
    await page.keyboard.press('Escape').catch(() => {});
    if (!axeClosed) axeClosed = await axe(page);
    errors.push(...e);
    await page.close();
  }

  // Screenshot in a fresh page: a rewrite under review, a filled form, then a pending ghost suggestion (typed last so
  // nothing else takes focus away from it).
  const shot = await open(lib);
  if (cfg.rewrite) await rewriteTask(shot.page, cfg.rewrite, { accept: false }).catch(() => {});
  if (cfg.rewrite?.toolbarButton) await shot.page.mouse.click(5, 5); // let BlockNote's menu close so it doesn't cover the page
  if (cfg.fill) { await shot.page.locator(cfg.fill.button).click(); await shot.page.waitForTimeout(1500); }
  if (cfg.ghost) { await endOfField(shot.page, cfg.ghost.field); await shot.page.keyboard.type(GHOST_PREFIX, { delay: 20 }); await waitGhost(shot.page); }
  mkdirSync(join(SOURCES, lib), { recursive: true });
  await shot.page.screenshot({ path: join(SOURCES, lib, 'bench.jpg'), type: 'jpeg', quality: 82 });
  await shot.page.close();

  const cost = cfg.rewrite ? await rewriteCost(lib, cfg.rewrite).catch((e) => ({ error: e.message.slice(0, 120) })) : null;
  const passed = {
    ghost: probe.ghost.supported && probe.ghost.appeared && probe.ghost.tab_accepts,
    rewrite: probe.rewrite.supported && probe.rewrite.controls?.accept && probe.rewrite.applied,
    fill: probe.fill.supported && probe.fill.filled,
    command: probe.command.supported && probe.command.opens_with_focus,
  };
  results[lib] = { kind: 'ai-assist', bundle_gz_kb: Math.round((size.initial + size.lazy) * 10) / 10, initial_gz_kb: size.initial, lazy_gz_kb: size.lazy, css_gz_kb: size.css,
    react_baseline_kb: reactBase, lib_only_gz_kb: Math.round((size.initial - reactBase) * 10) / 10, tasks_total: 4,
    tasks_supported: Object.values(passed).filter(Boolean).length, probe, rewrite_cost: { ...cost, words: REWRITE_WORDS, cpu_throttle: 4 },
    axe: { closed: axeClosed, menu_open: probe.command.axe_menu_open ?? null }, errors: [...new Set(errors)] };
  console.log(lib.padEnd(16), `${results[lib].lib_only_gz_kb} KB (+${size.lazy} lazy)`, `${results[lib].tasks_supported}/4`, JSON.stringify(cost), errors.length ? errors.slice(0, 3) : '');
}
await browser.close(); server.close();
writeFileSync(join(HERE, 'results.json'), JSON.stringify(results, null, 2) + '\n');
