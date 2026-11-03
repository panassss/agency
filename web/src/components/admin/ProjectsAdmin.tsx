'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import SafeImage from '@/components/ui/SafeImage';
import type { Paginated, Project, Service } from '@/lib/types';
import { useApi } from '@/lib/useApi';
import { formatDate } from '@/lib/validation';
import CrudManager, { type FieldConfig } from './CrudManager';
import styles from './Admin.module.css';

const LIMIT = 10;

export default function ProjectsAdmin() {
  const services = useApi<Service[]>('/services');
  const [search, setSearch] = useState('');
  const [service, setService] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const projects = useApi<Paginated<Project>>('/projects', {
    search: search.trim(),
    service,
    sort,
    page,
    limit: LIMIT,
  });

  const fields: FieldConfig[] = [
    { name: 'title', label: 'Назва', required: true, min: 2, max: 120 },
    { name: 'subtitle', label: 'Підзаголовок', required: true, min: 2, max: 160 },
    {
      name: 'serviceId',
      label: 'Послуга',
      type: 'select',
      required: true,
      options: services.data?.map((s) => ({ value: s.id, label: s.title })),
    },
    { name: 'client', label: 'Клієнт', required: true, min: 2, max: 120 },
    { name: 'location', label: 'Локація', required: true, min: 2, max: 160 },
    { name: 'date', label: 'Дата', type: 'date', required: true },
    {
      name: 'coverImage',
      label: 'Обкладинка (шлях або URL)',
      required: true,
      max: 500,
      placeholder: '/img/projects/project-1.webp',
      full: true,
    },
    {
      name: 'gallery',
      label: 'Галерея (кожен шлях з нового рядка)',
      type: 'lines',
      placeholder: '/img/projects/gallery-1.webp',
    },
    { name: 'challenge', label: 'Завдання', type: 'textarea', required: true, min: 10, max: 5000 },
    { name: 'solution', label: 'Рішення', type: 'textarea', required: true, min: 10, max: 5000 },
    { name: 'result', label: 'Результат', type: 'textarea', required: true, min: 10, max: 5000 },
    { name: 'featured', label: 'Показувати на головній', type: 'checkbox' },
  ];

  const resetPage =
    <T,>(setter: (v: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  return (
    <CrudManager<Project>
      title="Проєкти"
      entityName="Проєкт"
      endpoint="/projects"
      items={projects.data?.items ?? null}
      loading={projects.loading}
      error={projects.error}
      reload={projects.reload}
      getLabel={(p) => p.title}
      fields={fields}
      toForm={(p) => ({
        title: p?.title ?? '',
        subtitle: p?.subtitle ?? '',
        serviceId: p ? String(p.serviceId) : '',
        client: p?.client ?? '',
        location: p?.location ?? '',
        date: p ? p.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        coverImage: p?.coverImage ?? '',
        gallery: p?.gallery.join('\n') ?? '',
        challenge: p?.challenge ?? '',
        solution: p?.solution ?? '',
        result: p?.result ?? '',
        featured: p?.featured ?? false,
      })}
      columns={[
        {
          header: 'Фото',
          render: (p) => <SafeImage src={p.coverImage} alt="" width={64} height={44} className={styles.thumb} />,
        },
        { header: 'Назва', render: (p) => <span className={styles.cellClamp}>{p.title}</span> },
        { header: 'Послуга', render: (p) => p.service?.title },
        { header: 'Клієнт', render: (p) => p.client },
        { header: 'Дата', render: (p) => formatDate(p.date) },
        { header: 'На головній', render: (p) => (p.featured ? 'Так' : '—') },
      ]}
      toolbar={
        <div className={styles.toolbar}>
          <label htmlFor="admin-project-search" className="visually-hidden">
            Пошук
          </label>
          <input
            id="admin-project-search"
            type="search"
            className={styles.input}
            placeholder="Пошук за назвою або клієнтом"
            value={search}
            onChange={(e) => resetPage(setSearch)(e.target.value)}
          />
          <label htmlFor="admin-project-service" className="visually-hidden">
            Послуга
          </label>
          <select
            id="admin-project-service"
            className={styles.select}
            value={service}
            onChange={(e) => resetPage(setService)(e.target.value)}
          >
            <option value="">Усі послуги</option>
            {services.data?.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
          <label htmlFor="admin-project-sort" className="visually-hidden">
            Сортування
          </label>
          <select
            id="admin-project-sort"
            className={styles.select}
            value={sort}
            onChange={(e) => resetPage(setSort)(e.target.value)}
          >
            <option value="newest">Спочатку нові</option>
            <option value="oldest">Спочатку старі</option>
            <option value="title">За назвою</option>
          </select>
        </div>
      }
      footer={
        projects.data &&
        projects.data.totalPages > 1 && (
          <div className={styles.pager}>
            <Button small variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              ← Назад
            </Button>
            <span>
              {page} / {projects.data.totalPages}
            </span>
            <Button
              small
              variant="outline"
              disabled={page >= projects.data.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Далі →
            </Button>
          </div>
        )
      }
    />
  );
}
