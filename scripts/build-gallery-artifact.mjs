#!/usr/bin/env node
// Bundle the gallery for publishing as a claude.ai Artifact.
//
//   node scripts/build-gallery-artifact.mjs [outDir]     (default: .artifact)
//
// Writes a self-contained folder: ux-library.html (gallery without the document
// skeleton, which the Artifact host adds), data.js, every entry image and
// preview.html, and files.json — the `files` map to publish with `root: outDir`.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const out = process.argv[2] ?? join(ROOT, '.artifact');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const page = readFileSync(join(ROOT, 'gallery/index.html'), 'utf8')
  .replace(/<!doctype html>\s*<html[^>]*>\s*<head>\s*<meta charset="utf-8">\s*<meta name="viewport"[^>]*>\s*/i, '')
  .replace('</style>\n</head>\n<body>', '</style>')
  .replace(/<\/body>\s*<\/html>\s*$/, '');
writeFileSync(join(out, 'ux-library.html'), page);

const data = readFileSync(join(ROOT, 'gallery/data.js'), 'utf8');
writeFileSync(join(out, 'data.js'), `${data}window.UX_BASE = '';\n`);

const files = { 'data.js': 'data.js' };
for (const e of JSON.parse(readFileSync(join(ROOT, 'catalog.json'), 'utf8'))) {
  // preview.html plus any scripts it loads (e.g. option.js), so previews run inside the artifact.
  const extra = e.files.includes('preview.html')
    ? e.files.filter((f) => f === 'preview.html' || f.endsWith('.js')).map((f) => `${e.path}/${f}`)
    : [];
  for (const rel of [...e.images, ...extra]) {
    mkdirSync(join(out, dirname(rel)), { recursive: true });
    copyFileSync(join(ROOT, rel), join(out, rel));
    files[rel] = rel;
  }
}
writeFileSync(join(out, 'files.json'), JSON.stringify(files, null, 2));
console.log(`gallery artifact: ${Object.keys(files).length} files in ${out}`);
