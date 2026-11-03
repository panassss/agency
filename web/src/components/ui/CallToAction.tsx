import { RequestButton } from '@/components/layout/RequestModal';
import styles from './CallToAction.module.css';

export default function CallToAction({ outline }: { outline?: boolean }) {
  return (
    <section className="section container" aria-labelledby="cta-title">
      <div className={styles.cta}>
        <h2 id="cta-title" className={styles.title}>
          Досить слів — час діяти
        </h2>
        <RequestButton variant={outline ? 'outline' : 'light'}>Звʼязатися</RequestButton>
      </div>
    </section>
  );
}
