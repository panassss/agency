// REST API + database checks: routes, HTTP status codes, server validation, roles, relations.
import { API, ADMIN, assert, suite } from './lib.mjs';

const { check, save } = suite('api');

async function call(method, path, { token, body } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null };
}

const expect = (r, status) => assert(r.status === status, `очікувався ${status}, отримано ${r.status}: ${JSON.stringify(r.data)?.slice(0, 160)}`);

let adminToken, userToken, userEmail, serviceId, projectId, projectSlug, requestId;

await check('GET /health — сервер працює (200)', async () => expect(await call('GET', '/health'), 200));

await check('POST /auth/register — реєстрація (201), пароль не повертається', async () => {
  userEmail = `qa${Date.now()}@example.com`;
  const r = await call('POST', '/auth/register', { body: { name: 'QA Тестувальник', email: userEmail, password: 'Qa123456' } });
  expect(r, 201);
  assert(r.data.token && r.data.user.role === 'USER' && !('passwordHash' in r.data.user), 'некоректна відповідь');
  userToken = r.data.token;
});
await check('POST /auth/register — повторний email (409)', async () =>
  expect(await call('POST', '/auth/register', { body: { name: 'QA', email: userEmail, password: 'Qa123456' } }), 409));
await check('POST /auth/register — невалідні дані (400, повідомлення українською)', async () => {
  const r = await call('POST', '/auth/register', { body: { name: 'A', email: 'not-an-email', password: '123' } });
  expect(r, 400);
  return [].concat(r.data.message).join('; ');
});
await check('POST /auth/login — неправильний пароль (401)', async () =>
  expect(await call('POST', '/auth/login', { body: { email: userEmail, password: 'Wrong12345' } }), 401));
await check('POST /auth/login — вхід адміністратора (200)', async () => {
  const r = await call('POST', '/auth/login', { body: ADMIN });
  expect(r, 200);
  adminToken = r.data.token;
});
await check('GET /auth/me — без токена (401), з токеном (200)', async () => {
  expect(await call('GET', '/auth/me'), 401);
  expect(await call('GET', '/auth/me', { token: userToken }), 200);
});

await check('GET /services — список послуг (200)', async () => {
  const r = await call('GET', '/services');
  expect(r, 200);
  serviceId = r.data[0].id;
  return `${r.data.length} послуг`;
});
await check('GET /projects — пагінація (limit=2)', async () => {
  const r = await call('GET', '/projects?limit=2&page=1');
  expect(r, 200);
  assert(r.data.items.length === 2 && r.data.totalPages >= 2, 'пагінація не працює');
  return `усього ${r.data.total}, сторінок ${r.data.totalPages}`;
});
await check('GET /projects — пошук (search)', async () => {
  const r = await call('GET', '/projects?search=FinTrack');
  expect(r, 200);
  assert(r.data.items.length >= 1 && r.data.items.every((p) => /fintrack/i.test(p.title + p.client)), 'пошук не працює');
});
await check('GET /projects — фільтр за послугою (звʼязок services→projects)', async () => {
  const services = (await call('GET', '/services')).data;
  const slug = services.find((s) => s.slug === 'graphic-design')?.slug ?? services[1].slug;
  const r = await call('GET', `/projects?service=${slug}`);
  expect(r, 200);
  assert(r.data.items.every((p) => p.service.slug === slug), 'знайдено проєкти іншої послуги');
  return `${slug}: ${r.data.total}`;
});
await check('GET /projects — сортування за назвою', async () => {
  const r = await call('GET', '/projects?sort=title&limit=50');
  const titles = r.data.items.map((p) => p.title);
  const sorted = [...titles].sort((a, b) => a.localeCompare(b, 'uk'));
  assert(JSON.stringify(titles) === JSON.stringify(sorted), 'порядок не збігається');
});
await check('GET /projects — невалідні параметри (400)', async () => expect(await call('GET', '/projects?sort=random&limit=1000'), 400));
await check('GET /projects/:slug — неіснуючий проєкт (404)', async () => expect(await call('GET', '/projects/no-such-project'), 404));

