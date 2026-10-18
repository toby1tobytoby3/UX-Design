#!/usr/bin/env node
// Search the library the way ux-find should: whole words and phrases, the team's vocabulary (guides/aliases.json),
// and an honest coverage line before any results.
//   node scripts/find.mjs "a trading terminal with docked panels and an order book" [--json] [--limit 8]
// Prints: coverage (strong / partial / none), the concepts the request maps to (guide, category status from
// research/categories.md), then ranked sources and patterns. Hits that only match in body text are listed
// separately as weak: they are often false friends ("cursor" in a chart crosshair is not a collaboration cursor).
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const STOP = new Set(`a an the and or of to in on for with without by from at as is are be been it its this that these those
  i we you our your me my us they them their need needs want wants build building make making create like good great best
  better show find how what which should would could can use using used some new web site app apps page pages screen screens
  design designs ui ux look looks feel kind type sort something thing things want please help into about more most very
  really just also get got one two three lot lots way ways do does make sure let lets around over under up down out
  inside within across between behind beside near after before while when where there here all any each every other
  same such only own than then so too not no has have had was were will may might must should them its via per`.split(/\s+/));

// Tokens keep internal dots and hyphens ("deck.gl", "three.js", "real-time") so tool names survive.
const tokenize = (s) => s.toLowerCase().replace(/[’']/g, '').split(/[^a-z0-9.#+-]+/).map((t) => t.replace(/^[.-]+|[.-]+$/g, '')).filter(Boolean);
const stem = (t) => (t.length > 3 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t);
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Whole-word (or whole-phrase) match, tolerant of a plural s.
const wordRe = (phrase) => new RegExp(`(^|[^a-z0-9])${phrase.split(' ').map((w) => escape(stem(w))).join('[\\s-]+')}s?($|[^a-z0-9])`, 'i');

export function loadLibrary() {
  const catalog = JSON.parse(readFileSync(join(ROOT, 'catalog.json'), 'utf8'));
  const { concepts, scenarios = {} } = JSON.parse(readFileSync(join(ROOT, 'guides/aliases.json'), 'utf8'));
  // Category status and priority come from the research map, so the coverage line stays current.
  const rows = readFileSync(join(ROOT, 'research/categories.md'), 'utf8').split('\n').filter((l) => /^\| [A-F]\d+ \|/.test(l));
  const categories = Object.fromEntries(rows.map((l) => {
    const c = l.split('|').map((x) => x.trim());
    return [c[1], { name: c[2], status: c[4].split(' ')[0], priority: c[5] }];
  }));
  return { catalog, concepts, scenarios, categories, shortlist: loadShortlist() };
}

// The team's catalogue (research/catalogue/) gives a vetted starting point for categories the library hasn't built:
// licence- and maintenance-checked tools plus one reference moment, so explore mode doesn't start from scratch.
function loadShortlist() {
  const dir = join(ROOT, 'research/catalogue');
  if (!existsSync(join(dir, 'categories.csv'))) return {};
  const rows = (f) => parseCsv(readFileSync(join(dir, f), 'utf8'));
  const out = {};
  for (const r of rows('categories.csv')) out[r.ID] = { tools: r['Curated tools (3-6)'], references: [] };
  for (const r of rows('references.csv')) out[r['Category ID']]?.references.push({ url: r['Reference URL'], moment: r['Specific screen or moment'] });
  return out;
}
function parseCsv(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch; }
    else if (ch === '"') q = true; else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; } else if (ch !== '\r') cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

// Greedy longest-phrase match of the query against every concept term.
function matchConcepts(tokens, concepts) {
  const phrases = [];
  for (const [id, c] of Object.entries(concepts)) {
    for (const t of c.terms ?? []) phrases.push({ id, words: tokenize(t).map(stem), weak: false, term: t });
    for (const t of c.weak_terms ?? []) phrases.push({ id, words: tokenize(t).map(stem), weak: true, term: t });
  }
  phrases.sort((a, b) => b.words.length - a.words.length);
  const hits = [], free = [];
  for (let i = 0; i < tokens.length;) {
    const matches = [];
    for (const p of phrases) {
      if (matches.length && p.words.length < matches[0].words.length) break;
      if (p.words.every((w, k) => stem(tokens[i + k] ?? '') === w)) matches.push(p);
    }
    if (matches.length) { hits.push(...matches); i += matches[0].words.length; continue; }
    if (!STOP.has(tokens[i]) && tokens[i].length > 1) free.push(tokens[i]);
    i++;
  }
  const strong = hits.filter((h) => !h.weak);
  const used = strong.length ? strong : hits;
  const byConcept = {};
  for (const h of used) (byConcept[h.id] ??= new Set()).add(h.term);
  return { byConcept, free };
}

export function find(query, { limit = 8 } = {}) {
  const { catalog, concepts, scenarios, categories, shortlist } = loadLibrary();
  const { byConcept, free } = matchConcepts(tokenize(query), concepts);
  const conceptIds = Object.keys(byConcept);
  const patterns = new Set(conceptIds.flatMap((id) => concepts[id].patterns));
  // Concept terms and leftover words are scored differently. An entry in a matched concept's pattern is strong. Outside
  // those patterns, one concept term in a strong field is often an accident ("panel" in a diff viewer's title), so it
  // counts as strong only when two such hits agree and the concept is built. Leftover words (not in any concept) are
  // strong only in the title or tags, or when two of them match.
  const built = (id) => catalog.some((e) => concepts[id].patterns.includes(e.pattern));
  const conceptTerms = conceptIds.flatMap((id) => [...byConcept[id]].map((t) => [t, wordRe(t), built(id)]));
  const freeTerms = [...new Set(free)].map((t) => [t, wordRe(t)]);
  const fields = [['title', 3], ['tags', 2], ['source_site', 2], ['why_it_works', 1.5], ['use_when', 1.5]];
  const fieldHit = (e, re) => fields.find(([f]) => re.test(Array.isArray(e[f]) ? e[f].join(' ') : String(e[f] ?? '')));

  const scored = catalog.map((e) => {
    let score = 0, strongField = false, freeHits = 0, freeTitle = false;
    const conceptHits = new Set(); // distinct stems, so "panel" and "panels" count once
    const why = [];
    if (patterns.has(e.pattern)) { score += e.kind === 'source' ? 7 : 6; why.push(`pattern ${e.pattern}`); strongField = true; }
    for (const [t, re, built] of conceptTerms) {
      const f = fieldHit(e, re);
      if (f) { score += f[1]; why.push(`${t} in ${f[0]}`); if (built) conceptHits.add(tokenize(t).map(stem).join(' ')); }
      else if (re.test(e.body ?? '')) { score += 0.5; why.push(`${t} in body`); }
    }
    for (const [t, re] of freeTerms) {
      const f = fieldHit(e, re);
      if (f) { score += f[1] * 0.75; why.push(`${t} in ${f[0]}`); freeHits++; if (f[0] === 'title' || f[0] === 'tags') freeTitle = true; }
      else if (re.test(e.body ?? '')) { score += 0.3; why.push(`${t} in body`); }
    }
    if (freeTitle || freeHits >= 2 || conceptHits.size >= 2) strongField = true;
    score += (e.rating ?? (e.score ?? 0) / 2) / 10; // tie-break on quality
    return { e, score: Math.round(score * 10) / 10, strongField, why };
  }).filter((s) => s.score >= 1);

  const strongHits = scored.filter((s) => s.strongField).sort((a, b) => b.score - a.score);
  const weakHits = scored.filter((s) => !s.strongField).sort((a, b) => b.score - a.score);
  const present = (id) => catalog.filter((e) => concepts[id].patterns.includes(e.pattern));

  const conceptReport = conceptIds.map((id) => {
    const c = concepts[id], cat = categories[id] ?? {};
    const sources = present(id).filter((e) => e.kind === 'source').length;
    const pats = present(id).filter((e) => e.kind === 'pattern').length;
    const guide = c.guide && existsSync(join(ROOT, c.guide)) ? c.guide : null;
    const level = guide && (sources || pats >= 2) ? 'strong' : guide || pats ? 'partial' : 'none';
    return { id, name: cat.name ?? id, matched: [...byConcept[id]], guide, sources, patterns: pats, level, status: cat.status, priority: cat.priority };
  });

  let coverage;
  if (conceptReport.length) {
    const levels = conceptReport.map((c) => c.level);
    coverage = levels.every((l) => l === 'strong') ? 'strong' : levels.some((l) => l !== 'none') ? 'partial' : 'none';
  } else coverage = strongHits.length >= 2 ? 'partial' : strongHits.length ? 'partial' : 'none';

  return {
    query, coverage, concepts: conceptReport, free_terms: free,
    sources: strongHits.filter((s) => s.e.kind === 'source').slice(0, limit).map(brief),
    patterns: strongHits.filter((s) => s.e.kind === 'pattern').slice(0, limit).map(brief),
    weak: weakHits.slice(0, 5).map(brief),
    missing: conceptReport.filter((c) => c.level === 'none').map((c) => `${c.id} ${c.name} (${c.priority ?? 'unprioritised'})`),
    // Whole-brief hint: a scenario phrase points at guides/scenarios.md without taking words from the concepts.
    scenarios: Object.entries(scenarios).filter(([, terms]) => terms.some((t) => wordRe(t).test(query))).map(([n]) => `guides/scenarios.md §${n}`),
    shortlist: Object.fromEntries(conceptReport.filter((c) => c.level !== 'strong' && shortlist[c.id]?.tools)
      .map((c) => [c.id, { tools: shortlist[c.id].tools, reference: shortlist[c.id].references[0] ?? null }])),
  };
}
const brief = (s) => ({ id: s.e.id, kind: s.e.kind, title: s.e.title, pattern: s.e.pattern, score: s.score,
  ...(s.e.kind === 'source' ? { source_score: s.e.score } : { rating: s.e.rating }), path: s.e.path, why: s.why.slice(0, 3) });

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const li = args.indexOf('--limit');
  const limit = li >= 0 ? Number(args[li + 1]) : 8;
  const query = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--limit').join(' ');
  if (!query) { console.error('usage: find.mjs "<request>" [--json] [--limit n]'); process.exit(1); }
  const r = find(query, { limit });
  if (json) { console.log(JSON.stringify(r, null, 2)); process.exit(0); }
  const covered = r.concepts.filter((c) => c.level !== 'none').map((c) => `${c.name}${c.guide ? ` (${c.guide})` : ''}`);
  console.log(`Library coverage: ${r.coverage}${covered.length ? ` — covered: ${covered.join('; ')}` : ''}${r.missing.length ? ` — not in library yet: ${r.missing.join('; ')} → explore` : ''}`);
  for (const c of r.concepts) console.log(`  ${c.id.padEnd(4)} ${c.name.padEnd(36)} ${c.level.padEnd(7)} guide: ${c.guide ?? '–'} · sources ${c.sources} · patterns ${c.patterns} · matched "${c.matched.join('", "')}"`);
  if (r.free_terms.length) console.log(`  other terms searched: ${r.free_terms.join(', ')}`);
  if (r.scenarios.length) console.log(`  whole brief? starting stack in ${r.scenarios.join(', ')}`);
  const sl = Object.entries(r.shortlist);
  if (sl.length) {
    console.log('\nStart exploring from the team catalogue (research/catalogue/, licence and maintenance checked; not benchmarked)');
    for (const [id, x] of sl) console.log(`  ${id}: ${x.tools}${x.reference ? `\n      see ${x.reference.url} (${x.reference.moment.slice(0, 90)})` : ''}`);
  }
  if (r.sources.length) { console.log('\nSources'); for (const s of r.sources) console.log(`  ${s.source_score}/10  ${s.title}  (${s.path})`); }
  if (r.patterns.length) { console.log('\nPatterns'); for (const p of r.patterns) console.log(`  ${'★'.repeat(p.rating ?? 0).padEnd(5)} ${p.title}  (${p.path})`); }
  if (r.weak.length) { console.log('\nWeak (incidental matches; check before using)'); for (const w of r.weak) console.log(`  ${w.title}  (${w.path}): ${w.why.join(', ')}`); }
}
