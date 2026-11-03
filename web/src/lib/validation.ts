export type Errors<T> = Partial<Record<keyof T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s()-]{7,20}$/;
const NAME_RE = /^[\p{L}\s'’-]+$/u;

export const isEmail = (value: string) => EMAIL_RE.test(value.trim());

export function validateName(value: string, label: string) {
  const v = value.trim();
  if (!v) return `Вкажіть ${label}`;
  if (v.length < 2) return `${label[0].toUpperCase()}${label.slice(1)} має містити щонайменше 2 символи`;
  if (v.length > 60) return 'Не більше 60 символів';
  if (!NAME_RE.test(v)) return 'Використовуйте лише літери, пробіл, апостроф або дефіс';
  return undefined;
}

export function validateEmail(value: string) {
  if (!value.trim()) return 'Вкажіть email';
  if (!isEmail(value)) return 'Некоректний формат email, наприклад name@example.com';
  return undefined;
}

export function validatePhone(value: string) {
  if (!value.trim()) return 'Вкажіть номер телефону';
  if (!PHONE_RE.test(value.trim())) return 'Некоректний номер, наприклад +380 67 123 45 67';
  return undefined;
}

export function validateMessage(value: string, min = 10, max = 2000) {
  const v = value.trim();
  if (v.length < min) return `Повідомлення має містити щонайменше ${min} символів`;
  if (v.length > max) return `Не більше ${max} символів`;
  return undefined;
}

export function validatePassword(value: string) {
  if (value.length < 8) return 'Пароль має містити щонайменше 8 символів';
  if (!/[A-Za-zА-Яа-яІіЇїЄєҐґ]/.test(value) || !/\d/.test(value)) return 'Пароль має містити літери та цифри';
  return undefined;
}

export function hasErrors<T>(errors: Errors<T>) {
  return Object.values(errors).some(Boolean);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('uk-UA', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
}
