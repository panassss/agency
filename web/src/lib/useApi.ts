'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, isAbortError } from './api';

interface State<T> {
  /** key of the request this state belongs to */
  key: string | null;
  data: T | null;
  error: string | null;
}

/** Loads data from the REST API on mount and whenever `path`/`query` change. */
export function useApi<T>(path: string | null, query?: Record<string, string | number | boolean | undefined>) {
  const [attempt, setAttempt] = useState(0);
  const queryKey = JSON.stringify(query ?? {});
  const key = path ? `${path}|${queryKey}|${attempt}` : null;
  const [state, setState] = useState<State<T>>({ key: null, data: null, error: null });

  useEffect(() => {
    if (!path || !key) return;
    const controller = new AbortController();
    api<T>(path, { query: JSON.parse(queryKey), signal: controller.signal })
      .then((data) => setState({ key, data, error: null }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        const message = error instanceof ApiError ? error.message : 'Не вдалося завантажити дані';
        setState({ key, data: null, error: message });
      });
    return () => controller.abort();
  }, [path, queryKey, key]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const setData = useCallback((data: T) => setState((s) => ({ ...s, data })), []);
  const loading = key !== null && state.key !== key;

  return { data: state.data, error: loading ? null : state.error, loading, reload, setData };
}
