#!/usr/bin/env node
// Design-skill benchmark. Every skill gets the same brief, then the same scripted checks run on what it produced.
//   node run.mjs build [id ...]      out/build/<id>/index.html     -> checks.json + shots/
//   node run.mjs diagram [id ...]    out/diagram/<id>/diagram.html -> checks.json + shots/
//   node run.mjs review [id ...]     out/review/<id>/report.md     -> scored against fixtures/defects.json
//   node run.mjs results             merge checks, juries and run logs into results.json (+ sources/<slug>/bench.jpg)
// Generation is done by agents following briefs/*.md (see README.md); this file only measures the output.
// Env: CHROMIUM_PATH=<chrome binary> when Playwright's own browser is not installed.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';

const HERE = new URL('.', import.meta.url).pathname;
const OUT = join(HERE, 'out');
const CONFIG = JSON.parse(readFileSync(join(HERE, 'skills.json'), 'utf8')).skills;
const CONTENT = JSON.parse(readFileSync(join(HERE, 'briefs/pricing-content.json'), 'utf8'));
const AXE = readFileSync(join(HERE, 'node_modules/axe-core/axe.min.js'), 'utf8');
const [track, ...want] = process.argv.slice(2);
const ids = (t) => (existsSync(join(OUT, t)) ? readdirSync(join(OUT, t)).filter((d) => statSync(join(OUT, t, d)).isDirectory()) : []).filter((d) => !want.length || want.includes(d));
const round = (n, p = 1) => Math.round(n * 10 ** p) / 10 ** p;
const norm = (s) => s.replace(/\s+/g, ' ').toLowerCase();

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const SHOT = { type: 'jpeg', quality: 70 };

// Shared page probes ---------------------------------------------------------------------------------------------
async function open(file, width, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference', javaScriptEnabled: opts.js !== false });
  const page = await ctx.newPage();
  const net = { bytes: 0, external: new Set(), failed: [], errors: [] };
  page.on('console', (m) => { if (m.type() === 'error') net.errors.push(m.text().slice(0, 140)); });
  page.on('pageerror', (e) => net.errors.push(String(e).slice(0, 140)));
  page.on('requestfailed', (r) => net.failed.push(new URL(r.url()).host || r.url().slice(0, 40)));
  page.on('response', async (r) => {
    const u = r.url();
    try { net.bytes += (await r.body()).length; } catch {}
    if (/^https?:/.test(u)) net.external.add(new URL(u).host);
  });
  await page.goto(pathToFileURL(file).href, { waitUntil: 'load' }).catch((e) => net.errors.push(String(e).slice(0, 140)));
  await page.waitForTimeout(opts.settle ?? 900);
  // A visitor scrolls: pages that reveal content on scroll must have shown it before anything is measured or photographed.
  if (opts.js !== false && opts.scroll !== false) {
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 360) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(110); }
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(400);
  }
  return { ctx, page, net };
}
const axe = async (page) => {
  await page.addScriptTag({ content: AXE });
  return page.evaluate(async () => {
    const r = await window.axe.run(document, { resultTypes: ['violations'] });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
  });
};
const overflow = (page) => page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
const infiniteAnimations = (page) => page.evaluate(() => document.getAnimations().filter((a) => {
  const t = a.effect?.getComputedTiming?.(); return t && (t.iterations === Infinity) && a.playState === 'running';
}).length);

