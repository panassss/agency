'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { EmptyState, ErrorState, Loader } from '@/components/ui/Status';
import StatusBadge from '@/components/ui/StatusBadge';
import { api, ApiError } from '@/lib/api';
import { REQUEST_STATUS_LABELS, type ClientRequest, type Paginated, type RequestStatus } from '@/lib/types';
import { useApi } from '@/lib/useApi';
import { formatDateTime } from '@/lib/validation';
import styles from './Admin.module.css';

const STATUSES = Object.keys(REQUEST_STATUS_LABELS) as RequestStatus[];
const LIMIT = 10;

/** Applications from clients: search, filter by status, change status, view details and delete. */
export default function RequestsAdmin() {
  const params = useSearchParams();
  const initialStatus = params.get('status') ?? '';
  const [status, setStatus] = useState(STATUSES.includes(initialStatus as RequestStatus) ? initialStatus : '');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ClientRequest | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { data, loading, error, reload, setData } = useApi<Paginated<ClientRequest>>('/requests', {
    status,
    search: debounced,
    page,
    limit: LIMIT,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const changeStatus = async (request: ClientRequest, next: RequestStatus) => {
    try {
      const updated = await api<ClientRequest>(`/requests/${request.id}`, { method: 'PATCH', body: { status: next } });
      if (data) setData({ ...data, items: data.items.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)) });
      setNotice({ type: 'success', text: `Заявка №${request.id}: статус «${REQUEST_STATUS_LABELS[next]}»` });
    } catch (err) {
      setNotice({ type: 'error', text: err instanceof ApiError ? err.message : 'Не вдалося змінити статус' });
    }
  };

  const remove = async (request: ClientRequest) => {
    if (!window.confirm(`Видалити заявку №${request.id}?`)) return;
    try {
      await api(`/requests/${request.id}`, { method: 'DELETE' });
      setSelected(null);
      setNotice({ type: 'success', text: `Заявку №${request.id} видалено` });
      reload();
    } catch (err) {
      setNotice({ type: 'error', text: err instanceof ApiError ? err.message : 'Не вдалося видалити' });
    }
  };

  return (
    <section aria-labelledby="requests-title">
      <div className={styles.head}>
        <h1 id="requests-title" className={styles.title}>
          Заявки
        </h1>
      </div>

      <div className={styles.toolbar}>
        <label htmlFor="req-search" className="visually-hidden">
          Пошук заявок
        </label>
        <input
          id="req-search"
          type="search"
          className={styles.input}
          placeholder="Пошук: імʼя, email, телефон"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label htmlFor="req-status" className="visually-hidden">
          Статус
        </label>
        <select
          id="req-status"
          className={styles.select}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Усі статуси</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {REQUEST_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {notice && <Alert type={notice.type}>{notice.text}</Alert>}
      {loading && <Loader />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && data.items.length === 0 && <EmptyState>Заявок не знайдено.</EmptyState>}

      {data && data.items.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">№</th>
                <th scope="col">Клієнт</th>
                <th scope="col">Контакти</th>
                <th scope="col">Послуга</th>
                <th scope="col">Дата</th>
                <th scope="col">Статус</th>
                <th scope="col">
                  <span className="visually-hidden">Дії</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>
                    {r.firstName} {r.lastName}
                    {r.userId ? <span className={styles.muted}> (акаунт)</span> : null}
                  </td>
                  <td>
                    <span className={styles.contacts}>
                      <span>{r.email}</span>
                      <span>{r.phone}</span>
                    </span>
                  </td>
                  <td>{r.service?.title ?? '—'}</td>
                  <td>{formatDateTime(r.createdAt)}</td>
                  <td>
                    <label htmlFor={`status-${r.id}`} className="visually-hidden">
                      Статус заявки №{r.id}
                    </label>
                    <select
                      id={`status-${r.id}`}
                      className={styles.select}
                      value={r.status}
                      onChange={(e) => changeStatus(r, e.target.value as RequestStatus)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {REQUEST_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button type="button" className={styles.linkButton} onClick={() => setSelected(r)}>
                        Деталі
                      </button>
                      <button
                        type="button"
                        className={`${styles.linkButton} ${styles.danger}`}
                        onClick={() => remove(r)}
                      >
                        Видалити
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className={styles.pager}>
          <Button small variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ← Назад
          </Button>
          <span>
            {page} / {data.totalPages}
          </span>
          <Button small variant="outline" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
            Далі →
          </Button>
        </div>
      )}

      <Modal open={selected !== null} title={`Заявка №${selected?.id ?? ''}`} onClose={() => setSelected(null)}>
        {selected && (
          <div className={styles.form}>
            <StatusBadge status={selected.status} />
            <p>
              <strong>
                {selected.firstName} {selected.lastName}
              </strong>{' '}
              · <a href={`mailto:${selected.email}`}>{selected.email}</a> ·{' '}
              <a href={`tel:${selected.phone}`}>{selected.phone}</a>
            </p>
            <p>Послуга: {selected.service?.title ?? 'не вказана'}</p>
            <p>Створено: {formatDateTime(selected.createdAt)}</p>
            <p className={styles.messageText}>{selected.message}</p>
          </div>
        )}
      </Modal>
    </section>
  );
}
