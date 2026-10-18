// Bundle one kit (or the React baseline) for the benchmark: ESM with code splitting, so `initial` is what loads up front
// and `lazy` is split-off chunks. Shared by run.mjs; `node build.mjs <lib>` builds one kit for manual inspection.
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, basename } from 'node:path';

const HERE = new URL('.', import.meta.url).pathname;
const NM = join(HERE, 'node_modules');
const kb = (bytes) => Math.round(bytes / 102.4) / 10;

// The Plate registry imports "@/registry/…", "@/components/ui/…" and "@/lib/utils" (shadcn project aliases).
const registryAliases = {
  name: 'registry-aliases',
  setup(b) {
    b.onResolve({ filter: /^@\/(registry|components|lib)\// }, async (args) => {
      const rel = args.path.slice(2);
      const base = rel.startsWith('registry/') ? join(HERE, 'libs/plate', rel) : join(HERE, 'libs/plate/shims', rel);
      for (const ext of ['', '.tsx', '.ts', '.jsx', '.js']) if (existsSync(base + ext) && !base.endsWith('/')) return { path: base + ext };
      return { errors: [{ text: `registry alias not found: ${args.path}` }] };
    });
    b.onResolve({ filter: /^@faker-js\/faker$/ }, () => ({ path: join(HERE, 'libs/plate/shims/faker.js') }));
  },
};

export async function bundle(name, entry) {
  const outdir = join(HERE, 'dist', name);
  rmSync(outdir, { recursive: true, force: true });
  const { metafile } = await build({ entryPoints: { [name]: entry }, bundle: true, minify: true, format: 'esm', splitting: true,
    outdir, metafile: true, jsx: 'automatic', logLevel: 'error', define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [registryAliases], conditions: ['style'],
    loader: { '.woff': 'file', '.woff2': 'file', '.ttf': 'file', '.svg': 'file', '.png': 'file' } });
  const outs = metafile.outputs;
  const gz = (f) => gzipSync(readFileSync(join(HERE, f))).length;
  const entryOut = Object.keys(outs).find((f) => basename(f) === `${name}.js`);
  const initial = new Set();
  (function walk(f) { if (initial.has(f)) return; initial.add(f); outs[f].imports.filter((i) => i.kind === 'import-statement').forEach((i) => walk(i.path)); })(entryOut);
  const js = Object.keys(outs).filter((f) => f.endsWith('.js'));
  const css = Object.keys(outs).filter((f) => f.endsWith('.css'));
  if (!css.length) writeFileSync(join(outdir, `${name}.css`), '');
  // Tailwind compile for kits whose UI is Tailwind classes (libs/<name>.css); counted as CSS, not JS.
  const tw = join(HERE, 'libs', `${name}.css`), twOut = join(outdir, `${name}.tw.css`);
  if (existsSync(tw)) execFileSync(join(NM, '.bin/tailwindcss'), ['-i', tw, '-o', twOut, '--minify'], { cwd: join(HERE, 'libs'), stdio: 'pipe' });
  else writeFileSync(twOut, '');
  writeFileSync(join(outdir, 'index.html'), readFileSync(join(HERE, 'page.html'), 'utf8').replaceAll('LIB', name));
  return { initial: kb([...initial].reduce((s, f) => s + gz(f), 0)), lazy: kb(js.filter((f) => !initial.has(f)).reduce((s, f) => s + gz(f), 0)),
    css: kb(css.reduce((s, f) => s + gz(f), 0) + gzipSync(readFileSync(twOut)).length) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(join(HERE, 'dist'), { recursive: true });
  for (const lib of process.argv.slice(2)) console.log(lib, await bundle(lib, join(HERE, 'libs', `${lib}.jsx`)));
}
