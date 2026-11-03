'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RequireAuth from '@/components/auth/RequireAuth';
import styles from './Admin.module.css';

const LINKS = [
  { href: '/admin', label: 'Огляд' },
  { href: '/admin/requests', label: 'Заявки' },
  { href: '/admin/projects', label: 'Проєкти' },
  { href: '/admin/services', label: 'Послуги' },
  { href: '/admin/team', label: 'Команда' },
  { href: '/admin/testimonials', label: 'Відгуки' },
  { href: '/admin/users', label: 'Користувачі' },
  { href: '/admin/subscribers', label: 'Підписники' },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <RequireAuth role="ADMIN" title="Адмін-панель">
      <div className={`container ${styles.layout}`}>
        <nav className={styles.sidebar} aria-label="Розділи адмін-панелі">
          <p className={styles.sideTitle}>Адмін-панель</p>
          {LINKS.map(({ href, label }) => {
            const active = href === '/admin' ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.navLink} ${active ? styles.navActive : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className={styles.content}>{children}</div>
      </div>
    </RequireAuth>
  );
}
