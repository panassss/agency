'use client';

import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Status';
import type { Service } from '@/lib/types';
import { useApi } from '@/lib/useApi';
import ServiceCard from './ServiceCard';
import styles from './Services.module.css';

export default function Services() {
  const { data, error, loading, reload } = useApi<Service[]>('/services');

  return (
    <section className="section" aria-labelledby="services-title">
      <div className={`container ${styles.inner}`}>
        <SectionHeading
          id="services-title"
          eyebrow="Наші послуги"
          title="Послуги, що дають результат вашому бізнесу"
          center
        />

        {error && <ErrorState message={error} onRetry={reload} />}
        {!error && data?.length === 0 && <EmptyState>Послуги скоро зʼявляться.</EmptyState>}

        <ul className={styles.grid}>
          {loading &&
            Array.from({ length: 6 }, (_, i) => (
              <li key={i}>
                <Skeleton height={340} />
              </li>
            ))}
          {data?.map((service, index) => (
            <Reveal as="li" key={service.id} delay={(index % 3) * 100}>
              <ServiceCard service={service} featured={index === 0} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