// Keyboard walk: Tab through the page, note what takes focus and whether focus is visibly indicated.
async function keyboardWalk(page) {
  const tuple = (el) => { const s = getComputedStyle(el); return [s.outlineStyle, s.outlineWidth, s.outlineColor, s.boxShadow, s.borderTopColor, s.borderTopWidth, s.backgroundColor, s.color, s.textDecorationLine, s.textDecorationThickness, s.transform].join('|'); };
  await page.evaluate(() => { document.activeElement?.blur?.(); window.scrollTo(0, 0); });
  const seen = new Set(); const steps = [];
  let prev = null;
  for (let i = 0; i < 160; i++) {
    await page.keyboard.press('Tab');
    const cur = await page.evaluateHandle(() => document.activeElement);
    const info = await cur.evaluate((el, fn) => {
      const t = new Function('el', `return (${fn})(el)`)(el);
      const r = el.getBoundingClientRect();
      return { tag: el.tagName.toLowerCase(), text: (el.innerText || el.getAttribute('aria-label') || el.value || '').trim().slice(0, 30), id: el.id, key: el.tagName + '#' + el.id + '.' + el.className + '|' + (el.innerText || '').slice(0, 20) + '|' + Math.round(r.top + scrollY) + ',' + Math.round(r.left), focused: t, outline: getComputedStyle(el).outlineStyle !== 'none' && parseFloat(getComputedStyle(el).outlineWidth) > 0, w: r.width, h: r.height, body: el === document.body };
    }, tuple.toString());
    if (prev) {
      const blurred = await prev.handle.evaluate((el, fn) => new Function('el', `return (${fn})(el)`)(el), tuple.toString()).catch(() => null);
      prev.info.indicated = prev.info.outline || (blurred !== null && blurred !== prev.info.focused);
    }
    if (info.body || seen.has(info.key)) break;
    seen.add(info.key); steps.push(info); prev = { handle: cur, info };
  }
  if (prev) { const blurred = await prev.handle.evaluate((el, fn) => new Function('el', `return (${fn})(el)`)(el), tuple.toString()).catch(() => null); prev.info.indicated ??= prev.info.outline || blurred !== prev.info.focused; }
  return { tabbable: steps.length, indicated: steps.filter((s) => s.indicated).length, no_indicator: steps.filter((s) => !s.indicated).map((s) => `${s.tag} "${s.text}"`).slice(0, 8) };
}

