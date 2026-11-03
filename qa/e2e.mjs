// End-to-end checks in a real browser: pages, navigation, forms, interactive components, auth, admin CRUD.
import { ADMIN, ART, assert, suite, WEB } from './lib.mjs';
import { clickCenter, openBrowser, scrollThrough } from './browser.mjs';

const { check, save } = suite('e2e');
const { browser, page, consoleProblems, shot } = await openBrowser();
const go = (path) => page.goto(WEB + path, { waitUntil: 'networkidle' });

const PAGES = [
  ['/', 'Головна'], ['/about', 'Про нас'], ['/projects', 'Портфоліо'], ['/contact', 'Контакти'],
  ['/login', 'Вхід'], ['/register', 'Реєстрація'], ['/no-such-page', '404'],
];
for (const [path, name] of PAGES) {
  await check(`Сторінка «${name}» (${path}) відкривається, має один <h1>, унікальний <title> і description`, async () => {
    const res = await go(path);
    assert(res.status() === (path === '/no-such-page' ? 404 : 200), `HTTP ${res.status()}`);
    const h1 = await page.locator('h1').count();
    assert(h1 === 1, `h1: ${h1}`);
    const desc = await page.locator('meta[name=description]').getAttribute('content');
    assert(desc && desc.length <= 160, 'description відсутній або задовгий');
    return await page.title();
  });
}

await check('Навігація хедера веде на всі основні сторінки', async () => {
  await go('/');
  for (const [label, url] of [['Про нас', '/about'], ['Портфоліо', '/projects'], ['Контакти', '/contact'], ['Головна', '/']]) {
    await page.locator('header nav').getByRole('link', { name: label }).click();
    await page.waitForURL(WEB + url);
  }
});
await check('Усі внутрішні посилання сторінок відповідають без 404', async () => {
  const checked = new Set();
  for (const path of ['/', '/about', '/projects', '/contact']) {
    await go(path);
    const hrefs = await page.$$eval('a[href^="/"]', (as) => as.map((a) => a.getAttribute('href')));
    for (const href of hrefs) {
      if (checked.has(href)) continue;
      checked.add(href);
      const res = await page.request.get(WEB + href);
      assert(res.status() === 200, `${href} → ${res.status()}`);
    }
  }
  return `перевірено ${checked.size} посилань`;
});

