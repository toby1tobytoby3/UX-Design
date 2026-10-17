#!/usr/bin/env node
// Capture a page (URL or local HTML file) into an entry folder.
//
//   node scripts/capture.mjs <url|file> <outDir> [--selector "<css>"] [--only desktop|mobile] [--name <basename>]
//
// Writes <outDir>/desktop.jpg and mobile.jpg (or <name>.jpg with --only),
// and with --selector also source.html + styles.json for that element.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const flag = (k) => { const i = args.indexOf(k); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
const selector = flag('--selector');
const only = flag('--only');
const name = flag('--name');
const [target, outDir] = args;
if (!target || !outDir) {
  console.error('usage: capture.mjs <url|file> <outDir> [--selector css] [--only desktop|mobile] [--name base]');
  process.exit(1);
}

const url = existsSync(target) ? pathToFileURL(resolve(target)).href : target;
const viewports = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
};
const MAX_HEIGHT = 2400; // keep crops focused and the repo small

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
try {
  for (const [vp, size] of Object.entries(viewports)) {
    if (only && only !== vp) continue;
    const { isMobile, deviceScaleFactor, ...viewport } = size;
    const page = await browser.newPage({ viewport, isMobile, deviceScaleFactor });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(1200); // let entrance animations settle
    const file = `${outDir}/${name ?? vp}.jpg`;

    if (selector) {
      const el = page.locator(selector).first();
      await el.scrollIntoViewIfNeeded();
      await el.screenshot({ path: file, type: 'jpeg', quality: 80 });
      if (vp === 'desktop') {
        writeFileSync(`${outDir}/source.html`, await el.evaluate((n) => n.outerHTML));
        const styles = await el.evaluate((root) => {
          const pick = ['display', 'gap', 'padding', 'margin', 'font-family', 'font-size', 'font-weight',
            'line-height', 'letter-spacing', 'color', 'background', 'border', 'border-radius', 'box-shadow',
            'transition', 'animation'];
          const nodes = [root, ...root.querySelectorAll('*')].slice(0, 40);
          return nodes.map((n) => {
            const cs = getComputedStyle(n);
            return { tag: n.tagName.toLowerCase(), class: n.className?.toString?.() ?? '',
              styles: Object.fromEntries(pick.map((p) => [p, cs.getPropertyValue(p)]).filter(([, v]) => v && v !== 'none' && v !== 'normal')) };
          });
        });
        writeFileSync(`${outDir}/styles.json`, JSON.stringify(styles, null, 2));
      }
    } else {
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.screenshot({
        path: file, type: 'jpeg', quality: 80, fullPage: true,
        clip: { x: 0, y: 0, width: viewport.width, height: Math.min(height, MAX_HEIGHT) },
      });
    }
    console.log(`wrote ${file}`);
    await page.close();
  }
} finally {
  await browser.close();
}
