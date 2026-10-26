// Merge per-run checks, blind juries and run costs into results.json, and draw sources/<slug>/bench.jpg.
// Called by `node run.mjs results`. Keys starting with `_` are bench-internal (the control lives under `_baseline`).
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const read = (f, d = null) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : d);
const round = (n, p = 1) => Math.round(n * 10 ** p) / 10 ** p;
const sum = (a) => a.reduce((x, y) => x + y, 0);
const mean = (a) => (a.length ? sum(a) / a.length : null);
const dirKb = (d) => { let n = 0; (function walk(p) { for (const f of readdirSync(p)) { if (f === '.git') continue; const q = join(p, f); const s = statSync(q); s.isDirectory() ? walk(q) : (n += s.size); } })(d); return Math.round(n / 1024); };

export default async function aggregate({ browser, CONFIG, OUT, HERE }) {
  const serious = (rules) => rules.some((r) => /:(serious|critical):/.test(r));
  const buildChecks = (c, adj) => {
    const w = c.widths;
    const list = {
      no_serious_axe: !Object.values(w).some((x) => serious(x.axe_rules)),
      no_sideways_scroll: w[390].overflow_px === 0 && w[768].overflow_px === 0,
      focus_visible_everywhere: c.keyboard.tabbable > 0 && c.keyboard.indicated === c.keyboard.tabbable,
      toggle_by_keyboard: !!c.toggle.keyboard,
      faq_by_keyboard: !!c.faq.keyboard || (!c.faq.found && !!c.content.answers_visible),
      content_complete: c.content.present_pct === 100,
      reduced_motion_respected: c.reduced_motion.infinite_animations === 0,
      targets_24_px: c.targets.share_24 >= 0.9,
      text_12_px_min: c.min_font_px >= 12,
      hero_cta_above_fold: c.hero.h1_in_fold && c.hero.cta_in_fold,
      nothing_invented: adj.facts_ok ?? c.unsupported_claims.length === 0,
      page_structure: c.structure.h1 === 1 && c.structure.main && c.structure.lang && c.structure.positive_tabindex === 0,
      works_without_js: !!c.no_js.plans_visible,
      no_errors: Object.values(w).every((x) => x.console_errors === 0) && c.failed_requests === 0,
    };
    return list;
  };
  const diagramChecks = (c, adj) => {
    const a = c.widths[1280], b = c.widths[390];
    return {
      required_labels: c.labels.present / c.labels.required >= 0.9,
      no_text_overlap: a.overlaps === 0 && b.overlaps === 0,
      no_text_spill: a.text_spill === 0 && a.clipped === 0,
      fits_390: b.overflow_px === 0,
      text_10_px_at_390: b.min_effective_text_px >= 10,
      text_11_px_at_1280: a.min_effective_text_px >= 11,
      no_serious_axe: !serious(c.axe),
      text_alternative: !!a.text_alternative,
      reduced_motion_respected: c.reduced_motion.infinite_animations === 0,
      nothing_invented: adj.facts_ok === true,
      no_errors: a.console_errors === 0 && b.console_errors === 0,
      self_contained: c.external_hosts.every((h) => /fonts\.(googleapis|gstatic)\.com/.test(h)),
    };
  };
  const jury = (track) => {
    const dir = join(OUT, 'judges', track);
    const key = read(join(dir, 'key.json'));
    if (!key) return {};
    const judges = existsSync(dir) ? readdirSync(dir).filter((f) => /^judge-\d+\.json$/.test(f)).map((f) => read(join(dir, f))) : [];
    const out = {};
    for (const [label, id] of Object.entries(key)) {
      const dims = judges.map((j) => j.ratings?.[label]).filter(Boolean);
      if (!dims.length) continue;
      const per = Object.fromEntries(Object.keys(dims[0]).map((k) => [k, round(mean(dims.map((d) => d[k])), 2)]));
      out[id] = { mean: round(mean(Object.values(per)), 2), dims: per, judges: dims.length, rank_sum: sum(judges.map((j) => j.rank.indexOf(label) + 1)) };
    }
    return out;
  };
  const juries = { build: jury('build'), diagram: jury('diagram') };

  const results = {};
  const ids = { build: [], review: [], diagram: [] };
  for (const t of Object.keys(ids)) if (existsSync(join(OUT, t))) ids[t] = readdirSync(join(OUT, t)).filter((d) => statSync(join(OUT, t, d)).isDirectory());
  const cost = (t, id) => read(join(OUT, t, id, 'cost.json'));
  const entries = {};
  for (const t of Object.keys(ids)) for (const id of ids[t]) {
    const c = read(join(OUT, t, id, 'checks.json')); if (!c) continue;
    const adj = read(join(OUT, t, id, 'adjust.json'), {});
    let track;
    if (t === 'build') { const l = buildChecks(c, adj); track = { checks_passed: Object.values(l).filter(Boolean).length, checks_total: Object.keys(l).length, failed: Object.entries(l).filter(([, v]) => !v).map(([k]) => k), axe_violations: c.widths[1280].axe_violations, overflow_390_px: c.widths[390].overflow_px, keyboard_focus: `${c.keyboard.indicated}/${c.keyboard.tabbable}`, content_pct: c.content.present_pct, targets_24_share: c.targets.share_24, min_font_px: c.min_font_px, weight_kb: c.weight_kb, external_hosts: c.external_hosts, unsupported_claims: c.unsupported_claims, jury_mean: juries.build[id]?.mean ?? null, jury_dims: juries.build[id]?.dims ?? null }; }
    if (t === 'diagram') { const l = diagramChecks(c, adj); track = { checks_passed: Object.values(l).filter(Boolean).length, checks_total: Object.keys(l).length, failed: Object.entries(l).filter(([, v]) => !v).map(([k]) => k), labels: `${c.labels.present}/${c.labels.required}`, overlaps: c.widths[1280].overlaps, text_spill: c.widths[1280].text_spill, min_text_px_390: c.widths[390].min_effective_text_px, weight_kb: c.weight_kb, jury_mean: juries.diagram[id]?.mean ?? null, jury_dims: juries.diagram[id]?.dims ?? null }; }
    if (t === 'review') track = { found: c.found.length, total: 31, recall_pct: c.recall_pct, by_category: c.by_category, by_severity: c.by_severity, missed: c.missed, unlisted_valid: c.unlisted_valid, unlisted_invalid: c.unlisted_invalid };
    (entries[id] ??= { tracks: {}, cost: {} }); entries[id].tracks[t] = track; const k = cost(t, id); if (k) entries[id].cost[t] = k;
  }
  // Repeat runs live in out/<track>/<id>-r2 (same brief, fresh agent): kept apart under `_repeats`, never mixed into a profile's score.
  const repeats = {};
  for (const [id, e] of Object.entries(entries)) if (!CONFIG[id] && /-r\d+$/.test(id)) repeats[id] = { of: id.replace(/-r\d+$/, ''), tracks: e.tracks, cost: e.cost };
  for (const [id, e] of Object.entries(entries)) {
    const cfg = CONFIG[id]; if (!cfg) continue;
    const dirs = cfg.dirs ?? (cfg.dir ? [cfg.dir] : []);
    const footprint = dirs.length ? { skill_md_lines: dirs.reduce((n, d) => n + readFileSync(join(HERE, d, 'SKILL.md'), 'utf8').split('\n').length, 0), dir_kb: dirs.reduce((n, d) => n + dirKb(join(HERE, d)), 0), skills_loaded: dirs.length } : null;
    const record = { kind: 'design-skill', commit: cfg.sha?.slice(0, 7) ?? null, footprint, tracks: e.tracks, cost: e.cost };
    results[cfg.slug ?? `_${id}`] = record;
  }
  if (Object.keys(repeats).length) results._repeats = repeats;
  // The control's numbers are the bar every skill is compared with.
  writeFileSync(join(HERE, 'results.json'), JSON.stringify(results, null, 1) + '\n');

  // One result card per source: what it was given, what it scored, the page or diagram it made.
  for (const [slug, r] of Object.entries(results)) {
    if (slug.startsWith('_')) continue;
    const id = Object.keys(CONFIG).find((k) => CONFIG[k].slug === slug);
    const t = r.tracks;
    const img = (track) => { const f = join(OUT, track, id, 'shots', track === 'build' ? '1280-fold.jpg' : '1280.jpg'); return existsSync(f) ? `file://${f}` : null; };
    const rows = [];
    if (t.build) rows.push(['Builds a pricing page', `${t.build.checks_passed}/${t.build.checks_total} checks`, `jury ${t.build.jury_mean ?? 'n/a'}/5`, `${t.build.axe_violations} axe`]);
    if (t.review) rows.push(['Reviews a page seeded with 31 defects', `${t.review.found}/31 found`, `${t.review.recall_pct}%`, Object.entries(t.review.by_category).map(([k, v]) => `${k} ${v}`).join(' · ')]);
    if (t.diagram) rows.push(['Draws the library pipeline', `${t.diagram.checks_passed}/${t.diagram.checks_total} checks`, `jury ${t.diagram.jury_mean ?? 'n/a'}/5`, `${t.diagram.overlaps} overlaps`]);
    const html = `<body style="margin:0;font:15px/1.4 system-ui,sans-serif;background:#fff;color:#111;width:1400px;height:760px;display:grid;grid-template-columns:${img('build') || img('diagram') ? '720px 1fr' : '1fr'};">
      ${img('build') || img('diagram') ? `<div style="background:#eee;padding:24px;display:grid;gap:12px;align-content:start">${['build', 'diagram'].filter(img).map((k) => `<div><div style="font-size:12px;color:#555;margin-bottom:4px">${k === 'build' ? 'Pricing page, 1280 px, first screen' : 'Diagram, 1280 px'}</div><img src="${img(k)}" style="width:672px;height:${k === 'build' ? 378 : 300}px;object-fit:cover;object-position:top;border:1px solid #ccc"></div>`).join('')}</div>` : ''}
      <div style="padding:32px"><div style="font-size:12px;color:#555;letter-spacing:0">Design skill benchmark · n=1 run per track · commit ${r.commit ?? ''}</div><h1 style="margin:6px 0 20px;font-size:34px">${slug}</h1>
      ${rows.map((x) => `<div style="border-top:1px solid #ddd;padding:12px 0"><div style="font-size:13px;color:#555">${x[0]}</div><div style="font-size:24px;font-weight:600">${x[1]} <span style="font-weight:400;color:#555;font-size:16px">${x[2]}</span></div><div style="font-size:13px;color:#555">${x[3]}</div></div>`).join('')}
      <div style="border-top:1px solid #ddd;padding-top:12px;font-size:13px;color:#555">Footprint: ${r.footprint ? `${r.footprint.skill_md_lines} lines of SKILL.md, ${(r.footprint.dir_kb / 1024).toFixed(1)} MB` : 'n/a'}</div></div></body>`;
    const dir = join(HERE, '../sources', slug); if (!existsSync(dir)) continue;
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 760 } }); const page = await ctx.newPage();
    await page.setContent(html); await page.waitForTimeout(300);
    await page.screenshot({ path: join(dir, 'bench.jpg'), type: 'jpeg', quality: 80 }); await ctx.close();
  }
  console.log(`results.json: ${Object.keys(results).join(', ')}`);
}
