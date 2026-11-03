'use client';

import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import { ErrorState, Loader } from '@/components/ui/Status';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Role, User } from '@/lib/types';
import { useApi } from '@/lib/useApi';
import { formatDate } from '@/lib/validation';
import styles from './Admin.module.css';

type UserRow = User & { _count?: { requests: number } };

export default function UsersAdmin() {
  const { user: me } = useAuth();
  const { data, loading, error, reload, setData } = useApi<UserRow[]>('/users');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const changeRole = async (user: UserRow, role: Role) => {
    try {
      const updated = await api<User>(`/users/${user.id}/role`, { method: 'PATCH', body: { role } });
      setData((data ?? []).map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
      setNotice({ type: 'success', text: `${user.name}: роль змінено на ${role}` });
    } catch (err) {
      setNotice({ type: 'error', text: err instanceof ApiError ? err.message : 'Не вдалося змінити роль' });
    }
  };

  return (
    <section aria-labelledby="users-title">
      <div className={styles.head}>
        <h1 id="users-title" className={styles.title}>
          Користувачі
        </h1>
      </div>
      {notice && <Alert type={notice.type}>{notice.text}</Alert>}
      {loading && <Loader />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Імʼя</th>
                <th scope="col">Email</th>
                <th scope="col">Заявок</th>
                <th scope="col">Зареєстровано</th>
                <th scope="col">Роль</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u._count?.requests ?? 0}</td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <label htmlFor={`role-${u.id}`} className="visually-hidden">
                      Роль користувача {u.name}
                    </label>
                    <select
                      id={`role-${u.id}`}
                      className={styles.select}
                      value={u.role}
                      disabled={u.id === me?.id}
                      onChange={(e) => changeRole(u, e.target.value as Role)}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
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
