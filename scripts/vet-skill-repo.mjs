#!/usr/bin/env node
// Triage an agent-skill repo before anyone installs, vendors or scores it. Clones shallowly into a fresh scratch
// folder and reads files; it never runs, installs or imports anything from the repo.
//   node scripts/vet-skill-repo.mjs <owner/repo | git-url> [--json] [--keep]
// The report is triage, not proof: a clean result means "nothing obvious", so still read the skill you intend to use.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, statSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, extname, basename } from 'node:path';

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith('--'));
if (!target) { console.error('usage: vet-skill-repo.mjs <owner/repo | git-url> [--json] [--keep]'); process.exit(2); }
const url = /^[\w.-]+\/[\w.-]+$/.test(target) ? `https://github.com/${target}.git` : target;

const scratch = mkdtempSync(join(tmpdir(), 'vet-'));
const dir = join(scratch, 'repo');
const git = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8', env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } }).trim();
execFileSync('git', ['clone', '--depth', '1', '--quiet', url, dir], { env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }, stdio: 'pipe' });

const CODE = new Set(['.js', '.mjs', '.cjs', '.ts', '.py', '.sh', '.bash', '.rb', '.ps1']);
const SKIP = new Set(['.git', 'node_modules']);
const files = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    if (SKIP.has(n)) continue;
    const p = join(d, n);
    const st = statSync(p);
    if (st.isDirectory()) walk(p); else files.push({ p, rel: relative(dir, p), size: st.size });
  }
})(dir);

// Frontmatter of every SKILL.md: the fields that decide how a skill can act.
const skills = files.filter((f) => basename(f.rel) === 'SKILL.md').map((f) => {
  const text = readFileSync(f.p, 'utf8');
  const fm = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const field = (k) => fm.match(new RegExp(`^${k}:\\s*(.*)$`, 'm'))?.[1]?.trim();
  return { path: f.rel, lines: text.split('\n').length, name: field('name'), tools: /allowed-tools/.test(fm) ? (fm.split('allowed-tools:')[1] ?? '').split('\n').slice(0, 8).join(' ').replace(/\s+/g, ' ').trim().slice(0, 120) : null,
    user_only: /disable-model-invocation:\s*true/.test(fm) };
});

