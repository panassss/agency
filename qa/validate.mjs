// W3C validation of the production build: HTML (validator.w3.org/nu) and CSS (jigsaw.w3.org).
// Run against `next build && next start` (PROD_URL, default http://localhost:3001).
import { readdirSync, readFileSync } from 'node:fs';
import { assert, suite } from './lib.mjs';

const PROD = process.env.PROD_URL ?? 'http://localhost:3001';
const CSS_DIR = new URL('../web/.next/static/chunks/', import.meta.url).pathname;
const { check, save } = suite('validate');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const details = { html: [], css: {} };

const slug = (await (await fetch('http://localhost:4000/api/projects?limit=1')).json()).items[0].slug;
const PAGES = ['/', '/about', '/projects', `/projects/${slug}`, '/contact', '/login', '/register', '/account', '/admin', '/no-such-page'];

for (const path of PAGES) {
  await check(`HTML ${path} — W3C Nu Validator`, async () => {
    const html = await (await fetch(PROD + path)).text();
    const res = await fetch('https://validator.w3.org/nu/?out=json', {
      method: 'POST',
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'User-Agent': 'canvix-coursework-qa' },
      body: html,
    });
    const { messages } = await res.json();
    const errors = messages.filter((m) => m.type === 'error');
    const warnings = messages.filter((m) => m.subType === 'warning');
    const info = messages.length - errors.length - warnings.length;
    details.html.push({ path, errors: errors.length, warnings: warnings.length, info });
    await sleep(1200);
    assert(errors.length === 0 && warnings.length === 0, [...errors, ...warnings].map((m) => m.message).join(' | '));
    return `помилок 0, попереджень 0, інформаційних ${info}`;
  });
}

const files = readdirSync(CSS_DIR).filter((f) => f.endsWith('.css'));
const own = files.filter((f) => !readFileSync(CSS_DIR + f, 'utf8').includes('.leaflet-pane'));
const leaflet = files.filter((f) => !own.includes(f));
async function validateCss(css) {
  const form = new FormData();
  form.append('file', new Blob([css], { type: 'text/css' }), 'styles.css');
  form.append('output', 'json');
  form.append('profile', 'css3svg');
  const res = await fetch('https://jigsaw.w3.org/css-validator/validator', { method: 'POST', body: form });
  return (await res.json()).cssvalidation;
}
await check(`CSS проєкту (${own.length} файлів після збірки) — W3C CSS Validator`, async () => {
  const v = await validateCss(own.map((f) => readFileSync(CSS_DIR + f, 'utf8')).join('\n'));
  details.css.own = { errors: v.result.errorcount, warnings: v.result.warningcount };
  assert(v.result.errorcount === 0, (v.errors ?? []).map((e) => `${e.context}: ${e.message}`).join(' | '));
  return `помилок 0, попереджень ${v.result.warningcount} (змінні CSS і вендорні префікси)`;
});
await check('CSS сторонньої бібліотеки Leaflet (довідково)', async () => {
  const v = await validateCss(leaflet.map((f) => readFileSync(CSS_DIR + f, 'utf8')).join('\n'));
  details.css.leaflet = { errors: v.result.errorcount, messages: (v.errors ?? []).map((e) => `${e.context}: ${e.message.trim()}`) };
  return `помилок ${v.result.errorcount}: ${details.css.leaflet.messages.join('; ')}`;
});

process.exitCode = save({ details });
