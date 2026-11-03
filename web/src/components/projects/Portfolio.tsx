'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Reveal from '@/components/ui/Reveal';
import { EmptyState, ErrorState, Loader, Skeleton } from '@/components/ui/Status';
import { api, ApiError, isAbortError } from '@/lib/api';
import type { Paginated, Project, Service } from '@/lib/types';
import { useApi } from '@/lib/useApi';
import ProjectCard from './ProjectCard';
import styles from './Portfolio.module.css';

const PAGE_SIZE = 6;
const SORTS = [
  { value: 'newest', label: 'Спочатку нові' },
  { value: 'oldest', label: 'Спочатку старі' },
  { value: 'title', label: 'За назвою (А–Я)' },
] as const;

type Sort = (typeof SORTS)[number]['value'];

interface ListState {
  /** filters the list was loaded for; differs from the current filters while loading */
  key: string | null;
  items: Project[];
  page: number;
  total: number;
  totalPages: number;
  error: string | null;
}

/** Portfolio list with search, filtering by service, sorting and "load more" pagination. State lives in the URL. */
export default function Portfolio() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const service = params.get('service') ?? '';
  const sort = (SORTS.some((s) => s.value === params.get('sort')) ? params.get('sort') : 'newest') as Sort;
  const search = params.get('search') ?? '';

  const services = useApi<Service[]>('/services');
  const [query, setQuery] = useState(search);
  const [attempt, setAttempt] = useState(0);
  const filtersKey = `${search}|${service}|${sort}|${attempt}`;
  const [list, setList] = useState<ListState>({ key: null, items: [], page: 1, total: 0, totalPages: 0, error: null });
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);
  const loading = list.key !== filtersKey;
  const error = loading ? null : list.error;

  const pendingQuery = useRef<string | null>(null);
  useEffect(() => {
    pendingQuery.current = null;
  }, [params]);

  const updateParams = (next: Record<string, string>) => {
    // Several filters can change before Next commits the previous URL update,
    // so merge into the latest requested query instead of the (possibly stale) `params`.
    const merged = new URLSearchParams(pendingQuery.current ?? params.toString());
    Object.entries(next).forEach(([key, value]) => (value ? merged.set(key, value) : merged.delete(key)));
    const qs = merged.toString();
    pendingQuery.current = qs;
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Debounce the search box so we don't hit the API on every keystroke.
  useEffect(() => {
    if (query === search) return;
    const timer = setTimeout(() => updateParams({ search: query.trim() }), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- updateParams is recreated on every render
  }, [query]);

  // First page is (re)loaded whenever the filters in the URL change.
  useEffect(() => {
    const controller = new AbortController();
    api<Paginated<Project>>('/projects', {
      query: { search, service, sort, page: 1, limit: PAGE_SIZE },
      signal: controller.signal,
    })
      .then((data) =>
        setList({
          key: filtersKey,
          items: data.items,
          page: 1,
          total: data.total,
          totalPages: data.totalPages,
          error: null,
        }),
      )
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        const message = err instanceof ApiError ? err.message : 'Не вдалося завантажити проєкти';
        setList({ key: filtersKey, items: [], page: 1, total: 0, totalPages: 0, error: message });
      });
    return () => controller.abort();
  }, [search, service, sort, filtersKey]);

  const loadMore = async () => {
    setLoadingMore(true);
    setMoreError(null);
    try {
      const nextPage = list.page + 1;
      const data = await api<Paginated<Project>>('/projects', {
        query: { search, service, sort, page: nextPage, limit: PAGE_SIZE },
      });
      setList((prev) => ({
        ...prev,
        items: [...prev.items, ...data.items],
        page: nextPage,
        total: data.total,
        totalPages: data.totalPages,
      }));
    } catch (err) {
      setMoreError(err instanceof ApiError ? err.message : 'Не вдалося завантажити ще проєкти');
    } finally {
      setLoadingMore(false);
    }
  };

  const { items } = list;
  const meta = loading ? null : { total: list.total, totalPages: list.totalPages };
  const hasMore = meta ? list.page < meta.totalPages : false;

  return (
    <section className="section container" aria-labelledby="portfolio-list-title">
      <h2 id="portfolio-list-title" className="visually-hidden">
        Список проєктів
      </h2>

      <div className={styles.toolbar}>
        <div className={styles.filters} role="group" aria-label="Фільтр за послугою">
          <button
            type="button"
            className={`${styles.chip} ${!service ? styles.chipActive : ''}`}
            aria-pressed={!service}
            onClick={() => updateParams({ service: '' })}
          >
            Усі
          </button>
          {services.data?.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.chip} ${service === s.slug ? styles.chipActive : ''}`}
              aria-pressed={service === s.slug}
              onClick={() => updateParams({ service: s.slug })}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className={styles.controls}>
          <div className={styles.search}>
            <label htmlFor="portfolio-search" className="visually-hidden">
              Пошук проєктів
            </label>
            <Icon name="search" size={20} />
            <input
              id="portfolio-search"
              type="search"
              className={styles.input}
              placeholder="Пошук за назвою або клієнтом"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={100}
            />
          </div>
          <label htmlFor="portfolio-sort" className="visually-hidden">
            Сортування
          </label>
          <select
            id="portfolio-sort"
            className={styles.select}
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value === 'newest' ? '' : e.target.value })}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {meta && !loading && !error && (
        <p className={styles.summary} aria-live="polite">
          Знайдено проєктів: {meta.total}
        </p>
      )}

      {error && <ErrorState message={error} onRetry={() => setAttempt((n) => n + 1)} />}

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} height={450} />
          ))}
        </div>
      ) : (
        !error &&
        (items.length === 0 ? (
          <EmptyState>
            <p>За вашим запитом нічого не знайдено.</p>
            <Button
              small
              variant="outline"
              onClick={() => {
                setQuery('');
                updateParams({ search: '', service: '' });
              }}
            >
              Скинути фільтри
            </Button>
          </EmptyState>
        ) : (
          <ul className={styles.grid}>
            {items.map((project, index) => (
              <li key={project.id}>
                <Reveal>
                  <ProjectCard project={project} showService priority={index < 2} />
                </Reveal>
              </li>
            ))}
          </ul>
        ))
      )}

      {loadingMore && <Loader label="Завантажуємо ще…" />}
      {moreError && <ErrorState message={moreError} onRetry={loadMore} />}
      {hasMore && !loading && !loadingMore && (
        <div className={styles.more}>
          <Button variant="outline" onClick={loadMore}>
            Показати ще
          </Button>
        </div>
      )}
    </section>
  );
}
