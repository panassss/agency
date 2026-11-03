'use client';

import ProjectCard from '@/components/projects/ProjectCard';
import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Status';
import type { Paginated, Project } from '@/lib/types';
import { useApi } from '@/lib/useApi';
import styles from './Showcase.module.css';

export default function Showcase() {
  const { data, error, loading, reload } = useApi<Paginated<Project>>('/projects', { featured: true, limit: 4 });

  return (
    <section className="section" aria-labelledby="showcase-title">
      <div className={`container ${styles.inner}`}>
        <SectionHeading id="showcase-title" title="Останні кейси" center />
        <div className={styles.cta}>
          <Button href="/projects" trial>
            Усі проєкти
          </Button>
        </div>

        {error && <ErrorState message={error} onRetry={reload} />}
        {data?.items.length === 0 && <EmptyState>Кейси зʼявляться найближчим часом.</EmptyState>}

        <ul className={styles.grid}>
          {loading &&
            Array.from({ length: 4 }, (_, i) => (
              <li key={i}>
                <Skeleton height={450} />
              </li>
            ))}
          {data?.items.map((project) => (
            <li key={project.id}>
              <Reveal>
                <ProjectCard project={project} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
