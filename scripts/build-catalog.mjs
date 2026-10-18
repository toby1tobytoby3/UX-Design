#!/usr/bin/env node
// Rebuild the central lookup table from entry and source-profile frontmatter.
// Entries are the source of truth; these three outputs are generated:
//   catalog.json      machine-readable table (used by ux-find)
//   CATALOG.md        human-readable table (renders on GitHub)
//   gallery/data.js   same data as a script, so the gallery works from file://
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const ENTRIES = join(ROOT, 'entries');
const SOURCES = join(ROOT, 'sources');
const IMAGE = /\.(jpe?g|png|webp)$/i;
// Benchmark evidence: every bench (charts, 3D, motion, UI primitives, AI chat, inline AI, tables) shares one shape: per-task probes plus
// bundle size, with a few category-specific measurements on top.
const BENCHES = ['bench', 'bench3d', 'benchmotion', 'benchui', 'benchai', 'benchinline', 'benchtable', 'benchpanels'];
// Keys starting with `_` are bench-internal (e.g. size probes), not sources.
const readBench = (f) => Object.fromEntries(Object.entries(JSON.parse(readFileSync(f, 'utf8'))).filter(([k]) => !k.startsWith('_')));
const bench = Object.assign({}, ...BENCHES.map((d) => join(ROOT, d, 'results.json')).filter(existsSync).map(readBench));

// Source scores are computed, never hand-typed: mean of the eight rubric criteria (guides/source-rubric.md) × 2.
export const CRITERIA = { s_look: 'Default look', s_interact: 'Interactivity', s_coverage: 'Coverage', s_a11y: 'Accessibility',
  s_perf: 'Performance', s_react: 'React/Next fit', s_bundle: 'Bundle size', s_licence: 'Licence & health' };
function scoreSource(data, file) {
  const missing = Object.keys(CRITERIA).filter((k) => !(data[k] >= 1 && data[k] <= 5));
  if (missing.length) throw new Error(`${file}: rubric scores 1-5 required for ${missing.join(', ')}`);
  const mean = Object.keys(CRITERIA).reduce((sum, k) => sum + data[k], 0) / 8;
  return { score: Math.round(mean * 20) / 10, rating: Math.max(1, Math.round(mean)) };
}

// Minimal frontmatter parser: flat `key: value` lines, inline [a, b] arrays,
// numbers, booleans and quoted strings. Keep entry frontmatter to this subset.
function parse(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      v = v.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else if (v === 'true' || v === 'false') v = v === 'true';
    else if (/^-?\d+(\.\d+)?$/.test(v)) v = Number(v);
    else v = v.replace(/^["']|["']$/g, '');
    data[kv[1]] = v;
  }
  return { data, body: m[2].trim() };
}

function find(dir, fileName) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return find(p, fileName);
    return name === fileName ? [p] : [];
  });
}

const entries = [
  ...find(ENTRIES, 'entry.md').map((file) => [file, 'pattern']),
  ...find(SOURCES, 'source.md').map((file) => [file, 'source']),
].map(([file, kind]) => {
  const dir = dirname(file);
  const parsed = parse(readFileSync(file, 'utf8'));
  if (!parsed) throw new Error(`No frontmatter in ${file}`);
  const files = readdirSync(dir);
  const images = files.filter((f) => IMAGE.test(f)).sort((a, b) => rank(a) - rank(b));
  const slug = relative(SOURCES, dir);
  return {
    id: kind === 'source' ? relative(ROOT, dir) : relative(ENTRIES, dir),
    kind,
    ...parsed.data,
    ...(kind === 'source' ? { ...scoreSource(parsed.data, file), bench: bench[slug] ? summariseBench(bench[slug]) : null } : {}),
    path: relative(ROOT, dir),
    images: images.map((f) => `${relative(ROOT, dir)}/${f}`),
    files: files.filter((f) => !IMAGE.test(f) && !f.endsWith('.md')).concat(kind === 'source' ? 'source.md' : 'entry.md'),
    body: parsed.body,
  };
}).sort((a, b) => String(b.captured_at).localeCompare(String(a.captured_at)) || a.id.localeCompare(b.id));

