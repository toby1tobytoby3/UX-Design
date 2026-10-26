#!/usr/bin/env node
// Propose rubric scores (guides/source-rubric.md, "Agent design skills") from results.json, so the numbers that can be
// computed are computed. Interactivity, React/Next fit and Licence & health are judgement calls from reading and vetting:
// they are not proposed here.
//   node score.mjs            prints a table and writes score-proposals.json
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const HERE = new URL('.', import.meta.url).pathname;
const results = JSON.parse(readFileSync(join(HERE, 'results.json'), 'utf8'));
const control = results._baseline;
if (!control) throw new Error('no _baseline run in results.json');

const band = (pct) => (pct >= 85 ? 5 : pct >= 70 ? 4 : pct >= 55 ? 3 : pct >= 40 ? 2 : 1);
const clamp = (n) => Math.max(1, Math.min(5, n));
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const A11Y_BUILD = ['no_serious_axe', 'focus_visible_everywhere', 'toggle_by_keyboard', 'faq_by_keyboard', 'reduced_motion_respected', 'targets_24_px', 'page_structure'];
const A11Y_DIAGRAM = ['no_serious_axe', 'text_alternative', 'reduced_motion_respected', 'text_10_px_at_390', 'text_11_px_at_1280'];

// Each skill's numbers pool its first run with any repeat runs (`_repeats` in results.json, written by results.mjs): the mean over runs
// is banded, so one lucky or unlucky run moves a score less. The control is pooled the same way.
const runsOf = (slug, r, t) => [r.tracks[t], ...Object.values(results._repeats ?? {}).filter((x) => x.slug === slug && x.tracks[t]).map((x) => x.tracks[t])].filter(Boolean);
const costOf = (slug, r, t) => [r.cost?.[t], ...Object.values(results._repeats ?? {}).filter((x) => x.slug === slug && x.cost?.[t]).map((x) => x.cost[t])].filter(Boolean);

// Percent measures for one run of a track.
const measure = {
  coverage: (k, t) => (t === 'review' ? k.recall_pct : (100 * k.checks_passed) / k.checks_total),
  a11y: (k, t) => {
    if (t === 'review') { const [f, n] = k.by_category.accessibility.split('/').map(Number); return (100 * f) / n; }
    const keys = t === 'build' ? A11Y_BUILD : A11Y_DIAGRAM; return (100 * keys.filter((x) => !k.failed.includes(x)).length) / keys.length; },
};
// The jury is a 1-5 mean, compared with the control's mean directly (rounded difference), not banded.

const rel = (slug, r, key) => {
  const deltas = [];
  for (const t of ['build', 'review', 'diagram']) {
    if (!r.tracks[t]) continue;
    const mine = runsOf(slug, r, t), ctl = runsOf('_baseline', control, t);
    if (!mine.length || !ctl.length) continue;
    if (key === 'look') { const a = mean(mine.map((k) => k.jury_mean).filter((x) => x != null)), b = mean(ctl.map((k) => k.jury_mean).filter((x) => x != null)); if (!Number.isNaN(a) && !Number.isNaN(b)) deltas.push(Math.round(a - b)); continue; }
    deltas.push(band(mean(mine.map((k) => measure[key](k, t)))) - band(mean(ctl.map((k) => measure[key](k, t)))));
  }
  return deltas.length ? clamp(3 + Math.round(mean(deltas))) : null;
};
const perf = (slug, r) => {
  const ratios = Object.keys(r.cost ?? {}).filter((t) => control.cost?.[t]).map((t) => mean(costOf(slug, r, t).map((c) => c.tokens)) / mean(costOf('_baseline', control, t).map((c) => c.tokens)));
  if (!ratios.length) return { score: null };
  const x = mean(ratios);
  return { score: x <= 1.5 ? 5 : x <= 2 ? 4 : x <= 3 ? 3 : x <= 5 ? 2 : 1, ratio: Math.round(x * 100) / 100 };
};
const bundle = (r) => { const f = r.footprint; if (!f) return null; const mb = f.dir_kb / 1024, l = f.skill_md_lines;
  return l <= 150 && mb <= 1 ? 5 : l <= 300 && mb <= 5 ? 4 : l <= 600 && mb <= 25 ? 3 : l <= 1000 && mb <= 60 ? 2 : 1; };

const out = {};
for (const [slug, r] of Object.entries(results)) {
  if (slug.startsWith('_')) continue;
  out[slug] = { s_look: rel(slug, r, 'look'), s_coverage: rel(slug, r, 'coverage'), s_a11y: rel(slug, r, 'a11y'), s_perf: perf(slug, r).score, cost_ratio: perf(slug, r).ratio, s_bundle: bundle(r), tracks: Object.keys(r.tracks), runs: Math.max(...Object.keys(r.tracks).map((t) => runsOf(slug, r, t).length)) };
}
writeFileSync(join(HERE, 'score-proposals.json'), JSON.stringify(out, null, 1) + '\n');
console.log('slug'.padEnd(26), 'look cover a11y perf(x)   bundle tracks');
for (const [s, v] of Object.entries(out)) console.log(s.padEnd(26), String(v.s_look ?? '-').padEnd(5), String(v.s_coverage ?? '-').padEnd(5), String(v.s_a11y ?? '-').padEnd(4), `${v.s_perf ?? '-'}(${v.cost_ratio ?? '-'})`.padEnd(10), String(v.s_bundle ?? '-').padEnd(7), v.tracks.join(','));