// Page checks for the pricing build -----------------------------------------------------------------------------------
async function checkBuild(id) {
  const file = join(OUT, 'build', id, 'index.html');
  const dir = join(OUT, 'build', id, 'shots'); mkdirSync(dir, { recursive: true });
  const res = { widths: {} };
  for (const w of [390, 768, 1280]) {
    const { ctx, page, net } = await open(file, w);
    const v = await axe(page);
    const o = await overflow(page);
    await page.screenshot({ path: join(dir, `${w}.jpg`), fullPage: true, ...SHOT });
    res.widths[w] = { axe_violations: v.reduce((n, x) => n + x.nodes, 0), axe_rules: v.map((x) => `${x.id}:${x.impact}:${x.nodes}`), overflow_px: Math.max(0, o.scroll - o.client), console_errors: net.errors.length };
    if (w === 1280) {
      res.weight_kb = round(net.bytes / 1024, 0); res.external_hosts = [...net.external]; res.failed_requests = net.failed.length;
      await page.screenshot({ path: join(dir, '1280-fold.jpg'), ...SHOT });
      res.hero = await page.evaluate(() => { const h = document.querySelector('h1'); const cta = [...document.querySelectorAll('a,button')].find((e) => /start free trial/i.test(e.textContent) && e.getBoundingClientRect().top < 800 && e.getBoundingClientRect().bottom > 0); const r = h?.getBoundingClientRect(); return { h1_in_fold: !!r && r.top >= 0 && r.bottom <= 800, cta_in_fold: !!cta }; });
      res.keyboard = await keyboardWalk(page);
      res.structure = await page.evaluate(() => ({ h1: document.querySelectorAll('h1').length, main: !!document.querySelector('main,[role=main]'), lang: !!document.documentElement.lang, positive_tabindex: document.querySelectorAll('[tabindex]:not([tabindex="0"]):not([tabindex^="-"])').length }));
      // Content: the brief's facts must all be present; the annual prices after the toggle.
      const text = norm(await page.evaluate(() => document.body.textContent));
      const innerText = await page.evaluate(() => document.body.innerText);
      const need = [];
      for (const p of CONTENT.plans) { need.push(['plan ' + p.name, p.name.toLowerCase()]); need.push(['monthly ' + p.name, new RegExp('(?<![\\d.])' + p.monthly + '(?![\\d]|\\.\\d)')]); for (const f of p.features) need.push(['feature ' + f, f.toLowerCase()]); }
      for (const row of CONTENT.comparison) need.push(['row ' + row[0], row[0].toLowerCase()]);
      for (const [q, a] of CONTENT.faq) { need.push(['faq ' + q, q.toLowerCase()]); need.push(['answer ' + q, norm(a).slice(0, 28)]); }
      const missing = need.filter(([, m]) => !(m instanceof RegExp ? m.test(text) : text.replace(/’/g, "'").includes(m.replace(/’/g, "'")))).map(([k]) => k);
      res.content = { answers_visible: CONTENT.faq.every(([, a]) => norm(innerText).includes(norm(a).slice(0, 28))), facts: need.length, missing: [...new Set(missing)].slice(0, 12), present_pct: round(100 * (1 - new Set(missing).size / need.length), 0), cta_count: (text.match(/start free trial/g) || []).length };
      // Toggle by keyboard, then read the annual prices.
      const toggle = await page.evaluateHandle(() => { const q = (s) => [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0); return q('[role=switch]')[0] || q('input[type=checkbox]')[0] || q('input[type=radio]').find((e) => /annual|year/i.test((e.value || '') + (e.id || '') + (e.labels?.[0]?.textContent || ''))) || q('button,[role=tab],[role=radio],label').find((e) => /annual|year/i.test(e.textContent)) || null; });
      const el = toggle.asElement();
      res.toggle = { found: !!el, keyboard: false, mouse: false };
      const annualOk = async () => { const t = await page.evaluate(() => document.body.innerText); return CONTENT.plans.every((p) => new RegExp(`\\$?\\s?${p.annual.replace('.', '\\.')}(?!\\d)`).test(t)); };
      if (el) {
        await el.focus();
        const tag = await el.evaluate((e) => e.tagName + (e.type || ''));
        const keys = /radio/i.test(tag) ? [' ', 'ArrowRight'] : [' ', 'Enter'];
        for (const k of keys) { await page.keyboard.press(k); await page.waitForTimeout(300); if (await annualOk()) { res.toggle.keyboard = true; break; } }
        if (!res.toggle.keyboard) { await el.click().catch(() => {}); await page.waitForTimeout(300); res.toggle.mouse = await annualOk(); }
        else res.toggle.mouse = true;
        const t = await page.evaluate(() => document.body.innerText); res.toggle.says_billed_annually = /billed (once )?(a year|annually|yearly)|per year|yearly/i.test(t);
      }
      // FAQ by keyboard.
      res.faq = await page.evaluate(async () => {
        const trig = document.querySelector('summary') || [...document.querySelectorAll('[aria-expanded]')].find((e) => /\?/.test(e.textContent));
        if (!trig) return { found: false };
        trig.focus(); return { found: true, native: trig.tagName === 'SUMMARY', focusable: document.activeElement === trig };
      });
      if (res.faq.found) {
        const before = await page.evaluate(() => ({ open: document.querySelector('details[open]') !== null, exp: document.querySelectorAll('[aria-expanded="true"]').length }));
        await page.keyboard.press('Enter'); await page.waitForTimeout(350);
        const after = await page.evaluate(() => ({ open: document.querySelector('details[open]') !== null, exp: document.querySelectorAll('[aria-expanded="true"]').length }));
        res.faq.keyboard = after.open !== before.open || after.exp !== before.exp;
      }
    }
    if (w === 390) {
      res.targets = await page.evaluate(() => {
        const els = [...document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=switch],[role=tab],[onclick]')].filter((e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden'; })
          .filter((e) => !(e.tagName === 'A' && getComputedStyle(e).display === 'inline' && e.parentElement && e.parentElement.textContent.trim().length > e.textContent.trim().length + 20));
        const dims = els.map((e) => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); });
        return { n: els.length, share_24: round1(dims.filter((d) => d >= 24).length / (dims.length || 1)), share_44: round1(dims.filter((d) => d >= 44).length / (dims.length || 1)) };
        function round1(x) { return Math.round(x * 100) / 100; }
      });
      res.min_font_px = await page.evaluate(() => { let min = 99; const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = walker.nextNode())) { if (!n.textContent.trim() || !n.parentElement) continue; const s = getComputedStyle(n.parentElement); if (s.display === 'none' || s.visibility === 'hidden') continue; min = Math.min(min, parseFloat(s.fontSize)); } return min; });
    }
    await ctx.close();
  }
  { const { ctx, page } = await open(file, 1280, { reduce: true }); res.reduced_motion = { infinite_animations: await infiniteAnimations(page) }; await ctx.close(); }
  { const { ctx, page } = await open(file, 1280, { js: false, settle: 300 }); const t = norm(await page.evaluate(() => document.body.textContent)); res.no_js = { plans_visible: CONTENT.plans.every((p) => t.includes(p.name.toLowerCase()) && new RegExp('(?<![\\d.])' + p.monthly + '(?![\\d]|\\.\\d)').test(t)) }; await ctx.close(); }
  // Claims a human should check against the brief: anything that sounds like proof the brief did not supply.
  { const { ctx, page } = await open(file, 1280, { settle: 300 }); const t = await page.evaluate(() => document.body.textContent.replace(/\s+/g, ' '));
    const pats = [/\b\d[\d,.]*\s?(\+|k|m)?\s+(customers|users|teams|firms|companies|accountants|clients|bookkeepers)\b/gi, /(★|⭐|\b\d(\.\d)?\s?\/\s?5\b|\brated\b|\breviews?\b|trustpilot|\bg2\b|capterra)/gi, /trusted by|used by|loved by|join \d|as seen in|featured in/gi, /soc ?2|iso ?27001|gdpr|hipaa|pci|certified|award/gi, /[“"][^”"]{30,}[”"]\s*[-—–]/g];
    res.unsupported_claims = [...new Set(pats.flatMap((p) => [...t.matchAll(p)].map((m) => m[0].slice(0, 60))))].slice(0, 10);
    res.images = await page.evaluate(() => ({ imgs: document.images.length, svg: document.querySelectorAll('svg').length })); await ctx.close(); }
  writeFileSync(join(OUT, 'build', id, 'checks.json'), JSON.stringify(res, null, 1));
  return res;
}

// Page checks for the diagram ------------------------------------------------------------------------------------------
const MUST = [['ux-add', /ux-add/i], ['ux-find', /ux-find/i], ['capture script', /capture(\.mjs)?/i], ['desktop and mobile', /desktop.{0,12}mobile|mobile.{0,12}desktop/i], ['source.html', /source\.html/i], ['styles.json', /styles\.json/i],
  ['duplicate check', /duplicat/i], ['entry.md', /entry\.md/i], ['catalog.json', /catalog\.json/i], ['npm run catalog', /npm run catalog/i], ['CATALOG.md', /CATALOG\.md/i], ['SOURCES.md', /SOURCES\.md/i], ['gallery/data.js', /data\.js/i], ['commit to main', /commit.{0,40}main|main.{0,20}commit|push/i],
  ['republish gallery', /republish|published gallery|gallery/i], ['guides/README.md', /guides\/README|README\.md/i], ['find.mjs', /find\.mjs/i], ['aliases.json', /aliases\.json/i], ['top three', /top (three|3)/i], ['example.tsx', /example\.tsx/i],
  ['four layers', /guides?/i], ['source profiles', /source profiles?/i], ['patterns', /patterns?/i], ['benchmark evidence', /bench(mark)?( evidence|\*)?/i]];
async function checkDiagram(id) {
  const base = join(OUT, 'diagram', id);
  const name = ['diagram.html', 'diagram.svg', 'index.html'].find((n) => existsSync(join(base, n)));
  const file = join(base, name); const dir = join(base, 'shots'); mkdirSync(dir, { recursive: true });
  const res = { file: name, widths: {} };
  for (const w of [390, 1280]) {
    const { ctx, page, net } = await open(file, w);
    const o = await overflow(page);
    await page.screenshot({ path: join(dir, `${w}.jpg`), fullPage: true, ...SHOT });
    const m = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      const visible = (e) => { const r = e.getBoundingClientRect(); return r.width >= 3 && r.height >= 3 && e.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true }) && getComputedStyle(e).clip === 'auto'; };
      const texts = [...document.querySelectorAll('svg text, svg tspan, body *')].filter((e) => !e.children.length && e.textContent.trim() && visible(e) && !e.closest('[aria-hidden="true"],details:not([open]) > :not(summary)'));
      // One rect per rendered line fragment, so a wrapped inline element does not claim the space between its lines.
      const rects = texts.flatMap((e) => [...e.getClientRects()].filter((r) => r.width >= 3 && r.height >= 3).map((r) => ({ l: r.left, t: r.top, r: r.right, b: r.bottom, s: e.textContent.trim().slice(0, 24) })));
      let overlaps = 0; const ex = [];
      for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) { const a = rects[i], b = rects[j]; const ox = Math.min(a.r, b.r) - Math.max(a.l, b.l), oy = Math.min(a.b, b.b) - Math.max(a.t, b.t); if (ox > 2 && oy > 2 && (ox * oy) / Math.min((a.r - a.l) * (a.b - a.t), (b.r - b.l) * (b.b - b.t)) > 0.15) { overlaps++; if (ex.length < 3) ex.push(`${a.s} / ${b.s}`); } }
      let eff = 99; for (const e of texts) { const fs = parseFloat(getComputedStyle(e).fontSize); const ctm = e.getScreenCTM?.(); const k = ctm ? Math.hypot(ctm.a, ctm.b) : 1; eff = Math.min(eff, fs * k); }
      const clipped = [...document.querySelectorAll('body *')].filter((e) => e.children.length === 0 && e.textContent.trim() && getComputedStyle(e).overflow !== 'visible' && e.clientWidth > 4 && e.scrollWidth > e.clientWidth + 1).length;
      // SVG text spilling out of the smallest rect that holds its centre.
      let spill = 0; const rs = [...document.querySelectorAll('svg rect')].map((r) => r.getBoundingClientRect()).filter((r) => r.width > 20 && r.height > 12);
      for (const t of texts.filter((e) => e.closest('svg'))) { const r = t.getBoundingClientRect(); const cx = r.left + Math.min(12, (r.right - r.left) / 2), cy = (r.top + r.bottom) / 2; const holders = rs.filter((q) => cx > q.left && cx < q.right && cy > q.top && cy < q.bottom).sort((a, b) => a.width * a.height - b.width * b.height); if (holders[0] && (r.left < holders[0].left - 1.5 || r.right > holders[0].right + 1.5)) spill++; }
      const arrows = document.querySelectorAll('[marker-end], line[marker-end], path[marker-end], polyline[marker-end]').length;
      const alt = !!(svg && (svg.querySelector('title') || svg.getAttribute('aria-label') || svg.getAttribute('aria-labelledby'))) || !!document.querySelector('figcaption,[aria-describedby],[role=img][aria-label]');
      return { text_nodes: texts.length, overlaps, overlap_examples: ex, min_effective_text_px: Math.round(eff * 10) / 10, clipped, text_spill: spill, connectors: arrows, text_alternative: alt, words: document.body.innerText.split(/\s+/).length };
    });
    res.widths[w] = { overflow_px: Math.max(0, o.scroll - o.client), console_errors: net.errors.length, ...m };
    if (w === 1280) {
      res.axe = (await axe(page)).map((x) => `${x.id}:${x.impact}:${x.nodes}`);
      const text = await page.evaluate(() => (document.body.innerText + ' ' + [...document.querySelectorAll('title,desc,[aria-label]')].map((e) => e.textContent + ' ' + (e.getAttribute('aria-label') || '')).join(' ')));
      const hit = MUST.filter(([, re]) => re.test(text)); res.labels = { required: MUST.length, present: hit.length, missing: MUST.filter(([, re]) => !re.test(text)).map(([k]) => k) };
      res.numbers_in_text = [...new Set(text.match(/\b\d+\b/g) || [])].filter((n) => !['3', '4', '5', '14'].includes(n)).slice(0, 8);
      res.weight_kb = round(net.bytes / 1024, 0); res.external_hosts = [...net.external]; res.failed_requests = net.failed.length;
    }
    await ctx.close();
  }
  { const { ctx, page } = await open(file, 1280, { reduce: true }); res.reduced_motion = { infinite_animations: await infiniteAnimations(page) }; await ctx.close(); }
  writeFileSync(join(base, 'checks.json'), JSON.stringify(res, null, 1));
  return res;
}

