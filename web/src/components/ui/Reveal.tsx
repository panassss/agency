'use client';

import { useEffect, useRef } from 'react';

interface RevealProps {
  as?: 'div' | 'section' | 'article' | 'li';
  delay?: number;
  className?: string;
  children: React.ReactNode;
}

/** Fades its content in once it scrolls into view (IntersectionObserver). */
export default function Reveal({ as: Tag = 'div', delay = 0, className, children }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={['reveal', className].filter(Boolean).join(' ')}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
