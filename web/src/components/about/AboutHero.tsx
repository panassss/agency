import Image from 'next/image';
import Icon from '@/components/ui/Icon';
import styles from './AboutHero.module.css';

export default function AboutHero() {
  return (
    <section className={`container ${styles.hero}`} aria-labelledby="about-title">
      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.text}>
            <p className={styles.eyebrow}>Агенція комплексного розвитку бізнесу</p>
            <h1 id="about-title" className={styles.title}>
              Готові вивести <span className="accent">ваш бізнес</span> на новий рівень?
            </h1>
            <p className={styles.lead}>
              З 2016 року Canvix допомагає українським компаніям зростати: від стартапів до виробників із сотнями
              працівників. Ми беремо відповідальність за результат, а не лише за процес.
            </p>
          </div>
          <div className={styles.rating}>
            <Image
              src="/img/about/rated-avatar.webp"
              alt="Фото клієнта, що оцінив агенцію"
              width={70}
              height={70}
              className={styles.ratingAvatar}
            />
            <div className={styles.ratingText}>
              <span>Рейтинг 4.9/5</span>
              <span className={styles.stars} role="img" aria-label="5 зірок з 5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Icon key={i} name="star" size={20} />
                ))}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.stack}>
          <div className={`${styles.layer} ${styles.layerBack}`}>
            <Image src="/img/about/stack-back.webp" alt="" width={568} height={614} sizes="568px" priority />
          </div>
          <div className={`${styles.layer} ${styles.layerMiddle}`}>
            <Image src="/img/about/stack-middle.webp" alt="" width={568} height={614} sizes="568px" priority />
          </div>
          <div className={`${styles.layer} ${styles.layerFront}`}>
            <Image
              src="/img/about/about-hero.webp"
              alt="Стратег Canvix проводить воркшоп для команди клієнта"
              width={568}
              height={614}
              sizes="(min-width: 1024px) 568px, 80vw"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
