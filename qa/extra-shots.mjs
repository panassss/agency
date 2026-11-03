// Extra screenshots for the reports: Swagger UI and raw API responses.
import { API } from './lib.mjs';
import { openBrowser } from './browser.mjs';

const { browser, page, shot } = await openBrowser({ width: 1280, height: 900 });
await page.goto(`${API}/docs`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await shot('swagger', { fullPage: true });
await page.goto(`${API}/projects?limit=2&sort=title`, { waitUntil: 'networkidle' });
await shot('api-json');
await page.goto(`${API}/projects?sort=random`, { waitUntil: 'networkidle' });
await shot('api-400');
await browser.close();
console.log('ok');
