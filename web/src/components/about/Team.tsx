'use client';

import Icon, { type IconName } from '@/components/ui/Icon';
import Reveal from '@/components/ui/Reveal';
import SafeImage from '@/components/ui/SafeImage';
import SectionHeading from '@/components/ui/SectionHeading';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Status';
import type { TeamMember } from '@/lib/types';
import { useApi } from '@/lib/useApi';
import styles from './Team.module.css';

const SOCIAL_KEYS: { key: 'facebook' | 'instagram' | 'linkedin'; icon: IconName; label: string; w: number }[] = [
  { key: 'facebook', icon: 'social-facebook', label: 'Facebook', w: 9 },
  { key: 'instagram', icon: 'social-instagram', label: 'Instagram', w: 15 },
  { key: 'linkedin', icon: 'social-linkedin', label: 'LinkedIn', w: 15 },
];

export default function Team() {
  const { data, error, loading, reload } = useApi<TeamMember[]>('/team');

  return (
    <section className="section" aria-labelledby="team-title">
      <div className={`container ${styles.inner}`}>
        <SectionHeading id="team-title" title="Наша команда" center />
        {error && <ErrorState message={error} onRetry={reload} />}
        {data?.length === 0 && <EmptyState>Інформація про команду зʼявиться згодом.</EmptyState>}
        <ul className={styles.grid}>
          {loading &&
            Array.from({ length: 3 }, (_, i) => (
              <li key={i}>
                <Skeleton height={500} />
              </li>
            ))}
          {data?.map((member, index) => (
            <Reveal as="li" key={member.id} delay={index * 120}>
              <article className={styles.card}>
                <div className={styles.media}>
                  <SafeImage
                    src={member.photo}
                    alt={`${member.name}, ${member.position}`}
                    fill
                    sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
                  />
                  <ul className={styles.socials}>
                    {SOCIAL_KEYS.filter(({ key }) => member[key]).map(({ key, icon, label, w }) => (
                      <li key={key}>
                        <a
                          href={member[key] ?? '#'}
                          className={styles.social}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${label}: ${member.name}`}
                        >
                          <Icon name={icon} width={w} height={15} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={styles.info}>
                  <h3 className={styles.name}>{member.name}</h3>
                  <p className={styles.position}>{member.position}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
