'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { useAuth } from '@/lib/auth';
import LogoMark from './LogoMark';
import { RequestButton } from './RequestModal';
import ThemeToggle from './ThemeToggle';
import styles from './Header.module.css';

export const NAV_LINKS = [
  { href: '/', label: 'Головна' },
  { href: '/about', label: 'Про нас' },
  { href: '/projects', label: 'Портфоліо' },
  { href: '/contact', label: 'Контакти' },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const overlay = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus after navigation (state adjusted during render instead of in an effect).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
    setUserMenuOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMenuOpen(false);
    router.push('/');
  };

  const headerClass = [styles.header, overlay && styles.overlay, (scrolled || menuOpen) && styles.scrolled]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <header className={headerClass}>
        <div className={`container ${styles.inner}`}>
          <Link href="/" className={styles.logo} aria-label="Canvix — на головну">
            <LogoMark />
            Canvix
          </Link>

          <nav className={styles.nav} aria-label="Основна навігація">
            <ul className={styles.navList}>
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`${styles.navLink} ${isActive(pathname, href) ? styles.active : ''}`}
                    aria-current={isActive(pathname, href) ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <ThemeToggle className={styles.iconButton} />

            {user ? (
              <div className={styles.userMenu} ref={userMenuRef}>
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label={`Меню користувача ${user.name}`}
                  aria-expanded={userMenuOpen}
                  onClick={() => setUserMenuOpen((open) => !open)}
                >
                  <Icon name="user" />
                </button>
                {userMenuOpen && (
                  <div className={styles.dropdown}>
                    <p className={styles.dropdownName}>{user.name}</p>
                    <Link href="/account" className={styles.dropdownItem}>
                      Мої заявки
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" className={styles.dropdownItem}>
                        Адмін-панель
                      </Link>
                    )}
                    <button type="button" className={styles.dropdownItem} onClick={handleLogout}>
                      Вийти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className={styles.iconButton} aria-label="Увійти в обліковий запис">
                <Icon name="user" />
              </Link>
            )}

            <RequestButton className={styles.cta}>Звʼязатися</RequestButton>

            <button
              type="button"
              className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
              aria-label={menuOpen ? 'Закрити меню' : 'Відкрити меню'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* Kept outside <header>: its backdrop-filter would make it the containing block for this fixed panel. */}
      <div id="mobile-menu" className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`} inert={!menuOpen}>
        <nav aria-label="Мобільна навігація">
          <ul className={styles.drawerList}>
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={`${styles.drawerLink} ${isActive(pathname, href) ? styles.active : ''}`}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.drawerActions}>
          <RequestButton variant="light" block>
            Звʼязатися з нами
          </RequestButton>
          {user ? (
            <>
              <Button href="/account" variant="outline" block>
                Мої заявки
              </Button>
              {user.role === 'ADMIN' && (
                <Button href="/admin" variant="outline" block>
                  Адмін-панель
                </Button>
              )}
              <Button variant="outline" block onClick={handleLogout}>
                Вийти
              </Button>
            </>
          ) : (
            <Button href="/login" variant="outline" block>
              Увійти / Зареєструватися
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