// Review scoring: seeded defects found by a report ----------------------------------------------------------------------
function scoreReview(id) {
  const { defects } = JSON.parse(readFileSync(join(HERE, 'fixtures/defects.json'), 'utf8'));
  const dir = join(OUT, 'review', id);
  const text = readFileSync(join(dir, 'report.md'), 'utf8');
  const blocks = text.split(/\n\s*\n|\n(?=\s*(?:[-*]|\d+[.)]|#{2,4})\s)/).map((b) => b.trim()).filter(Boolean);
  const adjust = existsSync(join(dir, 'adjust.json')) ? JSON.parse(readFileSync(join(dir, 'adjust.json'), 'utf8')) : {};
  // Loose regex pass: only a smoke test and a fallback. The score is the blind scorer's, kept only when its quote is really in the report.
  const auto = defects.filter((d) => d.match.some((alt) => blocks.some((b) => alt.every((re) => new RegExp(re, 'i').test(b))))).map((d) => d.id);
  const flat = (t) => t.replace(/[\s*_`>#|-]+/g, ' ').toLowerCase().trim();
  const scored = existsSync(join(dir, 'scored.json')) ? JSON.parse(readFileSync(join(dir, 'scored.json'), 'utf8')) : null;
  const unverified = []; let found;
  if (scored) {
    found = new Set(); const rep = flat(text);
    for (const d of defects) { const e = scored.defects?.[d.id]; if (!e?.found) continue; const q = flat(e.quote ?? '').slice(0, 50); if (q.length >= 12 && rep.includes(q)) found.add(d.id); else unverified.push(d.id); }
  } else found = new Set(auto);
  for (const a of adjust.add ?? []) found.add(a); for (const r of adjust.remove ?? []) found.delete(r);
  const by = (key) => Object.fromEntries([...new Set(defects.map((d) => d[key]))].map((k) => { const all = defects.filter((d) => d[key] === k); return [k, `${all.filter((d) => found.has(d.id)).length}/${all.length}`]; }));
  const unl = scored?.unlisted ?? [];
  const res = { found: [...found].sort(), missed: defects.filter((d) => !found.has(d.id)).map((d) => d.id), recall_pct: round((100 * found.size) / defects.length, 0), by_category: by('category'), by_severity: by('severity'), scored_by: scored ? 'blind scorer (quotes verified)' : 'regex only', regex_found: auto.length, unverified_quotes: unverified,
    unlisted_valid: unl.filter((u) => u.valid).length, unlisted_invalid: unl.filter((u) => !u.valid).length, hand_adjusted: [...(adjust.add ?? []).map((x) => '+' + x), ...(adjust.remove ?? []).map((x) => '-' + x)], report_chars: text.length, notes: adjust.notes ?? null };
  writeFileSync(join(dir, 'checks.json'), JSON.stringify(res, null, 1));
  return res;
}

if (track === 'build') for (const id of ids('build')) { const r = await checkBuild(id); console.log(`build ${id}: axe ${r.widths[1280].axe_violations}, overflow@390 ${r.widths[390].overflow_px}px, tab ${r.keyboard.indicated}/${r.keyboard.tabbable}, content ${r.content.present_pct}%, toggle kbd ${r.toggle.keyboard}`); }
else if (track === 'diagram') for (const id of ids('diagram')) { const r = await checkDiagram(id); console.log(`diagram ${id}: labels ${r.labels.present}/${r.labels.required}, overlaps ${r.widths[1280].overlaps}, spill ${r.widths[1280].text_spill}, min text ${r.widths[390].min_effective_text_px}px@390`); }
else if (track === 'review') for (const id of ids('review')) { const r = scoreReview(id); console.log(`review ${id}: recall ${r.recall_pct}% (${r.found.length}/31, ${r.scored_by}, regex said ${r.regex_found}) ${JSON.stringify(r.by_category)}`); }
else if (track === 'jury-prep') {
  // Blind the screenshots: shuffled labels, key kept apart from what the judges may read.
  const t = want[0]; if (!['build', 'diagram', 'review'].includes(t)) throw new Error('usage: node run.mjs jury-prep build|diagram|review');
  const { copyFileSync, rmSync } = await import('node:fs');
  const dirs = readdirSync(join(OUT, t)).filter((d) => statSync(join(OUT, t, d)).isDirectory() && existsSync(join(OUT, t, d, t === 'review' ? 'report.md' : 'shots')));
  const order = dirs.map((d) => [Math.random(), d]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  const base = join(OUT, 'judges', t); rmSync(join(base, 'blind'), { recursive: true, force: true }); mkdirSync(join(base, 'blind'), { recursive: true });
  const key = {}; const files = t === 'review' ? {} : t === 'build' ? { fold: '1280-fold.jpg', desktop: '1280.jpg', mobile: '390.jpg' } : { desktop: '1280.jpg', mobile: '390.jpg' };
  order.forEach((d, i) => { const label = String.fromCharCode(65 + i); key[label] = d; for (const [k, f] of Object.entries(files)) copyFileSync(join(OUT, t, d, 'shots', f), join(base, 'blind', `${label}-${k}.jpg`)); if (t === 'review') copyFileSync(join(OUT, t, d, 'report.md'), join(base, 'blind', `${label}.md`)); });
  writeFileSync(join(base, 'key.json'), JSON.stringify(key, null, 1));
  console.log(`jury-prep ${t}: ${order.length} labelled sets in out/judges/${t}/blind/ (key.json holds the mapping; judges and scorers must not read it)`);
}
else if (track === 'results') { const { default: aggregate } = await import('./results.mjs'); await aggregate({ browser, CONFIG, OUT, HERE }); }
else console.log('usage: node run.mjs build|diagram|review|results [id ...]');
await browser.close();
