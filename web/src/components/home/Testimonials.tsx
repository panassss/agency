'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/Icon';
import SafeImage from '@/components/ui/SafeImage';
import { ErrorState, Skeleton } from '@/components/ui/Status';
import type { Testimonial } from '@/lib/types';
import { useApi } from '@/lib/useApi';
import styles from './Testimonials.module.css';

const AUTOPLAY_MS = 7000;
const SWIPE_THRESHOLD = 50;

/** Testimonials slider: arrows, dots, keyboard, swipe and autoplay that pauses on hover/focus. */
export default function Testimonials() {
  const { data, error, loading, reload } = useApi<Testimonial[]>('/testimonials');
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const count = data?.length ?? 0;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, count]);

  const onPointerDown = (event: React.PointerEvent) => {
    pointerStart.current = event.clientX;
  };

  const onPointerUp = (event: React.PointerEvent) => {
    if (pointerStart.current === null) return;
    const delta = event.clientX - pointerStart.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) go(index + (delta < 0 ? 1 : -1));
    pointerStart.current = null;
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') go(index + 1);
    if (event.key === 'ArrowLeft') go(index - 1);
  };

  return (
    <section className="section" aria-labelledby="testimonials-title">
      <div className="container">
        <h2 id="testimonials-title" className="visually-hidden">
          Відгуки клієнтів
        </h2>
        {loading && <Skeleton height={420} />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {data && count > 0 && (
          <div
            className={styles.card}
            role="region"
            aria-roledescription="карусель"
            aria-label="Карусель відгуків"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            <div className={styles.viewport}>
              <div
                className={styles.track}
                style={{ transform: `translateX(-${index * 100}%)` }}
                aria-live={paused ? 'polite' : 'off'}
              >
                {data.map((item, i) => (
                  <figure
                    key={item.id}
                    className={styles.slide}
                    role="group"
                    aria-roledescription="слайд"
                    aria-label={`${i + 1} з ${count}`}
                    aria-hidden={i !== index}
                  >
                    <SafeImage
                      src={item.avatar}
                      alt={`Фото: ${item.author}`}
                      width={150}
                      height={150}
                      className={styles.avatar}
                    />
                    <blockquote className={styles.quote}>
                      <p>«{item.quote}»</p>
                    </blockquote>
                    <figcaption className={styles.author}>
                      <cite className={styles.name}>{item.author}</cite>
                      <span className={styles.position}>{item.position}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>

            {count > 1 && (
              <>
                <div className={styles.controls}>
                  <button
                    type="button"
                    className={styles.control}
                    onClick={() => go(index - 1)}
                    aria-label="Попередній відгук"
                  >
                    <Icon name="chevron-left" />
                  </button>
                  <button
                    type="button"
                    className={styles.control}
                    onClick={() => go(index + 1)}
                    aria-label="Наступний відгук"
                  >
                    <Icon name="chevron-right" />
                  </button>
                </div>
                <div className={styles.dots}>
                  {data.map((item, i) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
                      onClick={() => go(i)}
                      aria-label={`Відгук ${i + 1}`}
                      aria-current={i === index}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
