#!/usr/bin/env node
// Expose every skill to Claude Code sessions in this repo through .claude/skills.
//   skills/<name>         our own skills: shipped by the ux-library plugin (the plugin root is the repo root)
//   vendor/skills/<name>  third-party skills: loaded here, never shipped by the plugin
// Idempotent: run `npm run skills:link` after adding or removing a skill.
import { readdirSync, existsSync, lstatSync, mkdirSync, symlinkSync, unlinkSync, readlinkSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, '.claude/skills');
const skillDirs = (dir) => (existsSync(dir) ? readdirSync(dir).filter((n) => existsSync(join(dir, n, 'SKILL.md'))) : []);

const wanted = new Map();
for (const base of ['skills', 'vendor/skills']) {
  for (const name of skillDirs(join(ROOT, base))) {
    if (wanted.has(name)) throw new Error(`skill name "${name}" exists in both ${wanted.get(name)} and ${base}`);
    wanted.set(name, base);
  }
}

// An older layout symlinked the whole skills/ directory; replace it with a real folder of per-skill links.
if (existsSync(OUT) && lstatSync(OUT).isSymbolicLink()) unlinkSync(OUT);
mkdirSync(OUT, { recursive: true });

for (const name of readdirSync(OUT)) {
  const p = join(OUT, name);
  if (!lstatSync(p).isSymbolicLink()) continue; // never touch real files
  if (!wanted.has(name)) { rmSync(p); console.log(`removed stale link ${name}`); }
}
const present = (p) => { try { lstatSync(p); return true; } catch { return false; } };
for (const [name, base] of wanted) {
  const p = join(OUT, name);
  const target = relative(OUT, join(ROOT, base, name));
  if (present(p)) {
    if (lstatSync(p).isSymbolicLink() && readlinkSync(p) === target) continue;
    rmSync(p, { recursive: true });
  }
  symlinkSync(target, p);
}
console.log(`skills linked: ${wanted.size} (${[...wanted.values()].filter((b) => b === 'skills').length} ours, ${[...wanted.values()].filter((b) => b !== 'skills').length} vendored)`);
