#!/usr/bin/env node
// Retrieval tests for scripts/find.mjs: the ten desktop briefs from docs/test-run-10-briefs.html plus vocabulary cases.
//   node scripts/find.test.mjs        (exit 1 on any failure)
// Each case states what must be found (expect), what must not be returned as a real hit (reject), the categories that
// must be reported as not in the library (missing) and the coverage level. The same cases are run through a naive
// substring search, the way ux-find used to search catalog.json, for comparison.
import { readFileSync } from 'node:fs';
import { find, loadLibrary } from './find.mjs';

const CASES = [
  // The ten briefs (short form of each request)
  { q: 'personal budgeting app with onboarding, spending charts and a calm dark mode', expect: ['onboarding/duolingo-one-question-flow', 'sources/recharts', 'design-tokens/radix-12-step-colour-scale'], coverage: 'partial' },
  { q: 'revenue operations dashboard with KPI tiles, filters and drill-down charts', expect: ['dashboard/stripe-home-kpi-overview', 'sources/echarts'], coverage: 'partial' },
  { q: 'trading terminal with docked panels, order book, candlestick price charts and keyboard shortcuts', expect: ['sources/lightweight-charts'], reject: ['ai-review/pierre-diffs-keep-undo-hunks', 'ai-provenance/perplexity-inline-citations-sources-panel'], missing: ['C6'] },
  { q: 'fleet logistics control room with a live map of vehicles and route exceptions', reject: ['sources/echarts', '3d/bruno-simon-drivable-portfolio'], coverage: 'partial' }, // C3 has a guide; map entries and profiles to be added to expect,
  { q: 'AI product landing page with hero, pricing and social proof', expect: ['hero/linear-dark-product-hero', 'pricing-table/notion-billing-toggle', 'social-proof/vercel-logo-wall-stats'], reject: ['sources/assistant-ui', 'ai-chat/streamdown-streaming-markdown'] },
  { q: '3D furniture configurator with fabric options and AR', expect: ['sources/react-three-fiber', 'sources/model-viewer', '3d/modelviewer-hotspot-annotations'] },
  { q: 'multiplayer whiteboard with live cursors and comments', reject: ['sources/uplot'], missing: ['D2', 'D3'], coverage: 'none' },
  { q: 'browser video editor with timeline, waveforms and keyframes', missing: ['D4'], coverage: 'none' },
  { q: 'fraud investigation network graph with thousands of nodes', missing: ['C4'] },
  { q: 'AI agent workspace with task cards, approvals and citations', expect: ['agent-activity/ai-elements-plan-tool-steps', 'ai-review/ai-elements-inline-approval-checkpoint', 'ai-provenance/perplexity-inline-citations-sources-panel'], coverage: 'partial' }, // "workspace" is the app shell (B1), not built yet
  // Vocabulary: synonyms and phrases people actually use
  { q: 'toast', expect: ['feedback/sonner-stacked-toasts'] },
  { q: 'snackbar after delete with undo', expect: ['feedback/sonner-stacked-toasts'] },
  { q: 'frosted glass panel', expect: ['design-tokens/geist-materials-elevation'] },
  { q: 'focus ring', expect: ['accessibility/govuk-two-tone-focus'], coverage: 'strong' },
  { q: 'accessible date picker', expect: ['sources/react-aria'] },
  { q: 'spring animation', expect: ['sources/motion'] },
  { q: 'page transition', expect: ['sources/native-css', 'motion/nextjs-viewtransition-photo-gallery'] },
  { q: 'chatbot that streams answers', expect: ['ai-chat/streamdown-streaming-markdown', 'sources/ai-sdk-ui'] },
  { q: 'per-hunk diff review', expect: ['ai-review/pierre-diffs-keep-undo-hunks'] },
  { q: 'AI writing assistant inside the editor', reject: ['hero/linear-dark-product-hero', 'chart/echarts-datazoom-time-series'], missing: ['D5'] },
  { q: 'collaborative cursor', reject: ['sources/uplot'], coverage: 'none' },
  { q: 'design a trading terminal', scenario: 3, missing: ['C6'] },
  { q: 'an AI agent workspace with approvals', scenario: 10 },
];

// The old way: substring search over each catalog row, every non-trivial word.
const { catalog } = loadLibrary();
function naive(q) {
  const words = q.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1);
  return catalog.map((e) => [e.id, words.filter((w) => JSON.stringify(e).toLowerCase().includes(w)).length])
    .filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

let failures = 0;
const rows = [];
for (const c of CASES) {
  const r = find(c.q, { limit: 8 });
  const returned = [...r.sources, ...r.patterns].map((x) => x.id);
  const problems = [];
  for (const id of c.expect ?? []) if (!returned.includes(id)) problems.push(`missing ${id}`);
  for (const id of c.reject ?? []) if (returned.includes(id)) problems.push(`false hit ${id}`);
  for (const id of c.missing ?? []) if (!r.missing.some((m) => m.startsWith(`${id} `))) problems.push(`gap ${id} not reported`);
  if (c.coverage && r.coverage !== c.coverage) problems.push(`coverage ${r.coverage}, want ${c.coverage}`);
  if (c.scenario && !r.scenarios.includes(`guides/scenarios.md §${c.scenario}`)) problems.push(`scenario ${c.scenario} not suggested`);
  const old = naive(c.q);
  const oldTop = old.slice(0, 16);
  rows.push({ q: c.q, ok: !problems.length, problems, returned: returned.length,
    old_returned: old.length, old_found: (c.expect ?? []).filter((id) => oldTop.includes(id)).length,
    old_false: (c.reject ?? []).filter((id) => old.includes(id)).length, expect: (c.expect ?? []).length, reject: (c.reject ?? []).length });
  if (problems.length) failures++;
}

const pad = (s, n) => String(s).padEnd(n);
console.log(`${pad('case', 62)} ${pad('new', 5)} ${pad('hits', 5)} | old: hits  expected-in-top-16  false hits`);
for (const r of rows) {
  console.log(`${pad(r.q.slice(0, 60), 62)} ${pad(r.ok ? 'pass' : 'FAIL', 5)} ${pad(r.returned, 5)} |      ${pad(r.old_returned, 5)} ${pad(`${r.old_found}/${r.expect}`, 19)} ${r.old_false}/${r.reject}`);
  for (const p of r.problems) console.log(`    - ${p}`);
}
const oldFalse = rows.reduce((n, r) => n + r.old_false, 0), rejects = rows.reduce((n, r) => n + r.reject, 0);
console.log(`\n${rows.length - failures}/${rows.length} cases pass. Old substring search: ${oldFalse}/${rejects} known false hits returned, ` +
  `${rows.reduce((n, r) => n + r.old_found, 0)}/${rows.reduce((n, r) => n + r.expect, 0)} expected items in its top 16, ` +
  `median ${rows.map((r) => r.old_returned).sort((a, b) => a - b)[Math.floor(rows.length / 2)]} of ${catalog.length} items returned per query.`);
process.exit(failures ? 1 : 0);
