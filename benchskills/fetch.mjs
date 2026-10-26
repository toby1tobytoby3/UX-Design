#!/usr/bin/env node
// Fetch every non-vendored skill at its pinned commit into .cache/ (gitignored). Reads files only; runs nothing from them.
//   node fetch.mjs
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const HERE = new URL('.', import.meta.url).pathname;
const { skills } = JSON.parse(readFileSync(join(HERE, 'skills.json'), 'utf8'));
const env = { ...process.env, GIT_TERMINAL_PROMPT: '0' };
const seen = new Set();
for (const [id, s] of Object.entries(skills)) {
  if (!s.repo || !s.root?.startsWith('.cache/')) continue;
  const name = s.root.split('/')[1];
  if (seen.has(name)) continue;
  seen.add(name);
  const dir = join(HERE, '.cache', name);
  const git = (...a) => execFileSync('git', a, { cwd: dir, env, stdio: 'pipe', encoding: 'utf8' }).trim();
  if (!existsSync(dir)) { mkdirSync(dir, { recursive: true }); git('init', '-q'); git('remote', 'add', 'origin', `https://github.com/${s.repo}.git`); }
  let head = ''; try { head = git('rev-parse', 'HEAD'); } catch {}
  if (head !== s.sha) { git('fetch', '--depth', '1', '-q', 'origin', s.sha); git('checkout', '-q', '--detach', s.sha); }
  console.log(`${id.padEnd(16)} ${s.repo}@${s.sha.slice(0, 7)} -> .cache/${name}`);
}
