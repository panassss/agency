'use client';

import { useEffect, useRef, useState } from 'react';

interface CounterProps {
  to: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
}

/** Number that counts up from zero the first time it becomes visible. */
export default function Counter({ to, suffix = '', decimals = 0, duration = 1600 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - (1 - progress) ** 3;
          setValue(to * eased);
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, duration]);

  const formatted = value.toLocaleString('uk-UA', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <>
      <span ref={ref} aria-hidden="true">
        {formatted}
        {suffix}
      </span>
      <span className="visually-hidden">
        {to.toLocaleString('uk-UA')}
        {suffix}
      </span>
    </>
  );
}
