import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

export const WEB = process.env.WEB_URL ?? 'http://localhost:3000';
export const API = (process.env.API_URL ?? 'http://localhost:4000') + '/api';
export const ADMIN = { email: process.env.ADMIN_EMAIL ?? 'admin@canvix.ua', password: process.env.ADMIN_PASSWORD ?? 'Admin12345' };
export const ART = new URL('./artifacts/', import.meta.url).pathname;
mkdirSync(ART, { recursive: true });

/** Collects check results and stores them in artifacts/<suite>.json for the report. */
export function suite(name) {
  const results = [];
  const record = (title, ok, details = '') => {
    results.push({ title, ok, details });
    console.log(`${ok ? '✔' : '✘'} ${title}${details ? ` — ${details}` : ''}`);
  };
  const check = async (title, fn) => {
    try {
      const details = await fn();
      record(title, true, typeof details === 'string' ? details : '');
    } catch (error) {
      record(title, false, error.message.split('\n')[0]);
    }
  };
  const save = (extra = {}) => {
    writeFileSync(`${ART}${name}.json`, JSON.stringify({ name, date: new Date().toISOString(), results, ...extra }, null, 2));
    const failed = results.filter((r) => !r.ok).length;
    console.log(`\n${results.length - failed}/${results.length} passed`);
    return failed;
  };
  return { check, record, save, results };
}

export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function readArtifact(name) {
  const file = `${ART}${name}.json`;
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
}
