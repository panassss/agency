import { chromium } from 'playwright-core';
import { ART } from './lib.mjs';

/** Launches the locally installed Google Chrome and records console problems per page. */
export async function openBrowser({ width = 1440, height = 900 } = {}) {
  const browser = await chromium.launch({ channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width, height }, locale: 'uk-UA' });
  const page = await context.newPage();
  const consoleProblems = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && !/ERR_ABORTED|status of (401|404|409)/.test(m.text())) consoleProblems.push(m.text().slice(0, 200));
  });
  page.on('pageerror', (e) => consoleProblems.push(`JS error: ${e.message}`));
  const shot = (name, options = {}) => page.screenshot({ path: `${ART}${name}.png`, ...options });
  return { browser, context, page, consoleProblems, shot };
}

/** Clicks the centre of an element with the mouse (cards use a stretched link overlay). */
export async function clickCenter(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const box = await locator.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

export async function scrollThrough(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(1200);
}
