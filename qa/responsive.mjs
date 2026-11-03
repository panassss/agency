// Responsive layout: no horizontal scroll from 320 to 1920 px, burger menu on mobile/tablet.
import { assert, suite, WEB } from './lib.mjs';
import { openBrowser, scrollThrough } from './browser.mjs';

const { check, save } = suite('responsive');
const { browser, page, shot } = await openBrowser({ width: 375, height: 800 });
const WIDTHS = [320, 375, 768, 1024, 1280, 1440, 1920];
const slug = (await (await fetch(WEB.replace(':3000', ':4000') + '/api/projects?limit=1').then((r) => r)).json()).items[0].slug;
const PAGES = ['/', '/about', '/projects', `/projects/${slug}`, '/contact', '/login', '/register'];

for (const width of WIDTHS) {
  await check(`Ширина ${width} px: немає горизонтальної прокрутки на ${PAGES.length} сторінках`, async () => {
    await page.setViewportSize({ width, height: 900 });
    const bad = [];
    for (const path of PAGES) {
      await page.goto(WEB + path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      if (sw > width) bad.push(`${path}: ${sw}px`);
    }
    assert(bad.length === 0, bad.join(', '));
  });
}

for (const [width, name] of [[375, 'mobile'], [820, 'tablet']]) {
  await check(`Бургер-меню (${width} px): відкривається на весь екран, веде на сторінку і закривається`, async () => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(WEB + '/', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Відкрити меню' }).click();
    await page.waitForTimeout(400);
    const box = await page.locator('#mobile-menu').boundingBox();
    assert(box.height > 600, `висота меню ${box.height}`);
    await shot(`menu-${name}`);
    await page.locator('#mobile-menu').getByRole('link', { name: 'Портфоліо' }).click();
    await page.waitForURL('**/projects');
    await page.waitForTimeout(400);
    assert((await page.locator('#mobile-menu').evaluate((el) => getComputedStyle(el).visibility)) === 'hidden', 'меню не закрилося');
  });
}

await check('Мобільні скріншоти основних сторінок (375 px)', async () => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const [path, name] of [['/', 'home'], ['/about', 'about'], ['/projects', 'projects'], ['/contact', 'contact']]) {
    await page.goto(WEB + path, { waitUntil: 'networkidle' });
    await scrollThrough(page);
    await shot(`mobile-${name}`, { fullPage: true });
  }
});
await check('Десктоп-скріншоти сторінок (1440 px)', async () => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [path, name] of [['/about', 'about'], ['/projects', 'projects'], ['/contact', 'contact']]) {
    await page.goto(WEB + path, { waitUntil: 'networkidle' });
    await scrollThrough(page);
    await shot(`desktop-${name}`, { fullPage: true });
  }
});

await browser.close();
process.exitCode = save({ widths: WIDTHS, pages: PAGES });
