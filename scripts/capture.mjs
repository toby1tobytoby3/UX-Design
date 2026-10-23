#!/usr/bin/env node
// Capture a page (URL or local HTML file) into an entry folder.
//
//   node scripts/capture.mjs <url|file> <outDir> [--selector "<css>"] [--only desktop|mobile] [--name <basename>]
//                            [--hover "<css>"] [--click "<css>"] [--wait <ms>] [--dismiss "<css>"]
// --hover / --click open menus, panels and pickers before the screenshot (--click takes several selectors
// separated by ' || ' for multi-step flows); --dismiss clicks a cookie banner first; --viewport shoots only
// the first screen instead of the page top.
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
const hover = flag('--hover');
const click = flag('--click');
const dismiss = flag('--dismiss');
const extraWait = Number(flag('--wait') ?? 0);
const viewportOnly = args.includes('--viewport') && args.splice(args.indexOf('--viewport'), 1);
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
// CHROMIUM_PATH lets cloud images with a different Playwright browser build run captures.
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  for (const [vp, size] of Object.entries(viewports)) {
    if (only && only !== vp) continue;
    const { isMobile, deviceScaleFactor, ...viewport } = size;
    const page = await browser.newPage({ viewport, isMobile, deviceScaleFactor });
    // A slow 'networkidle' is fine (busy analytics); a failed load is not — never save an error page.
    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch((err) => {
      if (err.name === 'TimeoutError') return null;
      throw new Error(`Could not load ${url}: ${err.message.split('\n')[0]}`);
    });
    if (res && !res.ok() && !url.startsWith('file:')) throw new Error(`Could not load ${url}: HTTP ${res.status()}`);
    await page.waitForTimeout(1200 + extraWait); // let entrance animations settle
    if (dismiss) await page.locator(dismiss).first().click({ timeout: 3000 }).catch(() => {});
    // Interactions only on desktop: mobile layouts usually hide hover menus behind a toggle.
    if (vp === 'desktop' && hover) { await page.locator(hover).first().hover({ timeout: 8000 }); await page.waitForTimeout(900); }
    if (vp === 'desktop' && click) for (const step of click.split(' || ')) { await page.locator(step).first().click({ timeout: 10000 }); await page.waitForTimeout(1500); }
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
      await page.screenshot(viewportOnly ? { path: file, type: 'jpeg', quality: 80 } : {
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
