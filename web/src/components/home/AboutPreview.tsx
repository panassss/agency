import Image from 'next/image';
import { RequestButton } from '@/components/layout/RequestModal';
import Counter from '@/components/ui/Counter';
import Reveal from '@/components/ui/Reveal';
import styles from './AboutPreview.module.css';

const STATS = [
  { value: 330, suffix: '+', label: 'Компаній отримали результат' },
  { value: 230, suffix: ' млн ₴', label: 'Додаткового доходу клієнтів' },
];

export default function AboutPreview() {
  return (
    <section className={styles.section} aria-labelledby="about-preview-title">
      <div className={`container ${styles.inner}`}>
        <Reveal className={styles.stack}>
          <div className={`${styles.layer} ${styles.back}`}>
            <Image
              src="/img/about/stack-back.webp"
              alt=""
              width={640}
              height={640}
              sizes="(min-width: 1024px) 640px, 86vw"
            />
          </div>
          <div className={`${styles.layer} ${styles.middle}`}>
            <Image
              src="/img/about/stack-middle.webp"
              alt=""
              width={640}
              height={640}
              sizes="(min-width: 1024px) 640px, 86vw"
            />
          </div>
          <div className={`${styles.layer} ${styles.front}`}>
            <Image
              src="/img/about/stack-front.webp"
              alt="Команда Canvix в офісі під час робочої сесії"
              width={640}
              height={640}
              sizes="(min-width: 1024px) 640px, 86vw"
            />
          </div>
        </Reveal>

        <div className={styles.content}>
          <div className={styles.text}>
            <p className={styles.eyebrow}>Про нас</p>
            <h2 id="about-preview-title" className={styles.title}>
              Наша місія — ваш стабільний ріст
            </h2>
            <p className={styles.lead}>
              Ми не продаємо окремі послуги — ми будуємо систему розвитку: аналізуємо бізнес, знаходимо точки зростання
              і супроводжуємо впровадження до вимірюваного результату.
            </p>
            <dl className={styles.stats}>
              {STATS.map((stat) => (
                <div key={stat.label} className={styles.stat}>
                  <dt className={styles.statValue}>
                    <Counter to={stat.value} suffix={stat.suffix} />
                  </dt>
                  <dd className={styles.statLabel}>{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <RequestButton variant="light" trial>
            Отримати аудит безкоштовно
          </RequestButton>
        </div>
      </div>
    </section>
  );
}
