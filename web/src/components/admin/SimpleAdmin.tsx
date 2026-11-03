'use client';

import SafeImage from '@/components/ui/SafeImage';
import type { Service, TeamMember, Testimonial } from '@/lib/types';
import { useApi } from '@/lib/useApi';
import CrudManager from './CrudManager';
import styles from './Admin.module.css';

const ICONS = [
  { value: 'content', label: 'Контент (перо)' },
  { value: 'graphic', label: 'Графіка (перо дизайнера)' },
  { value: 'digital', label: 'Діджитал (мегафон)' },
  { value: 'web', label: 'Веб (палітра)' },
  { value: 'it', label: 'IT (людина)' },
  { value: 'brand', label: 'Бренд (діамант)' },
];

export function ServicesAdmin() {
  const { data, loading, error, reload } = useApi<Service[]>('/services');
  return (
    <CrudManager<Service>
      title="Послуги"
      entityName="Послуга"
      endpoint="/services"
      items={data}
      loading={loading}
      error={error}
      reload={reload}
      getLabel={(s) => s.title}
      fields={[
        { name: 'title', label: 'Назва', required: true, min: 2, max: 80 },
        { name: 'icon', label: 'Іконка', type: 'select', required: true, options: ICONS },
        { name: 'order', label: 'Порядок сортування', type: 'number' },
        {
          name: 'shortDescription',
          label: 'Короткий опис (для картки)',
          type: 'textarea',
          required: true,
          min: 10,
          max: 300,
        },
        { name: 'description', label: 'Повний опис', type: 'textarea', required: true, min: 10, max: 5000 },
      ]}
      toForm={(s) => ({
        title: s?.title ?? '',
        icon: s?.icon ?? '',
        order: s ? String(s.order) : '',
        shortDescription: s?.shortDescription ?? '',
        description: s?.description ?? '',
      })}
      columns={[
        { header: '№', render: (s) => s.order },
        { header: 'Назва', render: (s) => s.title },
        { header: 'Опис', render: (s) => <span className={styles.cellClamp}>{s.shortDescription}</span> },
        { header: 'Slug', render: (s) => s.slug },
      ]}
    />
  );
}

export function TeamAdmin() {
  const { data, loading, error, reload } = useApi<TeamMember[]>('/team');
  return (
    <CrudManager<TeamMember>
      title="Команда"
      entityName="Учасник команди"
      endpoint="/team"
      items={data}
      loading={loading}
      error={error}
      reload={reload}
      getLabel={(m) => m.name}
      fields={[
        { name: 'name', label: 'Імʼя', required: true, min: 2, max: 60 },
        { name: 'position', label: 'Посада', required: true, min: 2, max: 80 },
        { name: 'photo', label: 'Фото (шлях або URL)', required: true, max: 500, placeholder: '/img/team/team-1.webp' },
        { name: 'order', label: 'Порядок', type: 'number' },
        { name: 'facebook', label: 'Facebook', type: 'url' },
        { name: 'instagram', label: 'Instagram', type: 'url' },
        { name: 'linkedin', label: 'LinkedIn', type: 'url' },
      ]}
      toForm={(m) => ({
        name: m?.name ?? '',
        position: m?.position ?? '',
        photo: m?.photo ?? '',
        order: m ? String(m.order) : '',
        facebook: m?.facebook ?? '',
        instagram: m?.instagram ?? '',
        linkedin: m?.linkedin ?? '',
      })}
      columns={[
        {
          header: 'Фото',
          render: (m) => <SafeImage src={m.photo} alt="" width={64} height={44} className={styles.thumb} />,
        },
        { header: 'Імʼя', render: (m) => m.name },
        { header: 'Посада', render: (m) => m.position },
        { header: 'Порядок', render: (m) => m.order },
      ]}
    />
  );
}

export function TestimonialsAdmin() {
  const { data, loading, error, reload } = useApi<Testimonial[]>('/testimonials');
  return (
    <CrudManager<Testimonial>
      title="Відгуки"
      entityName="Відгук"
      endpoint="/testimonials"
      items={data}
      loading={loading}
      error={error}
      reload={reload}
      getLabel={(t) => t.author}
      fields={[
        { name: 'author', label: 'Автор', required: true, min: 2, max: 60 },
        { name: 'position', label: 'Посада / компанія', required: true, min: 2, max: 80 },
        {
          name: 'avatar',
          label: 'Аватар (шлях або URL)',
          required: true,
          max: 500,
          placeholder: '/img/testimonials/avatar-1.webp',
          full: true,
        },
        { name: 'quote', label: 'Текст відгуку', type: 'textarea', required: true, min: 10, max: 600 },
      ]}
      toForm={(t) => ({
        author: t?.author ?? '',
        position: t?.position ?? '',
        avatar: t?.avatar ?? '',
        quote: t?.quote ?? '',
      })}
      columns={[
        {
          header: 'Фото',
          render: (t) => <SafeImage src={t.avatar} alt="" width={44} height={44} className={styles.thumb} />,
        },
        { header: 'Автор', render: (t) => t.author },
        { header: 'Відгук', render: (t) => <span className={styles.cellClamp}>{t.quote}</span> },
      ]}
    />
  );
}
