'use client';

import { EmptyState, ErrorState, Loader } from '@/components/ui/Status';
import { useApi } from '@/lib/useApi';
import { formatDateTime } from '@/lib/validation';
import styles from './Admin.module.css';

interface Subscriber {
  id: number;
  email: string;
  createdAt: string;
}

export default function SubscribersAdmin() {
  const { data, loading, error, reload } = useApi<Subscriber[]>('/subscribers');
  return (
    <section aria-labelledby="subs-title">
      <div className={styles.head}>
        <h1 id="subs-title" className={styles.title}>
          Підписники розсилки
        </h1>
      </div>
      {loading && <Loader />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data?.length === 0 && <EmptyState>Підписників поки немає.</EmptyState>}
      {data && data.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Email</th>
                <th scope="col">Дата підписки</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.id}>
                  <td>{s.email}</td>
                  <td>{formatDateTime(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