// Benchmark evidence attached to each source, trimmed to what an agent needs. `evidence` is a one-line summary of the
// category-specific measurement, shown in SOURCES.md.
function summariseBench(b) {
  const kind = b.kind ?? 'chart';
  const probes = Object.entries(b.probe ?? {});
  const out = { kind, bundle_gz_kb: b.bundle_gz_kb, lib_only_gz_kb: b.lib_only_gz_kb, react_baseline_kb: b.react_baseline_kb,
    tasks_supported: b.tasks_supported ?? b.charts_supported, tasks_total: b.tasks_total ?? 4,
    unsupported: probes.filter(([, p]) => !p.supported || p.passed === false).map(([k, p]) => `${k}: ${p.note}`) };
  if (kind === 'chart' || kind === '3d') {
    const renderer = [...new Set(probes.map(([, p]) => p.renderer ?? 'webgl').filter((x) => x !== 'none'))].join('/');
    Object.assign(out, { renderer, keyboard_focusable: probes.some(([, p]) => p.focusable > 0), evidence: renderer,
      ...(b.native !== undefined ? { tasks_native: b.native, first_frame_ms_swiftshader: b.product_ready_ms } : {}) });
  } else if (kind === 'motion') {
    const engines = Object.fromEntries(probes.filter(([, p]) => p.engine).map(([k, p]) => [k, p.engine]));
    Object.assign(out, { engines, stress_script_ms: b.perf?.script_ms ?? null, reduced_motion: b.reduced?.method ?? null,
      evidence: `${b.perf ? `${b.perf.script_ms} ms script` : 'no stress run'}; scroll: ${engines.scroll ?? 'n/a'}` });
  } else if (kind === 'ui-primitives') {
    Object.assign(out, { keyboard_passed: b.keyboard_passed, keyboard_total: b.keyboard_total, axe_violations: b.axe_violations,
      evidence: `${b.keyboard_passed}/${b.keyboard_total} keyboard checks, ${b.axe_violations} axe` });
  } else if (kind === 'ai-assist') {
    const g = b.probe?.ghost ?? {}, rw = b.probe?.rewrite ?? {};
    const trials = rw.applied_trials ?? [];
    Object.assign(out, { ghost_latency_ms: g.latency_ms ?? null, ime_safe: g.ime_safe ?? null, ghost_hidden_from_sr: g.ghost_aria_hidden ?? null,
      rewrite_script_ms: b.rewrite_cost?.script_ms ?? null,
      evidence: [g.supported ? `ghost ${g.latency_ms} ms${g.ime_safe === false ? ', not IME-safe' : ''}` : 'no ghost text',
        trials.length ? `accept ${trials.filter(Boolean).length}/${trials.length}` : null,
        b.rewrite_cost ? `rewrite ${(b.rewrite_cost.script_ms / 1000).toFixed(1)} s script` : null].filter(Boolean).join('; ') });
  } else if (kind === 'ai-chat') {
    const st = b.probe?.stream ?? {};
    const controls = Object.entries(st.controls ?? {}).filter(([k, v]) => k !== 'follows_stream' && v === 'ui').map(([k]) => k);
    const raw = Object.entries(st.raw_markdown_samples ?? {}).filter(([, n]) => n > 0).map(([k]) => k);
    Object.assign(out, { stream_script_ms: st.script_ms ?? null, layout_shift: st.cls ?? null, raw_markdown_seen: raw,
      controls_built_in: controls, live_region: (b.a11y?.live_regions ?? []).length > 0,
      evidence: st.script_ms ? `${(st.script_ms / 1000).toFixed(1)} s script; ${raw.length ? `raw ${raw.join('/')} seen mid-stream` : 'no raw markdown'}; controls: ${controls.join(', ') || 'none'}` : '' });
  } else if (kind === 'data-table') {
    const big = b.probe?.big ?? {}, lay = b.probe?.layout ?? {};
    Object.assign(out, { render_ms: big.render_ms ?? null, sort_ms: big.sort_ms ?? null, filter_ms: big.filter_ms ?? null,
      dom_rows: big.dom_rows ?? null, aria_rowcount_ok: big.aria_rowcount_ok ?? null, multi_sort: lay.multi_sort ?? null,
      keyboard_passed: b.keyboard_passed, keyboard_total: b.keyboard_total, axe_violations: b.axe_violations,
      evidence: big.supported ? `10k rows: sort ${big.sort_ms} ms, filter ${big.filter_ms} ms, ${big.dom_rows} DOM rows; ${b.keyboard_passed}/${b.keyboard_total} keyboard, ${b.axe_violations} axe`
        : `10k rows not supported; ${b.keyboard_passed}/${b.keyboard_total} keyboard` });
  } else if (kind === 'panels') {
    const kb = b.probe?.keyboard?.checks ?? {}, rs = b.probe?.persist?.checks ?? {};
    Object.assign(out, { model: b.model, checks_passed: b.checks_passed, checks_total: b.checks_total, hit_area_px: b.hit_area_px,
      keyboard_resize: !!kb.arrow_resizes, restores_without_jump: !!rs.no_jump_on_restore, axe_violations: b.axe_violations,
      evidence: `${b.checks_passed}/${b.checks_total} checks; ${b.hit_area_px} px grab area; keyboard resize ${kb.arrow_resizes ? 'yes' : 'no'}; ${rs.no_jump_on_restore ? 'restores without a jump' : 'jumps on restore'}` });
  }
  return out;
}

