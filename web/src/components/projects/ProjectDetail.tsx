'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RequestButton } from '@/components/layout/RequestModal';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Modal from '@/components/ui/Modal';
import SafeImage from '@/components/ui/SafeImage';
import SectionHeading from '@/components/ui/SectionHeading';
import { ErrorState, Loader } from '@/components/ui/Status';
import type { ProjectDetail as ProjectDetailData } from '@/lib/types';
import { useApi } from '@/lib/useApi';
import { formatDate } from '@/lib/validation';
import ProjectCard from './ProjectCard';
import styles from './ProjectDetail.module.css';

const BLOCKS = [
  { key: 'challenge', title: '01. Завдання' },
  { key: 'solution', title: '02. Рішення' },
  { key: 'result', title: '03. Результат' },
] as const;

export default function ProjectDetail({ slug }: { slug: string }) {
  const { data: project, error, loading, reload } = useApi<ProjectDetailData>(`/projects/${encodeURIComponent(slug)}`);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (project) document.title = `${project.title} — кейс | Canvix`;
  }, [project]);

  if (loading) {
    return (
      <>
        <h1 className="visually-hidden">Кейс агенції Canvix</h1>
        <Loader label="Завантажуємо проєкт…" />
      </>
    );
  }

  if (error || !project) {
    return (
      <section className="section container">
        <h1 className="visually-hidden">Проєкт не знайдено</h1>
        <ErrorState message={error ?? 'Проєкт не знайдено'} onRetry={reload} />
        <div className={styles.actions}>
          <Button href="/projects" variant="outline">
            ← Повернутися до портфоліо
          </Button>
        </div>
      </section>
    );
  }

  const gallery = project.gallery.filter(Boolean);
  const showImage = (step: number) =>
    setLightbox((i) => (i === null ? null : (i + step + gallery.length) % gallery.length));

  return (
    <>
      <section className={`container ${styles.hero}`} aria-labelledby="project-title">
        <div className={styles.cover}>
          <SafeImage
            src={project.coverImage}
            alt={`Обкладинка проєкту «${project.title}»`}
            fill
            sizes="(min-width: 1440px) 1400px, 100vw"
            priority
          />
        </div>
        <dl className={styles.meta}>
          <div className={styles.metaItem}>
            <dt>Категорія:</dt>
            <dd>
              <Link href={`/projects?service=${project.service.slug}`}>{project.service.title}</Link>
            </dd>
          </div>
          <div className={styles.metaItem}>
            <dt>Клієнт:</dt>
            <dd>{project.client}</dd>
          </div>
          <div className={styles.metaItem}>
            <dt>Дата:</dt>
            <dd>
              <time dateTime={project.date}>{formatDate(project.date)}</time>
            </dd>
          </div>
          <div className={styles.metaItem}>
            <dt>Локація:</dt>
            <dd>{project.location}</dd>
          </div>
        </dl>

        <header className={styles.header}>
          <nav aria-label="Навігаційний ланцюжок">
            <ol className={styles.breadcrumbs}>
              <li>
                <Link href="/">Головна</Link>
              </li>
              <li>
                <Link href="/projects">Портфоліо</Link>
              </li>
              <li aria-current="page">{project.title}</li>
            </ol>
          </nav>
          <h1 id="project-title" className={styles.title}>
            {project.title}
          </h1>
          <p className={styles.subtitle}>{project.subtitle}</p>
        </header>

        <div className={styles.body}>
          {BLOCKS.map(({ key, title }) =>
            project[key] ? (
              <section key={key} className={styles.block}>
                <h2 className={styles.blockTitle}>{title}</h2>
                <p className={styles.blockText}>{project[key]}</p>
              </section>
            ) : null,
          )}
        </div>

        {gallery.length > 0 && (
          <ul className={styles.gallery} aria-label="Галерея проєкту">
            {gallery.map((src, index) => (
              <li key={`${src}-${index}`}>
                <button
                  type="button"
                  className={styles.galleryItem}
                  onClick={() => setLightbox(index)}
                  aria-label={`Відкрити зображення ${index + 1} з ${gallery.length}`}
                >
                  <SafeImage src={src} alt="" fill sizes="(min-width: 1024px) 417px, 100vw" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.actions}>
          <RequestButton serviceId={project.serviceId} trial>
            Хочу такий самий результат
          </RequestButton>
          <Button href="/projects" variant="outline">
            Усі проєкти
          </Button>
        </div>
      </section>

      {project.related.length > 0 && (
        <section className="section container" aria-labelledby="related-title">
          <div className={styles.related}>
            <SectionHeading id="related-title" title="Схожі проєкти" center />
            <ul className={styles.relatedGrid}>
              {project.related.map((item) => (
                <li key={item.id}>
                  <ProjectCard
                    project={item}
                    square
                    sizes="(min-width: 1024px) 442px, (min-width: 640px) 50vw, 100vw"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <Modal
        open={lightbox !== null}
        title={`Зображення ${(lightbox ?? 0) + 1} з ${gallery.length}`}
        onClose={() => setLightbox(null)}
      >
        {lightbox !== null && (
          <div className={styles.lightbox}>
            <div className={styles.lightboxImage}>
              <SafeImage
                src={gallery[lightbox]}
                alt={`${project.title} — зображення ${lightbox + 1}`}
                fill
                sizes="640px"
              />
            </div>
            {gallery.length > 1 && (
              <div className={styles.lightboxNav}>
                <button
                  type="button"
                  className={styles.navButton}
                  onClick={() => showImage(-1)}
                  aria-label="Попереднє зображення"
                >
                  <Icon name="chevron-left" />
                </button>
                <button
                  type="button"
                  className={styles.navButton}
                  onClick={() => showImage(1)}
                  aria-label="Наступне зображення"
                >
                  <Icon name="chevron-right" />
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
