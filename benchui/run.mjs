#!/usr/bin/env node
// UI primitives benchmark: the same dialog, menu, combobox and tabs in each headless library, driven with real
// keyboard events and checked against the WAI-ARIA Authoring Practices, plus axe-core with each component open.
//   node run.mjs [lib ...]     (default: all files in libs/)
// Writes ../sources/<slug>/bench.jpg and results.json (evidence for the ui-primitives source profiles).
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, basename, extname } from 'node:path';

const HERE = new URL('.', import.meta.url).pathname;
const SOURCES = join(HERE, '../sources');
const TASKS = ['dialog', 'menu', 'combobox', 'tabs'];
const want = process.argv.slice(2);
const libs = readdirSync(join(HERE, 'libs')).filter((f) => /\.jsx?$/.test(f)).map((f) => basename(f, extname(f)))
  .filter((l) => !want.length || want.includes(l));
const AXE = readFileSync(join(HERE, 'node_modules/axe-core/axe.min.js'), 'utf8');

async function bundle(name, entry) {
  const out = join(HERE, 'dist', `${name}.js`);
  await build({ entryPoints: [entry], bundle: true, minify: true, format: 'iife', outfile: out, nodePaths: [join(HERE, 'node_modules')],
    define: { 'process.env.NODE_ENV': '"production"' }, jsx: 'automatic', logLevel: 'error' });
  return Math.round(gzipSync(readFileSync(out)).length / 102.4) / 10;
}
const reactBase = await bundle('_react', join(HERE, '../bench/libs/_react-baseline.jsx'));
// shared.js + page markup are the same for everyone; measure them so only the library is left.
const sharedBase = await bundle('_shared', join(HERE, 'shared.js'));

