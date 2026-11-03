// Helpers for building the coursework PDF reports (HTML → PDF with the local Chrome).
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { ART, readArtifact } from './lib.mjs';

export const OUT = new URL('../docs/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
export const config = JSON.parse(readFileSync(new URL('./report-config.json', import.meta.url), 'utf8'));

export const esc = (s) =>
  String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const PENDING = '<span class="pending">буде додано після розгортання</span>';
export const link = (url) => (url ? `<a href="${esc(url)}">${esc(url)}</a>` : PENDING);

/** Screenshot from qa/artifacts, downscaled and embedded as a data URI. */
export async function img(name, { caption = '', width = 1200, crop } = {}) {
  const file = `${ART}${name}.png`;
  if (!existsSync(file)) return `<p class="pending">[скріншот ${esc(name)} відсутній]</p>`;
  let pipeline = sharp(file);
  if (crop) {
    const meta = await sharp(file).metadata();
    pipeline = pipeline.extract({ left: 0, top: 0, width: meta.width, height: Math.min(crop, meta.height) });
  }
  const buffer = await pipeline.resize({ width, withoutEnlargement: true }).jpeg({ quality: 72 }).toBuffer();
  return `<figure><img src="data:image/jpeg;base64,${buffer.toString('base64')}" alt="${esc(caption)}">${
    caption ? `<figcaption>${esc(caption)}</figcaption>` : ''
  }</figure>`;
}

export const table = (head, rows, cls = '') =>
  `<table class="${cls}"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;

export const steps = (items) => `<ol class="steps">${items.map((i) => `<li>${i}</li>`).join('')}</ol>`;
export const list = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;

/** Table of automated check results from a qa suite. */
export function results(suiteName) {
  const data = readArtifact(suiteName);
  if (!data) return '<p class="pending">Результати перевірки відсутні — запустіть qa.</p>';
  const passed = data.results.filter((r) => r.ok).length;
  return `<p class="summary">Автоматичний набір <code>qa/${suiteName}.mjs</code>: <b>${passed} з ${data.results.length}</b> перевірок пройдено (${new Date(
    data.date,
  ).toLocaleString('uk-UA')}).</p>${table(
    ['', 'Перевірка', 'Результат'],
    data.results.map((r) => [r.ok ? '<span class="ok">✔</span>' : '<span class="fail">✘</span>', esc(r.title), esc(r.details)]),
    'results',
  )}`;
}

const STYLES = `
@page { size: A4; margin: 16mm 14mm 18mm; }
* { box-sizing: border-box; }
body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10.5pt; line-height: 1.45; color: #1a1a1a; }
h1 { font-family: Georgia, 'Times New Roman', serif; font-size: 21pt; margin: 0 0 4mm; }
h2 { font-family: Georgia, 'Times New Roman', serif; font-size: 14pt; margin: 8mm 0 3mm; padding-bottom: 1.5mm; border-bottom: 1.5px solid #64ccc5; break-after: avoid; }
h3 { font-size: 11.5pt; margin: 5mm 0 2mm; break-after: avoid; }
p { margin: 0 0 2.5mm; }
ul, ol { margin: 0 0 3mm; padding-left: 6mm; }
li { margin-bottom: 1mm; }
code { font-family: Menlo, Consolas, monospace; font-size: 9pt; background: #f2f4f4; padding: 0.2mm 1.2mm; border-radius: 2px; }
a { color: #1d7f78; word-break: break-all; }
table { width: 100%; border-collapse: collapse; margin: 2mm 0 4mm; font-size: 9.2pt; }
th, td { border: 1px solid #d9dede; padding: 1.6mm 2.2mm; text-align: left; vertical-align: top; }
th { background: #eef6f5; }
tr { break-inside: avoid; }
table.results td:first-child { width: 6mm; text-align: center; }
.ok { color: #1f8a4c; font-weight: bold; } .fail { color: #c0392b; font-weight: bold; }
.meta { background: #f4f7f7; border-left: 3px solid #64ccc5; padding: 3mm 4mm; margin-bottom: 6mm; }
.meta p { margin: 0 0 1mm; }
.summary { font-size: 10.5pt; }
.pending { color: #b26a00; font-style: italic; }
figure { margin: 3mm 0 5mm; break-inside: avoid; text-align: center; }
figure img { max-width: 100%; max-height: 165mm; border: 1px solid #d9dede; border-radius: 2mm; }
figcaption { font-size: 8.8pt; color: #555; margin-top: 1.5mm; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
.grid2 figure img { max-height: 120mm; }
.steps li { margin-bottom: 1.5mm; }
.note { background: #fff8e6; border-left: 3px solid #f0b44a; padding: 2.5mm 4mm; margin: 3mm 0; }
`;

export async function renderPdf(fileName, title, body) {
  const meta = `<div class="meta">
    <p><b>Курсовий проєкт:</b> сайт агенції комплексного розвитку бізнесу «Canvix»</p>
    ${config.student ? `<p><b>Виконав(ла):</b> ${esc(config.student)}${config.group ? `, група ${esc(config.group)}` : ''}</p>` : ''}
    <p><b>Репозиторій GitHub:</b> ${link(config.repoUrl)}</p>
    <p><b>Клієнтська частина:</b> ${link(config.siteUrl)}</p>
    <p><b>REST API:</b> ${link(config.apiUrl ? `${config.apiUrl}/api` : '')}${config.apiUrl ? ` · Swagger: ${link(`${config.apiUrl}/api/docs`)}` : ''}</p>
    <p><b>Демо-доступ:</b> адміністратор <code>admin@canvix.ua</code> / <code>Admin12345</code> · клієнт <code>user@canvix.ua</code> / <code>User12345</code></p>
  </div>`;
  const html = `<!doctype html><html lang="uk"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${STYLES}</style></head><body><h1>${esc(
    title,
  )}</h1>${meta}${body}</body></html>`;
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  if (process.env.PREVIEW) {
    await page.setViewportSize({ width: 794, height: 1123 });
    await page.emulateMedia({ media: 'print' });
    await page.screenshot({ path: `${process.env.PREVIEW}/${fileName.replace('.pdf', '.png')}`, fullPage: true });
  }
  await page.pdf({
    path: OUT + fileName,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;font-size:8px;color:#888;padding:0 14mm;display:flex;justify-content:space-between;font-family:Arial"><span>Canvix — ${esc(
      title,
    )}</span><span>стор. <span class="pageNumber"></span> з <span class="totalPages"></span></span></div>`,
    margin: { top: '16mm', bottom: '18mm', left: '14mm', right: '14mm' },
  });
  await browser.close();
  console.log('✔', OUT + fileName);
}
