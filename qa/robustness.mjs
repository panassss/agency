// Content robustness and error handling: long texts, missing/broken images, empty results,
// slow responses (loading state) and failed API requests (error state + retry).
import { API, ADMIN, ART, assert, suite, WEB } from './lib.mjs';
import { clickCenter, openBrowser } from './browser.mjs';

const { check, save } = suite('robustness');
const { browser, page, shot } = await openBrowser();
const go = (path) => page.goto(WEB + path, { waitUntil: 'networkidle' });
const noOverflow = async () => {
  const [sw, w] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  assert(sw <= w, `горизонтальна прокрутка: ${sw} > ${w}`);
};

const token = (await (await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ADMIN) })).json()).token;
const LONG = 'Комплексна-трансформація-бізнес-процесів-регіонального-дистриб’ютора-будівельних-матеріалів';
const created = await (await fetch(`${API}/projects`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    title: LONG.slice(0, 118),
    subtitle: 'Дуже довгий підзаголовок, який перевіряє перенесення рядків і не повинен ламати сітку карток портфоліо навіть на вузьких екранах телефонів',
    serviceId: 1,
    client: 'Товариство з обмеженою відповідальністю «Найдовша назва клієнта в історії агенції»',
    location: 'Івано-Франківська область, Тлумацький район, село Нижнів',
    date: '2026-10-01T00:00:00.000Z',
    coverImage: '/img/projects/does-not-exist.webp',
    gallery: ['/img/projects/missing-1.webp', 'https://example.invalid/broken.webp'],
    challenge: 'Текст '.repeat(200).trim(),
    solution: 'Рядок перший\nРядок другий\nРядок третій',
    result: 'Безпробільнийрядок'.repeat(20),
  }),
})).json();

try {
  await check('Довгі тексти й бите зображення в картці портфоліо: без переповнення, показано заглушку', async () => {
    await go('/projects?sort=newest');
    const card = page.locator('main article', { hasText: LONG.slice(0, 30) });
    await card.waitFor();
    await page.waitForTimeout(1500);
    const src = await card.locator('img').getAttribute('src');
    assert(src.includes('placeholder'), `зображення не замінене заглушкою: ${src}`);
    await noOverflow();
    await card.scrollIntoViewIfNeeded();
    await shot('robust-long-card', { clip: { ...(await card.boundingBox()), y: (await card.boundingBox()).y } });
  });
  await check('Довгі тексти на сторінці кейсу: перенесення без горизонтальної прокрутки (1440 і 375 px)', async () => {
    await clickCenter(page, page.locator('main article', { hasText: LONG.slice(0, 30) }));
    await page.waitForURL(/\/projects\/.+/);
    await page.getByText('01. Завдання').waitFor();
    await noOverflow();
    await page.setViewportSize({ width: 375, height: 800 });
    await page.waitForTimeout(500);
    await noOverflow();
    await shot('robust-long-detail-mobile');
    await page.setViewportSize({ width: 1440, height: 900 });
  });
} finally {
  await fetch(`${API}/projects/${created.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
}

await check('Порожній результат: повідомлення «нічого не знайдено» і кнопка скидання', async () => {
  await go('/projects?search=zzzzzz');
  await page.getByText('За вашим запитом нічого не знайдено.').waitFor();
  await page.getByRole('button', { name: 'Скинути фільтри' }).waitFor();
});
await check('Один результат і багато результатів (пагінація «Показати ще»)', async () => {
  await go('/projects?search=FinTrack');
  await page.getByText('Знайдено проєктів: 1').waitFor();
  await go('/projects');
  await page.getByRole('button', { name: 'Показати ще' }).waitFor();
});

await check('Повільна відповідь API: показуються скелетони завантаження', async () => {
  await page.route('**/api/projects?*', async (route) => {
    await new Promise((r) => setTimeout(r, 2500));
    await route.continue().catch(() => {});
  });
  await page.goto(WEB + '/projects');
  await page.waitForTimeout(800);
  const skeletons = await page.locator('[aria-hidden=true][class*=skeleton]').count();
  assert(skeletons > 0, 'скелетонів немає');
  await shot('robust-loading');
  await page.unroute('**/api/projects?*');
  return `${skeletons} скелетони`;
});
await check('Помилка API (500) на головній: повідомлення і кнопка «Спробувати ще раз»', async () => {
  await page.route('**/api/services', (route) => route.fulfill({ status: 500, contentType: 'application/json', body: '{"statusCode":500,"message":"Внутрішня помилка сервера"}' }));
  await go('/');
  const section = page.locator('section[aria-labelledby=services-title]');
  await section.getByRole('alert').waitFor();
  await section.scrollIntoViewIfNeeded();
  await section.screenshot({ path: `${ART}robust-api-error.png` });
  await page.unroute('**/api/services');
  await section.getByRole('button', { name: 'Спробувати ще раз' }).click();
  await section.locator('article').first().waitFor();
  return 'після повтору дані завантажено';
});
await check('Сервер недоступний (мережева помилка): зрозуміле повідомлення в портфоліо', async () => {
  await page.route('**/api/projects?*', (route) => route.abort('connectionrefused'));
  await go('/projects');
  const alert = page.getByRole('alert').first();
  await alert.waitFor();
  const text = await alert.innerText();
  await page.unroute('**/api/projects?*');
  return text.split('\n')[0];
});
await check('Помилка при збереженні заявки: форма показує повідомлення, дані не втрачаються', async () => {
  await page.route('**/api/requests', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: '{"statusCode":503,"message":"Сервіс тимчасово недоступний"}' }));
  await go('/contact');
  await page.getByLabel(/^Імʼя/).fill('Петро');
  await page.getByLabel(/^Прізвище/).fill('Мороз');
  await page.getByLabel(/^Email \*/).fill('petro@example.com');
  await page.getByLabel(/^Телефон/).fill('+380501112244');
  await page.getByLabel(/^Повідомлення/).fill('Перевірка обробки помилки сервера.');
  await page.getByRole('button', { name: 'Надіслати заявку' }).click();
  await page.getByText('Сервіс тимчасово недоступний').waitFor();
  assert((await page.getByLabel(/^Імʼя/).inputValue()) === 'Петро', 'дані форми втрачено');
  await page.locator('form').first().screenshot({ path: `${ART}robust-submit-error.png` });
  await page.unroute('**/api/requests');
});
await check('Неіснуючий кейс: повідомлення «не знайдено» замість падіння сторінки', async () => {
  await go('/projects/neisnuiuchyi-keis');
  const alert = page.locator('main').getByRole('alert');
  await alert.waitFor();
  await page.locator('main').screenshot({ path: `${ART}robust-not-found-project.png` });
  return (await alert.innerText()).split('\n')[0];
});

await browser.close();
process.exitCode = save();