// Patterns worth a human look. Docs (.md) are checked only for pipe-to-shell, since that is what an agent might run.
const RISKS = [
  ['pipe-to-shell', /(curl|wget)[^\n|]*\|\s*(sudo\s+)?(ba)?sh\b/, true],
  ['base64-decode', /base64\s+(-d|--decode)|atob\(|b64decode/, false],
  ['dynamic-eval', /\beval\(|new Function\(|\bexec\(\s*['"`]/, false],
  ['spawns-process', /child_process|\bspawn(Sync)?\(|subprocess\.|os\.system|\bexecSync\(/, false],
  ['network-call', /\bfetch\(|https?\.(get|request)\(|requests\.(get|post)|urllib\.request|XMLHttpRequest|sendBeacon/, false],
  ['reads-secrets', /process\.env\.[A-Z_]*(KEY|TOKEN|SECRET|PASSWORD)|os\.environ\[?['"(][A-Z_]*(KEY|TOKEN|SECRET)/, false],
  ['destructive-rm', /rm\s+-rf?\s+(~|\/|\$HOME|\$\{?HOME)/, false],
  ['writes-agent-config', /(~|\$HOME|homedir\(\))[\/'"` ,]+\.(claude|codex|cursor|ssh|aws|npmrc|gitconfig)/, false],
];
const hits = Object.fromEntries(RISKS.map(([k]) => [k, []]));
for (const f of files) {
  if (f.size > 400_000) continue;
  const isCode = CODE.has(extname(f.rel)) || /(^|\/)(package\.json|hooks\.json|plugin\.json|settings.*\.json)$/.test(f.rel);
  const isDoc = extname(f.rel) === '.md';
  if (!isCode && !isDoc) continue;
  if (/(^|\/)(test|tests|__tests__|fixtures|docs|examples|website|site)\//.test(f.rel) && !isDoc) continue;
  const text = readFileSync(f.p, 'utf8');
  for (const [k, re, docToo] of RISKS) {
    if (isDoc && !docToo) continue;
    text.split('\n').forEach((line, i) => { if (re.test(line) && hits[k].length < 5) hits[k].push(`${f.rel}:${i + 1}`); });
  }
}
// Install-time and session-time execution: lifecycle scripts and hooks.
const lifecycle = [];
for (const f of files.filter((x) => basename(x.rel) === 'package.json')) {
  const s = JSON.parse(readFileSync(f.p, 'utf8')).scripts ?? {};
  for (const k of ['preinstall', 'install', 'postinstall', 'prepare']) if (s[k]) lifecycle.push(`${f.rel}: ${k}: ${s[k]}`);
}
const hookFiles = files.filter((f) => /(^|\/)hooks(\/hooks)?\.json$/.test(f.rel) || /(^|\/)settings(\.local)?\.json$/.test(f.rel)).map((f) => f.rel);

const licenceFile = files.find((f) => /^licen[cs]e(\.\w+)?$/i.test(basename(f.rel)) && !f.rel.includes('/'));
const licenceText = licenceFile ? readFileSync(licenceFile.p, 'utf8') : '';
const licence = !licenceFile ? 'none found' : /Apache License/.test(licenceText) ? 'Apache-2.0' : /MIT License|Permission is hereby granted, free of charge/.test(licenceText) ? 'MIT'
  : /GNU (AFFERO )?GENERAL PUBLIC/i.test(licenceText) ? 'GPL/AGPL' : licenceText.split('\n').find(Boolean)?.trim().slice(0, 60);
const lastCommit = git('log', '-1', '--format=%h|%cs|%cI').split('|');
const months = Math.round((Date.now() - new Date(lastCommit[2])) / (30.4 * 86400e3) * 10) / 10;
const bytes = files.reduce((n, f) => n + f.size, 0);
const codeFiles = files.filter((f) => CODE.has(extname(f.rel)));
const flagged = Object.entries(hits).filter(([, v]) => v.length);

const report = { repo: url.replace(/\.git$/, ''), commit: lastCommit[0], commit_date: lastCommit[1], months_since_commit: months, licence,
  files: files.length, size_mb: Math.round(bytes / 1e5) / 10, skills, code_files: codeFiles.length, lifecycle_scripts: lifecycle, hook_files: hookFiles,
  flags: Object.fromEntries(flagged) };
if (!args.includes('--keep')) rmSync(scratch, { recursive: true, force: true }); else report.kept_at = dir;

if (args.includes('--json')) { console.log(JSON.stringify(report, null, 2)); process.exit(0); }
console.log(`# ${report.repo}\n`);
console.log(`Commit ${report.commit} (${report.commit_date}, ${months} months ago) · licence ${licence} · ${report.files} files, ${report.size_mb} MB · ${codeFiles.length} code files`);
console.log(`\nSkills (${skills.length})`);
for (const s of skills.slice(0, 40)) console.log(`- ${s.path} (${s.lines} lines)${s.user_only ? ' [user-invoked only]' : ''}${s.tools ? ` tools: ${s.tools}` : ''}`);
console.log(`\nLifecycle scripts: ${lifecycle.length ? '\n' + lifecycle.map((l) => `- ${l}`).join('\n') : 'none'}`);
console.log(`Hook / settings files: ${hookFiles.length ? hookFiles.join(', ') : 'none'}`);
console.log(`\nFlags (read these lines before trusting the repo)`);
console.log(flagged.length ? flagged.map(([k, v]) => `- ${k}: ${v.join(', ')}`).join('\n') : '- none');
if (args.includes('--keep')) console.log(`\nKept at ${dir} (read-only inspection; delete when done)`);