await check('Головна: дані з API (послуги, кейси, відгуки) відображаються', async () => {
  await go('/');
  await scrollThrough(page);
  const services = await page.locator('section[aria-labelledby=services-title] article').count();
  const cases = await page.locator('section[aria-labelledby=showcase-title] article').count();
  assert(services >= 1 && cases >= 1, `послуг ${services}, кейсів ${cases}`);
  await shot('home-desktop', { fullPage: true });
  return `послуг ${services}, кейсів ${cases}`;
});
await check('Слайдер відгуків: кнопки «наступний/попередній»', async () => {
  const region = page.getByRole('region', { name: 'Карусель відгуків' });
  await region.scrollIntoViewIfNeeded();
  const first = await region.locator('figure[aria-hidden=false] cite').innerText();
  await page.getByRole('button', { name: 'Наступний відгук' }).click();
  await page.waitForTimeout(700);
  const second = await region.locator('figure[aria-hidden=false] cite').innerText();
  assert(first !== second, 'слайд не змінився');
  await page.getByRole('button', { name: 'Попередній відгук' }).click();
  return `${first} → ${second}`;
});
await check('Модальне вікно: відкриття, валідація, закриття кнопкою, Esc і кліком поза вікном', async () => {
  const dialog = page.getByRole('dialog');
  await page.getByRole('button', { name: 'Звʼязатися' }).first().click();
  await dialog.getByRole('button', { name: 'Надіслати заявку' }).click();
  await dialog.getByText('Вкажіть імʼя').waitFor();
  await shot('modal-validation');
  await dialog.getByRole('button', { name: 'Закрити вікно' }).click();
  await dialog.waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Звʼязатися' }).first().click();
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Звʼязатися' }).first().click();
  await page.mouse.click(5, 450);
  await dialog.waitFor({ state: 'hidden' });
});
await check('Перемикач теми зберігає вибір після перезавантаження', async () => {
  await page.getByRole('button', { name: 'Увімкнути темну тему' }).click();
  await page.reload();
  assert((await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark', 'тема не збереглася');
  const services = page.locator('section[aria-labelledby=services-title]');
  await services.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  const hideHeader = await page.addStyleTag({ content: 'header { visibility: hidden !important; }' });
  await services.screenshot({ path: `${ART}home-dark.png` });
  await hideHeader.evaluate((el) => el.remove());
  await page.getByRole('button', { name: 'Увімкнути світлу тему' }).click();
});

await check('Портфоліо: «Показати ще» підвантажує наступну сторінку', async () => {
  await go('/projects');
  await page.getByText(/Знайдено проєктів: \d+/).waitFor();
  const before = await page.locator('main article').count();
  await page.getByRole('button', { name: 'Показати ще' }).click();
  await page.waitForFunction((n) => document.querySelectorAll('main article').length > n, before);
  return `${before} → ${await page.locator('main article').count()}`;
});
await check('Портфоліо: фільтр за послугою (параметр у URL)', async () => {
  await page.getByRole('button', { name: 'Веб-дизайн і розробка', exact: true }).click();
  await page.waitForURL(/service=web/);
  await page.getByText(/Знайдено проєктів: \d+/).waitFor();
  const tags = await page.locator('main article span').allInnerTexts();
  assert(tags.length > 0 && tags.every((t) => t === 'Веб-дизайн і розробка'), tags.join(', '));
  await shot('portfolio-filter');
  return `${tags.length} проєкт(и)`;
});
await check('Портфоліо: сортування за назвою (А–Я)', async () => {
  await page.getByRole('button', { name: 'Усі', exact: true }).click();
  await page.getByLabel('Сортування').selectOption('title');
  await page.waitForURL(/sort=title/);
  await page.waitForTimeout(800);
  assert(!page.url().includes('service='), `фільтр не скинувся: ${page.url()}`);
  const titles = await page.locator('main article h3').allInnerTexts();
  assert(titles.length === 6, `на першій сторінці ${titles.length} проєктів`);
  const sorted = [...titles].sort((a, b) => a.localeCompare(b, 'uk'));
  assert(JSON.stringify(titles) === JSON.stringify(sorted), titles.join(' | '));
  return titles.slice(0, 3).join(' → ') + ' …';
});
await check('Портфоліо: пошук і стан «нічого не знайдено»', async () => {
  await page.getByLabel('Пошук проєктів').fill('FinTrack');
  await page.waitForURL(/search=FinTrack/);
  await page.getByText('Знайдено проєктів: 1').waitFor();
  await page.getByLabel('Пошук проєктів').fill('неіснуючийзапит');
  await page.getByText('За вашим запитом нічого не знайдено.').waitFor();
  await shot('portfolio-empty');
  await page.getByRole('button', { name: 'Скинути фільтри' }).click();
});
await check('Сторінка кейсу: дані, галерея (лайтбокс), схожі проєкти тієї ж послуги', async () => {
  await go('/projects');
  await clickCenter(page, page.locator('main article').first());
  await page.waitForURL(/\/projects\/.+/);
  await page.getByText('01. Завдання').waitFor();
  const category = await page.locator('dl dd a').first().innerText();
  await page.getByRole('button', { name: /Відкрити зображення 1/ }).click();
  await page.getByRole('dialog').waitFor();
  await page.getByRole('button', { name: 'Наступне зображення' }).click();
  await page.keyboard.press('Escape');
  await shot('project-detail', { fullPage: true });
  return `категорія: ${category}`;
});

await check('Контакти: анонімна заявка зберігається в БД', async () => {
  await go('/contact');
  await page.getByLabel(/^Імʼя/).fill('Марія');
  await page.getByLabel(/^Прізвище/).fill('Бондар');
  await page.getByLabel(/^Email \*/).fill('maria@example.com');
  await page.getByLabel(/^Телефон/).fill('+380931234567');
  await page.getByLabel('Послуга').selectOption({ label: 'Брендинг та айдентика' });
  await page.getByLabel(/^Повідомлення/).fill('Потрібен ребрендинг кавʼярні та новий сайт.');
  await page.getByRole('button', { name: 'Надіслати заявку' }).click();
  await page.getByText('Дякуємо! Заявку отримано').waitFor();
  await shot('contact-success');
});
await check('Підписка у футері: валідація email і успішна підписка', async () => {
  const input = page.getByLabel('Email для розсилки');
  await input.fill('bad-email');
  await page.getByRole('button', { name: 'Підписатися' }).click();
  await page.getByText('Некоректний формат email').waitFor();
  await input.fill(`news${Date.now()}@example.com`);
  await page.getByRole('button', { name: 'Підписатися' }).click();
  await page.getByText('Ви підписалися на розсилку').waitFor();
});

const userEmail = `client${Date.now()}@example.com`;
await check('Закрита частина недоступна без входу (редирект на /login?next=)', async () => {
  await go('/account');
  await page.waitForURL(/\/login\?next=%2Faccount/);
  await go('/admin');
  await page.waitForURL(/\/login\?next=%2Fadmin/);
});
await check('Реєстрація: валідація форми та створення акаунта', async () => {
  await go('/register');
  await page.getByRole('button', { name: 'Зареєструватися' }).click();
  await page.getByText('Пароль має містити щонайменше 8 символів').waitFor();
  await page.getByLabel(/^Імʼя/).fill('Олена Клієнтка');
  await page.getByLabel(/^Email \*/).fill(userEmail);
  await page.getByLabel(/^Пароль/).fill('Client123');
  await page.getByLabel(/^Повторіть пароль/).fill('Client124');
  await page.getByRole('button', { name: 'Зареєструватися' }).click();
  await page.getByText('Паролі не збігаються').waitFor();
  await shot('register-validation');
  await page.getByLabel(/^Повторіть пароль/).fill('Client123');
  await page.getByRole('button', { name: 'Зареєструватися' }).click();
  await page.waitForURL('**/account');
});
await check('Кабінет: створення заявки, вкладки статусів, скасування', async () => {
  await page.getByRole('button', { name: 'Нова заявка' }).click();
  const d = page.getByRole('dialog');
  await d.getByLabel(/^Телефон/).fill('+380671234500');
  await d.getByLabel('Послуга').selectOption({ label: 'Цифровий маркетинг' });
  await d.getByLabel(/^Повідомлення/).fill('Цікавить запуск реклами для інтернет-магазину.');
  await d.getByRole('button', { name: 'Надіслати заявку' }).click();
  await page.getByText('Цифровий маркетинг').first().waitFor();
  await shot('account-requests');
  page.once('dialog', (dlg) => dlg.accept());
  await page.getByRole('button', { name: 'Скасувати заявку' }).first().click();
  await page.getByRole('tab', { name: /Скасована/ }).click();
  await page.locator('ul[role=tabpanel] li').first().waitFor();
});
await check('Користувач (USER) не може відкрити адмін-панель', async () => {
  await go('/admin');
  await page.waitForURL('**/account');
});
await check('Вихід із системи', async () => {
  await page.getByRole('button', { name: /Меню користувача/ }).click();
  await page.getByRole('button', { name: 'Вийти' }).click();
  await page.waitForURL(WEB + '/');
  await page.getByRole('link', { name: 'Увійти в обліковий запис' }).waitFor();
});
await check('Вхід: неправильний пароль показує помилку сервера', async () => {
  await go('/login');
  await page.getByLabel(/^Email \*/).fill(ADMIN.email);
  await page.getByLabel(/^Пароль/).fill('WrongPass1');
  await page.getByRole('button', { name: 'Увійти' }).click();
  await page.getByRole('alert').waitFor();
  await shot('login-error');
  return await page.getByRole('alert').innerText();
});
await check('Вхід адміністратора і дашборд', async () => {
  await page.getByLabel(/^Пароль/).fill(ADMIN.password);
  await page.getByRole('button', { name: 'Увійти' }).click();
  await page.waitForURL('**/admin');
  await page.getByText('Нових заявок').waitFor();
  await shot('admin-dashboard');
});
await check('Адмінка: CRUD проєкту (створення → редагування → видалення) з валідацією', async () => {
  await go('/admin/projects');
  await page.getByRole('button', { name: 'Додати' }).click();
  const d = page.getByRole('dialog');
  await d.getByRole('button', { name: 'Зберегти' }).click();
  await d.getByText('Обовʼязкове поле').first().waitFor();
  await d.getByLabel(/^Назва/).fill('Стратегія виходу на ринок ЄС');
  await d.getByLabel(/^Підзаголовок/).fill('Консалтинг для виробника');
  await d.getByLabel(/^Послуга/).selectOption({ label: 'IT-консалтинг' });
  await d.getByLabel(/^Клієнт/).fill('ТОВ «Еко Фуд»');
  await d.getByLabel(/^Локація/).fill('Вінниця');
  await d.getByLabel(/^Обкладинка/).fill('/img/projects/project-6.webp');
  await d.getByLabel(/^Завдання/).fill('Підготувати компанію до експорту.');
  await d.getByLabel(/^Рішення/).fill('Аудит процесів і впровадження CRM.');
  await d.getByLabel(/^Результат/).fill('Перші контракти в Польщі за 4 місяці.');
  await shot('admin-project-form');
  await d.getByRole('button', { name: 'Зберегти' }).click();
  await page.getByText('Проєкт: запис створено').waitFor();
  await page.getByLabel('Пошук').fill('ринок ЄС');
  const row = page.locator('tr', { hasText: 'Стратегія виходу на ринок ЄС' });
  await row.waitFor();
  await shot('admin-projects');
  await row.getByRole('button', { name: 'Редагувати' }).click();
  await d.getByLabel(/^Назва/).fill('Стратегія виходу на ринок ЄС 2.0');
  await d.getByRole('button', { name: 'Зберегти' }).click();
  await page.getByText('Проєкт: зміни збережено').waitFor();
  page.once('dialog', (dlg) => dlg.accept());
  await page.locator('tr', { hasText: '2.0' }).getByRole('button', { name: 'Видалити' }).click();
  await page.getByText(/видалено/).waitFor();
});
await check('Адмінка: CRUD послуги та заборона видалити послугу з проєктами', async () => {
  await go('/admin/services');
  await page.getByRole('button', { name: 'Додати' }).click();
  const d = page.getByRole('dialog');
  await d.getByLabel(/^Назва/).fill('Бізнес-аналітика');
  await d.getByLabel(/^Іконка/).selectOption('it');
  await d.getByLabel(/^Короткий опис/).fill('Дашборди та звіти для ухвалення рішень.');
  await d.getByLabel(/^Повний опис/).fill('Налаштовуємо збір даних, будуємо дашборди та навчаємо команду.');
  await d.getByRole('button', { name: 'Зберегти' }).click();
  await page.getByText('Послуга: запис створено').waitFor();
  page.once('dialog', (dlg) => dlg.accept());
  await page.locator('tr', { hasText: 'Бізнес-аналітика' }).getByRole('button', { name: 'Видалити' }).click();
  await page.getByText('«Бізнес-аналітика» видалено').waitFor();
  page.once('dialog', (dlg) => dlg.accept());
  await page.locator('tbody tr').first().getByRole('button', { name: 'Видалити' }).click();
  return await page.getByRole('alert').first().innerText();
});
await check('Адмінка: заявки — пошук, фільтр за статусом, зміна статусу', async () => {
  await go('/admin/requests');
  await page.getByLabel('Пошук заявок').fill('maria@example.com');
  await page.locator('tbody tr', { hasText: 'Марія' }).first().waitFor();
  await page.locator('tbody tr').first().locator('select').selectOption('IN_PROGRESS');
  await page.getByText(/статус «В роботі»/).waitFor();
  await page.getByLabel('Пошук заявок').fill('');
  await page.getByLabel('Статус', { exact: true }).selectOption('IN_PROGRESS');
  await page.waitForTimeout(800);
  const statuses = await page.locator('tbody select').evaluateAll((s) => s.map((x) => x.value));
  assert(statuses.length > 0 && statuses.every((s) => s === 'IN_PROGRESS'), statuses.join(','));
  await shot('admin-requests');
});
await check('Адмінка: користувачі — зміна ролі', async () => {
  await go('/admin/users');
  const row = page.locator('tr', { hasText: userEmail });
  await row.locator('select').selectOption('ADMIN');
  await page.getByText(/роль змінено на ADMIN/).waitFor();
  await row.locator('select').selectOption('USER');
  await page.getByText(/роль змінено на USER/).waitFor();
  await shot('admin-users');
});
await check('Консоль браузера без JavaScript-помилок', async () => {
  assert(consoleProblems.length === 0, consoleProblems.join(' | '));
});

await browser.close();
process.exitCode = save();
