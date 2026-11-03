'use client';

import Link from 'next/link';
import { ErrorState, Loader } from '@/components/ui/Status';
import StatusBadge from '@/components/ui/StatusBadge';
import type { AdminStats, ClientRequest, Paginated } from '@/lib/types';
import { useApi } from '@/lib/useApi';
import { formatDateTime } from '@/lib/validation';
import styles from './Admin.module.css';

export default function Dashboard() {
  const stats = useApi<AdminStats>('/admin/stats');
  const latest = useApi<Paginated<ClientRequest>>('/requests', { limit: 5 });

  const cards = stats.data
    ? [
        { label: 'Нових заявок', value: stats.data.requests.NEW, href: '/admin/requests?status=NEW' },
        {
          label: 'Заявок у роботі',
          value: stats.data.requests.IN_PROGRESS,
          href: '/admin/requests?status=IN_PROGRESS',
        },
        { label: 'Усього заявок', value: stats.data.requests.total, href: '/admin/requests' },
        { label: 'Проєктів', value: stats.data.projects, href: '/admin/projects' },
        { label: 'Послуг', value: stats.data.services, href: '/admin/services' },
        { label: 'Користувачів', value: stats.data.users, href: '/admin/users' },
        { label: 'Підписників', value: stats.data.subscribers, href: '/admin/subscribers' },
      ]
    : [];

  return (
    <section aria-labelledby="dashboard-title">
      <div className={styles.head}>
        <h1 id="dashboard-title" className={styles.title}>
          Огляд
        </h1>
      </div>
      {stats.loading && <Loader />}
      {stats.error && <ErrorState message={stats.error} onRetry={stats.reload} />}
      <ul className={styles.stats}>
        {cards.map((card) => (
          <li key={card.label}>
            <Link href={card.href} className={styles.stat}>
              <span className={styles.statValue}>{card.value}</span>
              <span className={styles.statLabel}>{card.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className={styles.sectionTitle}>Останні заявки</h2>
      {latest.error && <ErrorState message={latest.error} onRetry={latest.reload} />}
      {latest.data && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">№</th>
                <th scope="col">Клієнт</th>
                <th scope="col">Послуга</th>
                <th scope="col">Дата</th>
                <th scope="col">Статус</th>
              </tr>
            </thead>
            <tbody>
              {latest.data.items.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>
                    {r.firstName} {r.lastName}
                  </td>
                  <td>{r.service?.title ?? '—'}</td>
                  <td>{formatDateTime(r.createdAt)}</td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
