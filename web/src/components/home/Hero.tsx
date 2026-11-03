import Image from 'next/image';
import { RequestButton } from '@/components/layout/RequestModal';
import styles from './Hero.module.css';

const BRANDS = ['Greenish', 'Automation', 'Leafe', 'Mindfulness'];

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <div className={styles.text}>
            <h1 id="hero-title" className={styles.title}>
              Готові вивести <span className="accent">зростання бізнесу</span> на новий рівень?
            </h1>
            <p className={styles.lead}>
              Canvix поєднує стратегію, маркетинг, дизайн і технології, щоб ваша компанія зростала системно: більше
              клієнтів, сильніший бренд, прозорі процеси.
            </p>
          </div>
          <RequestButton variant="light" trial>
            Безкоштовна консультація
          </RequestButton>
        </div>

        <div className={styles.media}>
          <Image src="/img/hero-rings.svg" alt="" fill className={styles.rings} priority />
          <div className={styles.photo}>
            <Image
              src="/img/hero-team.webp"
              alt="Команда Canvix обговорює стратегію розвитку клієнта"
              width={550}
              height={550}
              sizes="(min-width: 1024px) 550px, 76vw"
              priority
            />
          </div>
        </div>

        <div className={styles.brands}>
          <p className={styles.brandsTitle}>Нам довіряють провідні бренди</p>
          <ul className={styles.brandList}>
            {BRANDS.map((brand, index) => (
              <li key={brand}>
                <span className={`${styles.brand} ${styles[`brand${index + 1}`]}`} role="img" aria-label={brand} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
