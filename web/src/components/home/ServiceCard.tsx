import Icon from '@/components/ui/Icon';
import type { Service } from '@/lib/types';
import styles from './Services.module.css';

export default function ServiceCard({ service, featured }: { service: Service; featured?: boolean }) {
  return (
    <article className={`${styles.card} ${featured ? styles.featured : ''}`}>
      <Icon name={`svc-${service.icon}`} size={80} className={styles.icon} />
      <div className={styles.body}>
        <h3 className={styles.title}>{service.title}</h3>
        <p className={styles.text}>{service.shortDescription}</p>
      </div>
    </article>
  );
}