const server = createServer((req, res) => {
  const file = join(HERE, 'dist', req.url.split('?')[0]);
  if (!existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': file.endsWith('.html') ? 'text/html' : 'text/javascript' }).end(readFileSync(file));
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;

// ---- probes: each returns { checks: {name: bool}, axe, note? }. Every check reads the live DOM, never the library.
const wait = (page, ms = 250) => page.waitForTimeout(ms);
const press = async (page, key) => { await page.keyboard.press(key); await page.waitForTimeout(60); };
const visible = (page, sel) => page.evaluate((s) => [...document.querySelectorAll(s)].some((n) => n.getClientRects().length && getComputedStyle(n).visibility !== 'hidden'), sel);
const active = (page) => page.evaluate(() => {
  const a = document.activeElement; const id = a?.getAttribute('aria-activedescendant');
  const cur = id ? document.getElementById(id) : a;
  return { tag: a?.tagName, role: a?.getAttribute('role'), text: cur?.textContent?.trim(), curRole: cur?.getAttribute('role'),
    inDialog: !!a?.closest('[role=dialog],[role=alertdialog]'), trigger: !!a?.closest('section .view') && a?.tagName === 'BUTTON' };
});
async function axe(page, include) {
  await page.evaluate(AXE);
  return page.evaluate(async (inc) => {
    const ctx = { include: inc.filter((s) => document.querySelector(s)).map((s) => [s]) };
    const r = await window.axe.run(ctx, { rules: { region: { enabled: false } } });
    return r.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(' ')}`);
  }, include);
}
async function axName(page, sel) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.getDocument');
  const { result } = await cdp.send('Runtime.evaluate', { expression: `document.querySelector(${JSON.stringify(sel)})` });
  const { node } = await cdp.send('DOM.describeNode', { objectId: result.objectId });
  const { nodes } = await cdp.send('Accessibility.queryAXTree', { backendNodeId: node.backendNodeId });
  await cdp.detach(); return nodes[0]?.name?.value ?? '';
}
async function focusTrigger(page, id) { await page.focus(`#${id} .view button, #${id} .view [role=combobox]`); }

const PROBES = {
  async dialog(page) {
    const c = {};
    await focusTrigger(page, 'dialog'); await page.keyboard.press('Enter'); await wait(page, 400);
    c.opens_with_enter = await visible(page, '[role=dialog],[role=alertdialog]');
    c.focus_moves_inside = (await active(page)).inDialog;
    // APG: Tab wraps inside the dialog. Some libraries instead let Tab leave to the browser UI (like native <dialog>)
    // while the page behind stays inert. Score "never reaches the page behind"; record wrapping as a note.
    let wraps = true, safe = true;
    for (const key of [...Array(6).fill('Tab'), ...Array(6).fill('Shift+Tab')]) {
      await press(page, key); const a = await active(page);
      wraps &&= a.inDialog; safe &&= a.inDialog || a.tag === 'BODY' || a.tag === 'HTML';
    }
    c.tab_never_reaches_page_behind = safe;
    c.modal_semantics = await page.evaluate(() => {
      const d = document.querySelector('[role=dialog],[role=alertdialog]');
      const outside = document.querySelector('#menu .view');
      return d?.getAttribute('aria-modal') === 'true' || !!outside?.closest('[aria-hidden=true],[inert]');
    });
    c.has_accessible_name = await page.evaluate(() => {
      const d = document.querySelector('[role=dialog],[role=alertdialog]'); if (!d) return false;
      const ids = d.getAttribute('aria-labelledby'); return !!(d.getAttribute('aria-label') || (ids && ids.split(' ').map((i) => document.getElementById(i)?.textContent).join('').trim()));
    });
    const violations = await axe(page, ['#dialog', '[role=dialog]']);
    await page.keyboard.press('Escape'); await wait(page, 400);
    c.escape_closes = !(await visible(page, '[role=dialog],[role=alertdialog]'));
    c.focus_returns_to_trigger = await page.evaluate(() => document.activeElement?.closest('#dialog') !== null && document.activeElement.tagName === 'BUTTON');
    return { checks: c, axe: violations, note: wraps ? 'Tab wraps inside the dialog' : 'Tab leaves to the browser UI after the last control (page behind is inert)' };
  },
  async menu(page) {
    const c = {};
    const menuOpen = () => visible(page, '[role=menu]');
    const cur = async () => (await active(page)).text;
    await focusTrigger(page, 'menu');
    c.haspopup_on_trigger = await page.evaluate(() => !!document.querySelector('#menu .view button')?.getAttribute('aria-haspopup'));
    await press(page, 'Enter'); await wait(page);
    c.opens_with_enter = await menuOpen();
    c.first_item_focused = (await cur()) === 'Edit' && /menuitem/.test((await active(page)).curRole ?? '');
    c.aria_expanded_true = await page.evaluate(() => document.querySelector('#menu .view button')?.getAttribute('aria-expanded') === 'true');
    c.roles_menu_menuitem = await page.evaluate(() => document.querySelectorAll('[role=menu] [role^=menuitem]').length === 8);
    await press(page, 'ArrowDown'); const down = await cur();
    await press(page, 'ArrowUp'); const up = await cur();
    c.arrow_keys_move = down === 'Duplicate' && up === 'Edit';
    await press(page, 'r');
    c.typeahead = (await cur()) === 'Rename';
    await wait(page, 800); // let the typeahead buffer clear
    await press(page, 'End'); const end = await cur();
    await press(page, 'Home'); const home = await cur();
    c.home_end = end === 'Delete' && home === 'Edit';
    const violations = await axe(page, ['#menu', '[role=menu]']);
    await press(page, 'Escape'); await wait(page);
    c.escape_closes_and_returns_focus = !(await menuOpen()) && (await page.evaluate(() => document.activeElement === document.querySelector('#menu .view button')));
    await press(page, 'ArrowDown'); await wait(page);
    c.opens_with_arrow_down = (await menuOpen()) && (await cur()) === 'Edit';
    await press(page, 'Escape'); await wait(page);
    return { checks: c, axe: violations };
  },
  async combobox(page) {
    const c = {};
    const input = '#combobox [role=combobox]';
    const listOpen = () => visible(page, '[role=listbox]');
    await page.focus(input);
    await page.keyboard.type('uni', { delay: 60 }); await wait(page, 400);
    const opts = await page.evaluate(() => [...document.querySelectorAll('[role=listbox] [role=option]')].map((o) => o.textContent.trim()));
    c.typing_filters = opts.length > 0 && opts.length < 50 && opts.every((o) => o.toLowerCase().includes('uni'));
    c.combobox_roles = await page.evaluate((s) => {
      const i = document.querySelector(s); const lb = document.getElementById(i?.getAttribute('aria-controls') ?? '');
      return i?.getAttribute('aria-expanded') === 'true' && lb?.getAttribute('role') === 'listbox';
    }, input);
    // The name Chrome actually exposes, read from its accessibility tree while the list is open.
    c.keeps_name_while_open = (await axName(page, input)) === 'Country';
    const violations = await axe(page, ['#combobox', '[role=listbox]']);
    await page.keyboard.press('ArrowDown'); await wait(page, 150);
    const hi = await page.evaluate((s) => {
      const i = document.querySelector(s); const id = i.getAttribute('aria-activedescendant');
      const el = id ? document.getElementById(id) : (document.activeElement?.getAttribute('role') === 'option' ? document.activeElement : null);
      return el?.textContent.trim() ?? null;
    }, input);
    c.arrow_highlights_option = !!hi && opts.includes(hi);
    await page.keyboard.press('Enter'); await wait(page, 300);
    const value = await page.inputValue(input);
    c.enter_selects_and_closes = !(await listOpen()) && value === hi;
    await page.fill(input, ''); await page.keyboard.type('fr', { delay: 60 }); await wait(page, 300);
    const reopened = await listOpen();
    await page.keyboard.press('Escape'); await wait(page, 300);
    c.escape_closes = reopened && !(await listOpen());
    return { checks: c, axe: violations, note: `highlighted "${hi}", input "${value}"` };
  },
  async tabs(page) {
    const c = {};
    const sel = () => page.evaluate(() => [...document.querySelectorAll('#tabs [role=tab]')].map((t) => t.getAttribute('aria-selected')));
    c.roles = await page.evaluate(() => !!document.querySelector('#tabs [role=tablist]') && document.querySelectorAll('#tabs [role=tab]').length === 4 && !!document.querySelector('#tabs [role=tabpanel]'));
    const s = await sel();
    c.aria_selected = s[0] === 'true' && s.slice(1).every((x) => x === 'false' || x === null);
    // One tab stop: Tab from just before the tabs lands on the selected tab, the next Tab leaves the tab list.
    await page.focus('#tabs .probe-start'); await press(page, 'Tab');
    const first = await active(page); await press(page, 'Tab'); const next = await active(page);
    c.single_tab_stop = first.role === 'tab' && first.text === 'Overview' && next.role !== 'tab';
    c.panel_labelled_by_tab = await page.evaluate(() => {
      const p = [...document.querySelectorAll('#tabs [role=tabpanel]')].find((x) => !x.hidden && x.getClientRects().length);
      const t = document.getElementById(p?.getAttribute('aria-labelledby') ?? ''); return t?.getAttribute('role') === 'tab' && t.getAttribute('aria-selected') === 'true';
    });
    await page.focus('#tabs [role=tab]');
    const txt = async () => (await active(page)).text;
    await press(page, 'ArrowRight'); const r = await txt();
    const activation = (await sel())[1] === 'true' ? 'automatic' : 'manual';
    await press(page, 'ArrowLeft'); const l = await txt();
    c.arrow_keys_move = r === 'Activity' && l === 'Overview';
    await press(page, 'End'); const e = await txt();
    await press(page, 'Home'); const h = await txt();
    c.home_end = e === 'Settings' && h === 'Overview';
    const violations = await axe(page, ['#tabs']);
    return { checks: c, axe: violations, note: `${activation} activation` };
  },
};

const results = existsSync(join(HERE, 'results.json')) ? JSON.parse(readFileSync(join(HERE, 'results.json'), 'utf8')) : {};
const browser = await chromium.launch();
for (const lib of libs) {
  const gz = await bundle(lib, join(HERE, 'libs', `${lib}.jsx`));
  writeFileSync(join(HERE, 'dist', `${lib}.html`), readFileSync(join(HERE, 'page.html'), 'utf8').replace('LIB.js', `${lib}.js`));
  const errors = []; const probe = {};
  for (const task of TASKS) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, locale: 'en-GB' });
    page.on('pageerror', (e) => errors.push(`${task}: ${e.message.slice(0, 200)}`));
    page.on('console', (m) => m.type() === 'error' && errors.push(`${task}: ${m.text().slice(0, 200)}`));
    await page.goto(`${base}/${lib}.html`); await wait(page, 500);
    const na = await page.evaluate((t) => document.querySelector(`#${t} .view`).dataset.na === '1', task);
    if (na) probe[task] = { supported: false, note: await page.evaluate((t) => window.__bench.notes[t], task), checks: {}, axe: [] };
    else {
      const r = await PROBES[task](page).catch((e) => ({ checks: {}, axe: [], note: `probe error: ${e.message.split('\n')[0]}` }));
      probe[task] = { supported: true, ...r };
    }
    await page.close();
  }
  // Screenshot with the menu open, so the sheet shows a popup as well as the resting states.
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, locale: 'en-GB' });
  await page.goto(`${base}/${lib}.html`); await wait(page, 500);
  await page.focus('#menu .view button'); await page.keyboard.press('Enter'); await wait(page, 400); await page.keyboard.press('ArrowDown');
  if (!probe.combobox.supported) {} // nothing to open
  const slug = lib;
  mkdirSync(join(SOURCES, slug), { recursive: true });
  await page.screenshot({ path: join(SOURCES, slug, 'bench.jpg'), type: 'jpeg', quality: 82 });
  await page.close();

  const checks = Object.values(probe).flatMap((p) => Object.values(p.checks));
  results[slug] = {
    kind: 'ui-primitives', bundle_gz_kb: gz, react_baseline_kb: reactBase, shared_baseline_kb: sharedBase,
    lib_only_gz_kb: Math.round((gz - sharedBase) * 10) / 10,
    tasks_total: TASKS.length, tasks_supported: Object.values(probe).filter((p) => p.supported).length,
    keyboard_passed: checks.filter(Boolean).length, keyboard_total: checks.length,
    axe_violations: Object.values(probe).reduce((n, p) => n + p.axe.length, 0),
    probe, errors,
  };
  const r = results[slug];
  console.log(slug.padEnd(12), `${gz} KB gz (lib ${r.lib_only_gz_kb})`, `${r.tasks_supported}/4 tasks`, `checks ${r.keyboard_passed}/${r.keyboard_total}`, `axe ${r.axe_violations}`);
  for (const [t, p] of Object.entries(probe)) {
    const failed = Object.entries(p.checks).filter(([, v]) => !v).map(([k]) => k);
    console.log('   ', t.padEnd(9), p.supported ? `${Object.values(p.checks).filter(Boolean).length}/${Object.keys(p.checks).length}` : 'n/a', failed.length ? `FAIL ${failed.join(', ')}` : '', p.axe.length ? `axe ${p.axe.join(' ')}` : '', p.note ?? '');
  }
  if (errors.length) console.log('    errors', errors.slice(0, 4));
}
await browser.close(); server.close();
writeFileSync(join(HERE, 'results.json'), JSON.stringify(results, null, 2) + '\n');
