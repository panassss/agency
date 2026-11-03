'use client';

import { useMemo, useState } from 'react';
import RequestForm from '@/components/contact/RequestForm';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { EmptyState, ErrorState, Loader } from '@/components/ui/Status';
import StatusBadge from '@/components/ui/StatusBadge';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { REQUEST_STATUS_LABELS, type ClientRequest, type RequestStatus } from '@/lib/types';
import { useApi } from '@/lib/useApi';
import { formatDateTime } from '@/lib/validation';
import styles from './Account.module.css';

type Tab = 'ALL' | RequestStatus;
const TABS: Tab[] = ['ALL', 'NEW', 'IN_PROGRESS', 'DONE', 'CANCELLED'];

/** User's own applications: list with status tabs, create via modal, cancel while status is NEW. */
export default function MyRequests() {
  const { user } = useAuth();
  const { data, error, loading, reload, setData } = useApi<ClientRequest[]>('/requests/my');
  const [tab, setTab] = useState<Tab>('ALL');
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const counts = useMemo(() => {
    const result: Record<Tab, number> = { ALL: 0, NEW: 0, IN_PROGRESS: 0, DONE: 0, CANCELLED: 0 };
    data?.forEach((r) => {
      result.ALL += 1;
      result[r.status] += 1;
    });
    return result;
  }, [data]);

  const visible = data?.filter((r) => tab === 'ALL' || r.status === tab) ?? [];

  const cancel = async (request: ClientRequest) => {
    if (!window.confirm('Скасувати цю заявку?')) return;
    setActionError(null);
    setBusyId(request.id);
    try {
      const updated = await api<ClientRequest>(`/requests/${request.id}/cancel`, { method: 'PATCH' });
      setData((data ?? []).map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Не вдалося скасувати заявку');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className={`container ${styles.page}`} aria-labelledby="account-title">
      <div className={styles.head}>
        <div>
          <h1 id="account-title" className={styles.title}>
            Мої заявки
          </h1>
          <p className={styles.lead}>{user?.name}, тут ви можете відстежувати статус своїх звернень до Canvix.</p>
        </div>
        <Button trial onClick={() => setCreating(true)}>
          Нова заявка
        </Button>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="Фільтр за статусом">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'ALL' ? 'Усі' : REQUEST_STATUS_LABELS[t]}
            <span className={styles.count}>{counts[t]}</span>
          </button>
        ))}
      </div>

      {actionError && <Alert type="error">{actionError}</Alert>}
      {loading && <Loader />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && visible.length === 0 && (
        <EmptyState>
          <p>{tab === 'ALL' ? 'У вас ще немає заявок.' : 'Немає заявок з таким статусом.'}</p>
          {tab === 'ALL' && (
            <Button small onClick={() => setCreating(true)}>
              Залишити першу заявку
            </Button>
          )}
        </EmptyState>
      )}

      <ul className={styles.list} role="tabpanel">
        {visible.map((request) => (
          <li key={request.id} className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>
                Заявка №{request.id}
                {request.service ? ` · ${request.service.title}` : ''}
              </h2>
              <StatusBadge status={request.status} />
            </div>
            <p className={styles.meta}>
              Створено {formatDateTime(request.createdAt)} · {request.phone} · {request.email}
            </p>
            <p className={styles.message}>{request.message}</p>
            {request.status === 'NEW' && (
              <div className={styles.cardActions}>
                <Button small variant="outline" disabled={busyId === request.id} onClick={() => cancel(request)}>
                  {busyId === request.id ? 'Скасовуємо…' : 'Скасувати заявку'}
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <Modal open={creating} title="Нова заявка" onClose={() => setCreating(false)}>
        {creating && (
          <RequestForm
            onSuccess={(created) => {
              setData([created, ...(data ?? [])]);
              setTab('ALL');
              setCreating(false);
            }}
          />
        )}
      </Modal>
    </section>
  );
}
