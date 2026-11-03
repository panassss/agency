'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/ui/Icon';
import styles from './ScrollTop.module.css';

export default function ScrollTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`${styles.button} ${visible ? styles.visible : ''}`}
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label="Прокрутити вгору"
      tabIndex={visible ? 0 : -1}
    >
      <Icon name="arrow-up" />
    </button>
  );
}
