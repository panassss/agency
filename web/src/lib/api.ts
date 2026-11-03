const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const TOKEN_KEY = 'canvix_token';
const REQUEST_TIMEOUT_MS = 60_000;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage can be unavailable (private mode); the session then lives only in memory.
  }
}

function errorMessage(status: number, body: unknown): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const { message } = body as { message: unknown };
    if (Array.isArray(message)) return message.join('. ');
    if (typeof message === 'string') return message;
  }
  if (status === 401) return 'Потрібно увійти в обліковий запис';
  if (status === 403) return 'Недостатньо прав для цієї дії';
  if (status === 404) return 'Дані не знайдено';
  if (status >= 500) return 'Помилка сервера. Спробуйте пізніше';
  return 'Не вдалося виконати запит';
}

type Query = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Query;
  signal?: AbortSignal;
}

export async function api<T>(path: string, { method = 'GET', body, query, signal }: RequestOptions = {}): Promise<T> {
  const url = new URL(`${API_URL}/api${path}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  });

  const headers: HeadersInit = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  // The free Render instance may need up to a minute to wake up, hence the generous timeout.
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combinedSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: combinedSignal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError('Немає зʼєднання з сервером. Перевірте інтернет і спробуйте ще раз', 0);
  }

  if (response.status === 204) return undefined as T;

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(errorMessage(response.status, data), response.status);
  return data as T;
}

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function resolveImage(src: string | null | undefined, fallback = '/img/placeholder.svg') {
  return src && src.trim() ? src : fallback;
}
