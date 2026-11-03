'use client';

import Link from 'next/link';
import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { api, ApiError } from '@/lib/api';
import { validateEmail } from '@/lib/validation';
import { NAV_LINKS } from './Header';
import LogoMark from './LogoMark';
import styles from './Footer.module.css';

const ACCOUNT_LINKS = [
  { href: '/login', label: 'Вхід' },
  { href: '/register', label: 'Реєстрація' },
  { href: '/account', label: 'Мої заявки' },
];

export const SOCIALS = [
  { href: 'https://www.facebook.com/', label: 'Facebook', icon: 'social-facebook', width: 14, height: 23 },
  { href: 'https://www.instagram.com/', label: 'Instagram', icon: 'social-instagram', width: 23, height: 23 },
  { href: 'https://www.linkedin.com/', label: 'LinkedIn', icon: 'social-linkedin', width: 23, height: 23 },
] as const;

function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setStatus({ type: 'err', text: error });
      return;
    }
    setSending(true);
    try {
      await api('/subscribers', { method: 'POST', body: { email: email.trim() } });
      setStatus({ type: 'ok', text: 'Дякуємо! Ви підписалися на розсилку.' });
      setEmail('');
    } catch (err) {
      setStatus({ type: 'err', text: err instanceof ApiError ? err.message : 'Не вдалося підписатися' });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={styles.subscribe}>
        <label htmlFor="subscribe-email" className="visually-hidden">
          Email для розсилки
        </label>
        <input
          id="subscribe-email"
          type="email"
          autoComplete="email"
          placeholder="Ваш email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={status?.type === 'err'}
          aria-describedby="subscribe-status"
        />
        <button type="submit" disabled={sending}>
          {sending ? '…' : 'Підписатися'}
        </button>
      </div>
      <p id="subscribe-status" className={`${styles.message} ${status ? styles[status.type] : ''}`} aria-live="polite">
        {status?.text}
      </p>
    </form>
  );
}

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo} aria-label="Canvix — на головну">
              <LogoMark size={52} />
              Canvix
            </Link>
            <p className={styles.about}>
              Команда стратегів, маркетологів і дизайнерів, що допомагає бізнесу зростати системно — від ідеї до
              результату.
            </p>
          </div>

          <div className={styles.columns}>
            <nav aria-labelledby="footer-pages">
              <h2 id="footer-pages" className={styles.title}>
                Сторінки
              </h2>
              <ul className={styles.links}>
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-labelledby="footer-account">
              <h2 id="footer-account" className={styles.title}>
                Кабінет
              </h2>
              <ul className={styles.links}>
                {ACCOUNT_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <h2 className={styles.title}>Підписка</h2>
            <SubscribeForm />
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.bottom}>
          <div className={styles.meta}>
            <p className={styles.metaTitle}>© 2026 Canvix</p>
            <p>Дизайн: Iconstica.com</p>
          </div>
          <div className={styles.meta}>
            <p className={styles.metaTitle}>Контакти</p>
            <a href="tel:+380441234567">+38 (044) 123 45 67</a>
          </div>
          <address className={styles.meta}>
            <p className={styles.metaTitle}>Адреса</p>
            <span>вул. Хрещатик, 22, Київ, 01001</span>
          </address>
          <ul className={styles.socials} aria-label="Ми в соцмережах">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  className={styles.social}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                >
                  <Icon name={s.icon} width={s.width} height={s.height} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
