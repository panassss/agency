'use client';

import { useSyncExternalStore } from 'react';
import Icon from '@/components/ui/Icon';
import { THEME_KEY } from '@/lib/theme';

type Theme = 'light' | 'dark';

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

const getTheme = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

/** Switches between light and dark themes and remembers the choice in localStorage. */
export default function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore<Theme>(subscribe, getTheme, () => 'light');

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Theme still switches for the current visit when storage is unavailable.
    }
  };

  return (
    <button
      type="button"
      className={className}
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  );
}