// Real captures first, our rebuild thumbnail last; benchmark sheets first for sources.
function rank(f) { return f.startsWith('bench') ? -1 : f.startsWith('desktop') ? 0 : f.startsWith('mobile') ? 1 : f.startsWith('crop') ? 2 : 3; }

const json = JSON.stringify(entries, null, 2);
writeFileSync(join(ROOT, 'catalog.json'), json + '\n');
writeFileSync(join(ROOT, 'gallery/data.js'), `// Generated by scripts/build-catalog.mjs — do not edit.\nwindow.CATALOG = ${json};\n`);

const cell = (v) => (Array.isArray(v) ? v.join(', ') : String(v ?? '')).replace(/\|/g, '\\|');
const sources = entries.filter((e) => e.kind === 'source').sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
const patterns = entries.filter((e) => e.kind === 'pattern');
const sourceRows = sources.map((e) =>
  `| [${cell(e.title)}](${e.path}/source.md) | ${cell(e.pattern)} | ${e.score ?? ''}/10 | ${cell(e.licence)} | ${cell(e.version)} | ${cell(e.use_when)} |`);
const rows = patterns.map((e) =>
  `| [${cell(e.title)}](${e.path}/entry.md) | ${cell(e.pattern)} | ${cell(e.page_type)} | ${cell(e.source_site)} | ${'★'.repeat(e.rating || 0)} | ${cell(e.tags)} | ${e.has_example ? '✓' : ''} |`);
writeFileSync(join(ROOT, 'CATALOG.md'), [
  '# Catalog',
  '',
  `${patterns.length} patterns and ${sources.length} source profiles. Generated by \`npm run catalog\` — do not edit by hand. Browse visually with \`npm run gallery\`.`,
  '',
  '## Sources',
  'Libraries and sites we have profiled and scored (`guides/source-rubric.md`).',
  '',
  '| Source | Category | Score | Licence | Version | Pick it for |',
  '|---|---|---|---|---|---|',
  ...sourceRows,
  '',
  '## Patterns',
  '',
  '| Title | Pattern | Page | Site | Rating | Tags | Example |',
  '|---|---|---|---|---|---|---|',
  ...rows,
  '',
].join('\n'));

// SOURCES.md: one comparison matrix per category, the first thing an agent reads for "which library?".
const byCat = Object.groupBy(sources, (e) => e.pattern);
const keys = Object.keys(CRITERIA);
writeFileSync(join(ROOT, 'SOURCES.md'), [
  '# Sources compared',
  '',
  'Generated by `npm run catalog` from `sources/*/source.md` and the bench results (`bench*/results.json`). Do not edit by hand.',
  'Scores are the mean of eight 1-5 criteria × 2 (`guides/source-rubric.md`). A high overall score is not the same as',
  'the best fit: read the category guide in `guides/` to match a source to the job.',
  ...Object.entries(byCat).flatMap(([cat, list]) => [
    '', `## ${cat}`, '',
    `| Source | Score | ${keys.map((k) => CRITERIA[k]).join(' | ')} | Bench tasks | Lib KB gz | Evidence | Licence |`,
    `|---|---|${keys.map(() => '---').join('|')}|---|---|---|---|`,
    ...list.map((e) => `| [${cell(e.title)}](${e.path}/source.md) | **${e.score}** | ${keys.map((k) => e[k]).join(' | ')} | ${e.bench ? `${e.bench.tasks_supported}/${e.bench.tasks_total}` : '–'} | ${e.bench ? e.bench.lib_only_gz_kb : '–'} | ${e.bench ? cell(e.bench.evidence) : '–'} | ${cell(e.licence)} |`),
    '', '**Pick it for**', '',
    ...list.map((e) => `- **${cell(e.title)}**: ${e.use_when}`),
  ]),
  '',
].join('\n'));

// The search vocabulary (guides/aliases.json) must only point at real taxonomy patterns and existing guides.
const taxonomy = new Set([...readFileSync(join(ROOT, 'taxonomy.md'), 'utf8').matchAll(/^\| ([a-z0-9-]+) \|/gm)].map((m) => m[1]));
const { concepts } = JSON.parse(readFileSync(join(ROOT, 'guides/aliases.json'), 'utf8'));
for (const [id, c] of Object.entries(concepts)) {
  const bad = c.patterns.filter((p) => !taxonomy.has(p));
  if (bad.length) throw new Error(`guides/aliases.json ${id}: patterns not in taxonomy.md: ${bad.join(', ')}`);
  if (c.guide && !existsSync(join(ROOT, c.guide))) throw new Error(`guides/aliases.json ${id}: guide ${c.guide} not found`);
}
const unmapped = [...new Set(entries.map((e) => e.pattern))].filter((p) => !Object.values(concepts).some((c) => c.patterns.includes(p)));
if (unmapped.length) console.warn(`aliases: no concept maps to pattern(s) ${unmapped.join(', ')}; add terms to guides/aliases.json`);

console.log(`catalog: ${entries.length} entries`);