await check('POST /projects — без токена (401)', async () => expect(await call('POST', '/projects', { body: {} }), 401));
await check('POST /projects — роль USER (403, перевірка ролі на сервері)', async () => expect(await call('POST', '/projects', { token: userToken, body: {} }), 403));
await check('POST /projects — невалідні дані від ADMIN (400)', async () => expect(await call('POST', '/projects', { token: adminToken, body: { title: 'x' } }), 400));
await check('CRUD проєкту: POST (201) → PATCH (200) → GET → DELETE (204) → GET (404)', async () => {
  const body = {
    title: 'QA тестовий проєкт', subtitle: 'Автоматична перевірка CRUD', serviceId, client: 'ТОВ «QA»', location: 'Київ',
    date: '2026-09-01T00:00:00.000Z', coverImage: '/img/projects/project-1.webp', gallery: [],
    challenge: 'Перевірити створення запису.', solution: 'Створити запис через API.', result: 'Запис створено та видалено.',
  };
  const created = await call('POST', '/projects', { token: adminToken, body });
  expect(created, 201);
  projectId = created.data.id;
  projectSlug = created.data.slug;
  expect(await call('PATCH', `/projects/${projectId}`, { token: adminToken, body: { title: 'QA тестовий проєкт (оновлено)' } }), 200);
  const fetched = await call('GET', `/projects/${projectSlug}`);
  assert(fetched.data.title.endsWith('(оновлено)'), 'оновлення не збереглося');
  expect(await call('DELETE', `/projects/${projectId}`, { token: adminToken }), 204);
  expect(await call('GET', `/projects/${projectSlug}`), 404);
  return `slug: ${projectSlug}`;
});
await check('CRUD послуги: POST (201, slug з транслітерації) → PATCH → DELETE (204)', async () => {
  const created = await call('POST', '/services', {
    token: adminToken,
    body: { title: 'QA послуга', shortDescription: 'Короткий опис послуги QA.', description: 'Повний опис послуги для перевірки.', icon: 'web' },
  });
  expect(created, 201);
  expect(await call('PATCH', `/services/${created.data.id}`, { token: adminToken, body: { order: 99 } }), 200);
  expect(await call('DELETE', `/services/${created.data.id}`, { token: adminToken }), 204);
  return `slug: ${created.data.slug}`;
});
await check('DELETE /services/:id — послуга з проєктами (409, цілісність звʼязку)', async () =>
  expect(await call('DELETE', `/services/${serviceId}`, { token: adminToken }), 409));

await check('POST /requests — анонімна заявка (201)', async () =>
  expect(await call('POST', '/requests', { body: { firstName: 'Ірина', lastName: 'Коваль', email: 'iryna@example.com', phone: '+380671112233', message: 'Хочу консультацію щодо маркетингу.', serviceId } }), 201));
await check('POST /requests — невалідна заявка (400)', async () =>
  expect(await call('POST', '/requests', { body: { firstName: '', email: 'bad', phone: 'abc', message: 'коротко' } }), 400));
await check('POST /requests — заявка користувача привʼязується до акаунта (users→requests)', async () => {
  const r = await call('POST', '/requests', { token: userToken, body: { firstName: 'QA', lastName: 'Тестувальник', email: userEmail, phone: '+380501234567', message: 'Заявка від зареєстрованого користувача.', serviceId } });
  expect(r, 201);
  requestId = r.data.id;
  const mine = await call('GET', '/requests/my', { token: userToken });
  assert(mine.data.some((x) => x.id === requestId), 'заявки немає у /requests/my');
});
await check('GET /requests — USER не має доступу до всіх заявок (403)', async () => expect(await call('GET', '/requests', { token: userToken }), 403));
await check('PATCH /requests/:id/cancel — скасування власної заявки (200), повторно (409)', async () => {
  expect(await call('PATCH', `/requests/${requestId}/cancel`, { token: userToken }), 200);
  expect(await call('PATCH', `/requests/${requestId}/cancel`, { token: userToken }), 409);
});
await check('PATCH /requests/:id — зміна статусу адміністратором (200)', async () => {
  const r = await call('PATCH', `/requests/${requestId}`, { token: adminToken, body: { status: 'IN_PROGRESS' } });
  expect(r, 200);
  assert(r.data.status === 'IN_PROGRESS', 'статус не змінився');
});
await check('GET /requests?status=&search= — фільтр і пошук заявок (ADMIN)', async () => {
  const r = await call('GET', `/requests?status=IN_PROGRESS&search=${encodeURIComponent(userEmail)}`, { token: adminToken });
  expect(r, 200);
  assert(r.data.items.length === 1, `знайдено ${r.data.items.length}`);
});
await check('DELETE /requests/:id — видалення заявки (204)', async () => expect(await call('DELETE', `/requests/${requestId}`, { token: adminToken }), 204));
await check('POST /subscribers — підписка (201), повторно (409)', async () => {
  const email = `sub${Date.now()}@example.com`;
  expect(await call('POST', '/subscribers', { body: { email } }), 201);
  expect(await call('POST', '/subscribers', { body: { email } }), 409);
});
await check('GET /admin/stats — статистика (ADMIN 200, USER 403)', async () => {
  expect(await call('GET', '/admin/stats', { token: userToken }), 403);
  const r = await call('GET', '/admin/stats', { token: adminToken });
  expect(r, 200);
  return `проєктів ${r.data.projects}, заявок ${r.data.requests.total}`;
});
await check('PATCH /users/:id/role — адміністратор не може змінити власну роль (400)', async () => {
  const me = await call('GET', '/auth/me', { token: adminToken });
  expect(await call('PATCH', `/users/${me.data.id}/role`, { token: adminToken, body: { role: 'USER' } }), 400);
});

process.exitCode = save();
